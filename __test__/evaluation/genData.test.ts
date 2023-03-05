// import { ScreenPoint } from "../../helpers/data";
import { genData, getFilePath } from "./helpers";
import fsPromises from "fs/promises"
import path from "path";

test("genData", () => {
  expect(1).toBe(1);
})

// test("genDataSets", () => {
//   // const datasets: ScreenPoint[][][] = [];
//   const fixedParam = 100;
//   const variedParams: number[] = [];
//   const start1 = 1000;
//   const step1 = 1000;
//   const end1 = 10000;
//   const step2 = 10000;
//   const end2 = 100000;
//   const xRange: [number, number] = [0, 100];
//   const yRange: [number, number] = [0, 100];
//   for (let i = start1; i < end1; i += step1) variedParams.push(i)
//   for (let i = end1; i <= end2; i += step2) variedParams.push(i);
//   // expect(variedParams.length).toBe(19);
//   let g = 0;
//   console.log(variedParams);
//   const variedParams2 = variedParams.slice(variedParams.length-1);
//   for (const variedParam of variedParams) {
//     const params = [fixedParam, variedParam];
//     for(let i = 0; i<2; ++i){
//       const curveNum = params[i];
//       const pointNumEachCurve = params[1-i];
//       console.log(g++, [curveNum, pointNumEachCurve]);
//       const data = genData(curveNum, pointNumEachCurve, xRange, yRange);
//       console.log(__dirname);
      // fsPromises.writeFile(getFilePath(curvNum, pointNumEachCurve), JSON.stringify(data), "utf-8");
//       // datasets.push(data);
//     }
//   }

//   // console.log(data);
//   // expect(data[0].length).toEqual(pointNumEachCuve);
//   // expect(data[0].every(point => {
//   //   return point.x >= xRange[0] && point.x<=xRange[1]
//   //   && point.y >= yRange[0] && point.y <= yRange[1];
//   // })).toBe(true);
// });