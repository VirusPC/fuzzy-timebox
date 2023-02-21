import { ScreenPoint } from "../../helpers/data";
import { CCHKDTree } from "../../helpers/query";
import random from "random"
test("test speed", () => {
  const exponential = random.exponential(1 / 250);
  const data = new Array(100).map(exponential);
  console.log(data);
  // expect(result).toBe(1);
  // const cchKDTree = new CCHKDTree(dataStore.aggregatedPlainScreenData);
});


function genData(len: number): ScreenPoint[][] {
  const data: ScreenPoint[][] = [];
  return data;
}

function genGetValue(
  // distrib: "gasussian" | "exponential" | "poisson" | "linear" | "log" | "sine" | "cosine",
  range: [number, number] = [0, 500],
  beta: number = 1,
): () => number {
  const [min, max] = range;
  const mean = min + (max - min) / 2;
  const uniform = () => random.float(min, max);
  const gaussian = random.normal(mean, (max - mean) / 3);
  const exponential = random.exponential(1 / mean);
  const poisson = random.poisson(mean);
  const linear = random.logNormal(mean, (max - mean) / 3);  // min概率是max概率的1/2 => P(x=min)= 1/(3*(max-min))
  const sine = () => mean + (max - mean) * Math.sin(Math.random()*Math.PI*2); // 有问题
  const cosine= () => mean + (max - mean) * Math.cos(Math.random()*Math.PI*2); // 有问题

  /**
   * linear === uniform
   * sin, cosine
   * 
   */

  const getValue = () => {
    const distrib = Math.random() * 7;
    let value = 0;
    if (distrib === 0) {
      value = uniform();
    } else if (distrib === 1) {
      value = gaussian();
    } else if (distrib === 2) {
      value = exponential();
    } else if (distrib === 3) {
      value = poisson();
    } else if (distrib === 4) {
      value = sine();
    } else if (distrib === 5) {
      value = cosine();
    } else if (distrib === 6) {
      value = uniform();
    }
    value += beta * Math.random();
    return value;
    // return Math.min(value,);
  }

  return getValue;
}
