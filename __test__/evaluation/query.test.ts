import { ScreenPoint } from "../../helpers/data";
import { genGetValue, genData, generateRandomTimebox, generateRandomAngular, getFilePath } from "./helpers";
import fsPromises from "fs/promises"
import path from "path";
import { CCHKDTree, SequentialSearch } from "../../helpers/query";
test("test getValue", () => {
  const getValue = genGetValue();
  const len = 10000;
  const arr: number[] = [];
  for (let i = 0; i < len; ++i) {
    arr.push(getValue());
  }
  const outliers = arr.filter(x => x < 0).filter(x => x > 1);
  expect(outliers.length).toBe(0);
});


const xRange: [number, number] = [0, 100];
const yRange: [number, number] = [0, 100];

// test("test genData", () => {
//   const curveNum = 1;
//   const pointNumEachCuve = 100;
//   const data = genData(curveNum, pointNumEachCuve, xRange, yRange);
//   // console.log(data);
//   expect(data[0].length).toEqual(pointNumEachCuve);
//   expect(data[0].every(point => {
//     return point.x >= xRange[0] && point.x <= xRange[1]
//       && point.y >= yRange[0] && point.y <= yRange[1];
//   })).toBe(true);
// });

test("test query", async () => {
  const fixedParam = 100;
  const variedParams: number[] = [];
  const start1 = 1000;
  const step1 = 1000;
  const end1 = 10000;
  const step2 = 10000;
  const end2 = 100000;
  const xRange: [number, number] = [0, 100];
  const yRange: [number, number] = [0, 100];
  for (let i = start1; i < end1; i += step1) variedParams.push(i)
  for (let i = end1; i <= end2; i += step2) variedParams.push(i);
  const filteredVariedParams = variedParams.filter(param => param = 20000);
  for (const variedParam of filteredVariedParams) {
    if(variedParam>1000) continue;
    const params = [fixedParam, variedParam];
    for (let i = 0; i < 2; ++i) {
      const curveNum = params[i];
      const pointNumEachCuve = params[1 - i];
      const dataStr = await fsPromises.readFile(getFilePath(curveNum, pointNumEachCuve), "utf-8")
      const data = JSON.parse(dataStr) as ScreenPoint[][];
      console.log(`${curveNum}-${pointNumEachCuve}-buildStart`);
      const kdtree = new CCHKDTree(data, xRange[1] - xRange[0], yRange[1] - yRange[0]);
      const seq = new SequentialSearch(data);
      const timebox =  generateRandomTimebox([50, 60], [50, 60]);
      kdtree.timebox(timebox);
      seq.timebox(timebox);
      console.log(`${curveNum}-${pointNumEachCuve}-buildEnd`);
    }
  }
});

