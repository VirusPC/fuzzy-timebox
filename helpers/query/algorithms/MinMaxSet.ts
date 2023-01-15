// export type  MinMaxSet = {
//   set: Set<number>,
//   min: number,
//   max: number,
// }
export class MinMaxSet {
  set: Set<number>;
  min: number;
  max: number;
  // [Symbol.iterator]: () => IterableIterator<number>;

  constructor(numbers?: number[]) {
    this.set = new Set<number>(numbers);
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    if (numbers) {
      if (numbers.length) {
        min = numbers[0];
        max = numbers[0];
      }
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < min) {
          min = numbers[i];
        } else if (numbers[i] > max) {
          max = numbers[i];
        }
      }
    }

    this.min = min;
    this.max = max;
    // this[Symbol.iterator] = this.set[Symbol.iterator];
  }
  add(item: number) {
    if (item < this.min) {
      this.min = item;
    }
    if (item > this.max) {
      this.max = item;
    }
    return this.set.add(item);
  }
  has(item: number) {
    return this.set.has(item);
  }
  clear() {
    this.min = Number.MIN_VALUE;
    this.max = Number.MAX_VALUE;
    return this.set.clear();
  }
}