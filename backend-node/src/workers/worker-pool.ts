import { Worker } from 'worker_threads';
import path from 'path';
import os from 'os';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    task: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private busyWorkers = new Set<Worker>();

  constructor(private workerScript: string, private poolSize = os.cpus().length) {
    this.initialize();
  }

  private initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const workerPath = path.join(__dirname, this.workerScript.replace('.ts', '.js'));
      const worker = new Worker(workerPath);
      this.workers.push(worker);

      worker.on('message', (result) => {
        this.busyWorkers.delete(worker);
        
        if (this.queue.length > 0) {
          const nextTask = this.queue.shift()!;
          this.runTask(worker, nextTask);
        }
      });

      worker.on('error', (error) => {
        console.error(`Worker error:`, error);
      });
    }
  }

  private runTask(worker: Worker, task: any) {
    const { task: data, resolve, reject } = task;
    this.busyWorkers.add(worker);

    worker.once('message', (result) => {
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.postMessage(data);
  }

  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !this.busyWorkers.has(w));

      if (availableWorker) {
        this.runTask(availableWorker, { task, resolve, reject });
      } else {
        this.queue.push({ task, resolve, reject });
      }
    });
  }

  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
} 