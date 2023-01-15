import { formatAngularOption, formatTimeboxOption, computeSlope } from "../../converters/helpers";
import { angularOption, timeboxOption } from "../../types";
import { ScreenData } from "../../../data";
import _, { keys, sortedIndexBy } from "lodash";


class Node {
  point: Point;
  dim: string;
  left: Node | null;
  right: Node | null;
  constructor(point: Point, dim: string, left: Node | null = null, right: Node | null = null) {
    this.point = point;
    this.dim = dim;
    this.left = left;
    this.right = right;
  }
}

type Point = {
  lineID: number,
  [prop: string]: any;
}

type LineCounter = {[lineID: number]: number};
type PMap = {[lineID: number]: number};

/**
 * 注意考虑 1. 非均匀采样 2. 可能有空值
 * data: 每条线上的点，在时间维度是有序的
 */
export class KDTree<D extends string = "x" | "y">{
  _screenData: ScreenData;
  _dims: D[];  // e.g. ["x", "y"]

  _points: any[];
  _kdtree: Node | null;

  constructor(data: any[], dims: D[]) {
    this._screenData = data;
    this._dims = dims;

    const points = this._points = new Array<Point>();

    let lineID = 0;
    let pointID = 0;
    for (let line of data) {
      for (let point of line) {
        points[pointID] = {
          lineID: lineID,
          ...point,
        };
        pointID++;
      }
      lineID++;
    }
    this._kdtree = buildKDTree<D>(points, dims, 0);
  }




  /**
   * use binary search to optimize
   * @param option 
   * @returns 
   */
  timebox(option: timeboxOption): number[] {
    console.log("kd tree timebox");
    console.time("kd-tree timebox");
    const result: number[] = [];
    const { x1, y1, x2, y2, p } = formatTimeboxOption(option);
    const lineCounterQ = this._rangeCount({
      "x": {min: x1, max: x2},
      "y": {min: y1, max: y2}
    });
    const lineCounterE = this._rangeCount({
      "x": {min: x1, max: x2},
      "y": {min: Number.MIN_VALUE, max: Number.MAX_VALUE}
    });
    const pMap =  computeP(lineCounterQ, lineCounterE);
    console.log({
      lineCounterE,
      lineCounterQ,
      pMap
    });
    const lineIDs = Object.keys(pMap);
    for(let lineID of lineIDs){
      if(pMap[+lineID] >= p){
        result.push(+lineID);
      }
    }

    console.timeEnd("kd-tree timebox");
    return result;
  }

  /**
   * use binary search to optimize
   * @param option 
   * @returns 
   */
  angular(option: angularOption): number[] {
    console.time("kd-tree angular");
    const result: number[] = [];
    const { x1, slope1, x2, slope2, p } = formatAngularOption(option);
    for (let i = 0; i < this._screenData.length; ++i) {
      const screenLine = this._screenData[i];
      // 由于是非均匀采样，需要对于每条线单独定位窗口边界
      const l = sortedIndexBy(screenLine, { x: x1, y: 0 }, "x");
      const r = sortedIndexBy(screenLine, { x: x2 + Number.MIN_VALUE, y: 0 }, "x") - 1;
      if (l > r) continue;
      let counterE = r - l + 1;
      let counterQ = 0;
      let isSatisfied = true;
      for (let i = l; i < r; ++i) {
        const point1 = screenLine[i];
        const point2 = screenLine[i + 1];
        const slope = computeSlope(point1, point2);
        if (slope1 <= slope && slope <= slope2) counterQ++;
      }
      if (counterQ / counterE >= p) result.push(i);

    }
    console.timeEnd("kd-tree angular");
    return result;
  }

  _rangeCount(bBox: {
    [dim: string]: {
      min: number,
      max: number,
    }
  }): LineCounter {
    const lineCounter: LineCounter = {};
    rangeCount(this._kdtree, bBox, lineCounter);
    return lineCounter;
  }


}


function buildKDTree<D extends string = "x" | "y">(points: Point[], dims: D[], depth: number): Node | null {
  if (!points || points.length === 0) return null;

  // choose axis
  const dimPos = depth % dims.length;
  const dim = dims[dimPos];

  // get split plane
  points.sort((a, b) => a[dim] - b[dim]);
  const medianPos = Math.floor(points.length / 2);

  return new Node(
    points[medianPos],
    dim,
    buildKDTree(points.slice(0, medianPos), dims, depth + 1),
    buildKDTree(points.slice(medianPos + 1, points.length), dims, depth + 1),
  );
}

function rangeCount(root: Node | null, bBox: {
  [dim: string]: {
    min: number,
    max: number,
  }
},
lineCounter: LineCounter
){
  // let lineCounter: LineCounter = {};
  if(root === null) return;
  const { point, dim } = root;
  const dims = Object.keys(bBox);
  let isOK = true;
  for (let dim of dims) {
    if (root.point[dim] < bBox[dim].min || bBox[dim].max < root.point[dim]) {
      isOK = false;
      break;
    }
  }
  if(isOK){
    if(lineCounter[point.lineID]){
      lineCounter[point.lineID]++;
    } else {
      lineCounter[point.lineID] = 1;
    }
  }

  if(bBox[dim] === undefined || bBox[dim].min < point[dim] ) {
    rangeCount(root.left, bBox, lineCounter);
  }

  if(bBox[dim] === undefined || bBox[dim].max > point[dim] ) {
    rangeCount(root.right, bBox, lineCounter);
  }
}

// function mergeLineCounter(counter1: LineCounter, counter2: LineCounter): LineCounter{
//   const lineCounter: LineCounter = counter1;//{};
//   // Object.assign(lineCounter, counter1);
//   const lineIDs = Object.keys(counter2);
//   for(let lineID of lineIDs){
//     const id = + lineID;
//     if(lineCounter[id]){
//       lineCounter[id] = 1
//     } else {
//       lineCounter[id]++;
//     }
//   }
//   return lineCounter;
// }

function computeP(counterQ: LineCounter, counterE: LineCounter): PMap {
  const pMap: PMap = {};
  const lineIDs = Object.keys(counterQ);
  for(let _lineID of lineIDs){
    const lineID = + _lineID;
    pMap[lineID] = counterQ[lineID] / counterE[lineID];
  }
  return pMap;
}