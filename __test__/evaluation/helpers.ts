import { ScreenPoint } from "../../helpers/data";
import { AngularOption, AngularQueryTask, TimeboxOption, TimeboxQueryTask } from "../../helpers/query";
import random from "random"
import path from "path";

export function genData(curveNum: number, pointNumEachCuve: number,
  xRange: [number, number], yRange: [number, number]): ScreenPoint[][] {
  const xSpan = xRange[1] - xRange[0];
  const xStart = xSpan / pointNumEachCuve / 2
  const ySpan = yRange[1] - yRange[0];
  const data: ScreenPoint[][] = new Array(curveNum);
  const getValue = genGetValue();
  for (let i = 0; i < curveNum; ++i) {
    const line = new Array(pointNumEachCuve);
    for (let j = 0; j < pointNumEachCuve; ++j) {
      line[j] = {
        x: xStart + xRange[0] + xSpan * j / pointNumEachCuve,
        y: yRange[0] + ySpan * getValue()
      }
    }
    data[i] = line;
  }
  return data;
}



/**
 * get random value between [0, 1] from random distributino;
 * @param beta 
 * @returns random number between 0 and 1
 */
export function genGetValue(
  // distrib: "gasussian" | "exponential" | "poisson" | "linear" | "log" | "sine" | "cosine",
  beta: number = 1,
): () => number {
  const GAUSSIAN_SIGMA = 3;
  // const LINEAR_SLOPE = 1;


  const [min, max] = [0, 1];
  const mean = min + (max - min) / 2;
  const uniform = () => random.float(min, max);
  const gaussian = random.normal(mean, (max - mean) / GAUSSIAN_SIGMA);  // 3sigma
  const exponential = random.exponential(1 / mean);
  const poisson = random.poisson(mean);
  const linear = () => (2 * Math.random() + 1 / 4) ** (1 / 2) - 1 / 2; // 密度函数·为 x+1/2;
  const sine = () => mean + (max - mean) * Math.sin(Math.random() * Math.PI * 2); // 有问题
  const cosine = () => mean + (max - mean) * Math.cos(Math.random() * Math.PI * 2); // 有问题

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
      value = linear();
    } else if (distrib === 5) {
      value = sine();
    } else if (distrib === 6) {
      value = cosine();
    }
    value += beta * Math.random();
    return value;
    // return Math.min(value,);
  }

  return getValue;
}

export function generateRandomTimebox(xRange: [number, number], yRange: [number, number]): TimeboxOption {
  const xSpan = xRange[1] - xRange[0];
  const ySpan = yRange[1] - yRange[0];
  const width = Math.random() * xSpan;
  const height = Math.random() * ySpan;
  const p = Math.random();
  const queryPoint = [
    xRange[0] + Math.random() * xSpan,
    yRange[0] + Math.random() * ySpan,
  ];
  return {
    type: "timebox",
    x1: queryPoint[0] - width / 2,
    y1: queryPoint[1] - height / 2,
    x2: queryPoint[0] + width / 2,
    y2: queryPoint[1] + height / 2,
    p: p
  }
}

export function generateRandomAngular(xRange: [number, number], slopeRange: [number, number]): AngularOption {
  const xSpan = xRange[1] - xRange[0];
  const slopeSpan = slopeRange[1] - slopeRange[0];
  const width = Math.random() * xSpan;
  const slopeWidth = Math.random() * slopeSpan;
  const p = Math.random();
  const queryPoint = [
    xRange[0] + Math.random() * xSpan,
    slopeRange[0] + Math.random() * slopeSpan,
  ];
  return {
    type: "angular",
    x1: queryPoint[0] - width / 2,
    slope1: queryPoint[1] - slopeWidth / 2,
    x2: queryPoint[0] + width / 2,
    slope2: queryPoint[1] + slopeWidth / 2,
    p: p
  }
}

export function getFilePath(curveNum: number, pointNumEachCuve: number){
  return path.resolve(__dirname, `data/data/${curveNum}-${pointNumEachCuve}.json`);
}
// function generateRandomQuery(mode: "timebox" | "angular"): TimeboxQueryTask | AngularQueryTask {
//   // if(mode === "angular"){}
//   return {
//     mode: "timebox",
//     constraint: {
//       xStart: 0,
//       xEnd: 0,
//       yEnd: 0,
//     }
//   };
// }
