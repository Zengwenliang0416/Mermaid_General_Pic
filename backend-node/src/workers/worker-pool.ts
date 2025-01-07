import { Worker } from 'worker_threads';
import path from 'path';
import os from 'os';
import { logWithContext, logSystemEvent, logPerformance } from '../utils/logger';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    task: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    startTime?: number;
  }> = [];
  private busyWorkers = new Set<Worker>();
  private idleTimers = new Map<Worker, NodeJS.Timeout>();
  private maxConcurrent: number;
  private idleTimeout: number;
  private workerIds = new Map<Worker, string>();
  private taskIds = new Map<Worker, string>();

  constructor(
    private workerScript: string, 
    poolSize = Math.max(2, Math.min(os.cpus().length - 1, 8)),
    idleTimeoutMs = 30000
  ) {
    this.maxConcurrent = poolSize;
    this.idleTimeout = idleTimeoutMs;
    
    logSystemEvent('Worker pool initialized', {
      maxWorkers: this.maxConcurrent,
      idleTimeout: this.idleTimeout,
      script: this.workerScript
    });
    
    this.initialize();
  }

  private initialize() {
    // 初始时只创建一个 worker
    this.createWorker();
  }

  private createWorker() {
    if (this.workers.length >= this.maxConcurrent) {
      return null;
    }

    const workerId = Math.random().toString(36).substring(7);
    const workerPath = path.join(__dirname, this.workerScript.replace('.ts', '.js'));
    const worker = new Worker(workerPath);
    
    this.workers.push(worker);
    this.workerIds.set(worker, workerId);

    logSystemEvent('Worker created', {
      workerId,
      totalWorkers: this.workers.length,
      maxWorkers: this.maxConcurrent
    });

    worker.on('message', (result) => {
      const taskId = this.taskIds.get(worker);
      this.busyWorkers.delete(worker);
      this.resetIdleTimer(worker);
      
      logWithContext('debug', 'Worker completed task', {
        workerId,
        taskId,
        success: result.success,
        error: result.error
      });
      
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!;
        this.runTask(worker, nextTask);
      }
    });

    worker.on('error', (error) => {
      const taskId = this.taskIds.get(worker);
      logWithContext('error', 'Worker error occurred', {
        workerId,
        taskId,
        error: error.message,
        stack: error.stack
      });
      this.removeWorker(worker);
    });

    worker.on('exit', (code) => {
      logSystemEvent('Worker exited', {
        workerId,
        code,
        remaining: this.workers.length
      });
    });

    return worker;
  }

  private resetIdleTimer(worker: Worker) {
    const workerId = this.workerIds.get(worker);
    // 清除现有的定时器
    const existingTimer = this.idleTimers.get(worker);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的定时器
    if (this.workers.length > 1) { // 保持至少一个 worker
      const timer = setTimeout(() => {
        logSystemEvent('Worker idle timeout', {
          workerId,
          idleTime: this.idleTimeout
        });
        this.removeWorker(worker);
      }, this.idleTimeout);
      this.idleTimers.set(worker, timer);
    }
  }

  private removeWorker(worker: Worker) {
    const workerId = this.workerIds.get(worker);
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      this.busyWorkers.delete(worker);
      this.workerIds.delete(worker);
      this.taskIds.delete(worker);
      
      const timer = this.idleTimers.get(worker);
      if (timer) {
        clearTimeout(timer);
        this.idleTimers.delete(worker);
      }
      
      worker.terminate();
      
      logSystemEvent('Worker removed', {
        workerId,
        remainingWorkers: this.workers.length,
        queueSize: this.queue.length
      });
    }
  }

  private runTask(worker: Worker, task: any) {
    const workerId = this.workerIds.get(worker);
    const taskId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    
    this.taskIds.set(worker, taskId);
    const { task: data, resolve, reject } = task;
    this.busyWorkers.add(worker);

    logWithContext('debug', 'Starting worker task', {
      workerId,
      taskId,
      queueSize: this.queue.length,
      activeWorkers: this.busyWorkers.size
    });

    worker.once('message', (result) => {
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logPerformance('worker-task-duration', duration, {
          workerId,
          taskId,
          success: result.success
        });
      }

      if (result.success) {
        logWithContext('debug', 'Worker task completed', {
          workerId,
          taskId,
          duration
        });
        resolve(result);
      } else {
        logWithContext('error', 'Worker task failed', {
          workerId,
          taskId,
          error: result.error,
          duration
        });
        reject(new Error(result.error));
      }
    });

    worker.postMessage(data);
  }

  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !this.busyWorkers.has(w));
      const queueStartTime = Date.now();

      if (availableWorker) {
        this.runTask(availableWorker, { task, resolve, reject, startTime: queueStartTime });
      } else if (this.workers.length < this.maxConcurrent) {
        // 如果没有可用的 worker 但还能创建新的，就创建一个
        logSystemEvent('Creating new worker for task', {
          currentWorkers: this.workers.length,
          maxWorkers: this.maxConcurrent,
          queueSize: this.queue.length
        });
        
        const newWorker = this.createWorker();
        if (newWorker) {
          this.runTask(newWorker, { task, resolve, reject, startTime: queueStartTime });
          return;
        }
        this.queue.push({ task, resolve, reject, startTime: queueStartTime });
      } else {
        logWithContext('debug', 'Task queued, all workers busy', {
          queueSize: this.queue.length + 1,
          activeWorkers: this.busyWorkers.size
        });
        this.queue.push({ task, resolve, reject, startTime: queueStartTime });
      }
    });
  }

  terminate() {
    logSystemEvent('Worker pool terminating', {
      totalWorkers: this.workers.length,
      activeWorkers: this.busyWorkers.size,
      queueSize: this.queue.length
    });

    for (const worker of this.workers) {
      const workerId = this.workerIds.get(worker);
      const timer = this.idleTimers.get(worker);
      if (timer) {
        clearTimeout(timer);
      }
      worker.terminate();
      
      logSystemEvent('Worker terminated', {
        workerId
      });
    }
    
    this.workers = [];
    this.busyWorkers.clear();
    this.idleTimers.clear();
    this.workerIds.clear();
    this.taskIds.clear();
    
    logSystemEvent('Worker pool terminated');
  }
} 