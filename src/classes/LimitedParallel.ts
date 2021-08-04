export class LimittedParallel<T extends any[]> {

  method: (...data: T) => Promise<void>
  size: number = 1
  queue: Array<T> = []
  working: number = 0


  constructor(method: (...data: T) => Promise<void>, size?: number) {
    this.method = method
    if (size)
      this.size = size
  }

  add(params: T) {
    this.queue.push(params);
    this.execute()
  }

  protected execute() {
    const can_run = this.size - this.working;
    if (can_run > 0 && this.queue.length > 0) {
      this.working++;
      this.method(...this.queue.pop() as T).then(() => global.logger.debug("LimittedParallel: success")).catch(e => global.logger.error(e)).finally(() => {
        this.working--;
        this.execute()
      })
    }
  }
}

// const func = async (x: number) => {
//   return new Promise<void>((resolve, reject) => {
//     setTimeout(() => {
//       console.log("executing", x);
//       resolve();
//     }, 3000)
//   })
// }

// const new_worker = new LimittedParallel<[number]>(func)

// new_worker.add([1]);
// new_worker.add([2]);
// new_worker.add([3]);


