function sortedIndex2(array, targetValue){
  low = 0;
  high = array.length;
  if (high == 0) {
    return 0
  }
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const computed = array[mid];
    if (computed < targetValue) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return high;
}

function sortedIndex(array, low, high, targetValue){
  // low = low;
  // high = .length;
  if(low < 0) low = 0;
  if(high >= array.length) high = array.length - 1;
  high++;
  if (high == 0) {
    return 0
  }
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const computed = array[mid];
    if (computed < targetValue) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return high;
}

const arr = [0, 1, 2, 2, 3];
console.log(sortedIndex(arr, -1, 3, -1)); // 0
console.log(sortedIndex(arr, -1, 3, 0)); //0
console.log(sortedIndex(arr, -1, 3, 1)); // 1
console.log(sortedIndex(arr, -1, 3, 1.5)); //2 
console.log(sortedIndex(arr, -1, 3, 2)); // 2
console.log(sortedIndex(arr, -1, 3, 3)); //3
console.log(sortedIndex(arr, -1, 3, 4)); //3