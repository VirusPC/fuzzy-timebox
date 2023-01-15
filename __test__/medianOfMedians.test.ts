import medianOfMedians from "../helpers/query/algorithms/medianOfMedians";

function generateRandomArr(len: number, low: number = 0, high: number = 1): number[]{
  const arr: number[] = [];
  while(len--){
    arr.push(low + Math.random() * (high - low));
  }
  return arr;
}

function getMidWeightedVal(data: number[]) {
  //}, weight) {
  if (data.length <= 0) return Infinity;
  data.sort((a, b) => a - b);
  return data[Math.floor(data.length / 2)];
}

// 小数据，meidan Of Medians 更慢
test("test median of Medians", () => {
  const arr = generateRandomArr(1000);
  const times= 1000;
  console.time("median1");
  for(let i=0; i< times; ++i){
    getMidWeightedVal(arr);
  }
  console.timeEnd("median1");
  console.time("median2");
  for(let i=0; i< times; ++i){
    medianOfMedians(arr, Math.ceil(arr.length/2));
  }
  console.timeEnd("median2");
});
