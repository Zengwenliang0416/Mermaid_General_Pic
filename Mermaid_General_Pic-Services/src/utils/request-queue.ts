interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RequestQueue {
  private queue: QueueItem<any>[] = [];
  private processing = 0;

  constructor(private maxConcurrent: number = 5) {}

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing++;
    const item = this.queue.shift()!;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processing--;
      this.processNext();
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get activeCount(): number {
    return this.processing;
  }
} 