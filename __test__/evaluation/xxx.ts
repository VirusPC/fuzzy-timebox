
const LINEAR_SLOPE: number = -1;
const randomLinear = (slope: number) => {
  if(slope === 0) return () => Math.random();
  return () => {
    const probibility = Math.random();
    // const probibility = 1;
    const a = (2 * probibility / slope + ((2 - slope) / ((2 * slope)) ** 2)) ** (1 / 2)
    const b = ((2 - slope) / (2 * slope));
    const c =  a - b;
    const d =  a + b;
    return  c >=0 && c<=1 ? c : -a-b;
    // return (2*probibility+1/4) ** (1/2) - 1/2
  }
}
const linear = randomLinear(LINEAR_SLOPE);

const len = 1000000;
const arr = [];
for (let i = 0; i < len; ++i) {
  arr.push(linear());
}
// console.log(arr);
console.log(arr.filter(x => x <= 0.5 ).length / len);
console.log(5 / 8);

export {};