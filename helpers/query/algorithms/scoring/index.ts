import { MinMaxSet } from "../MinMaxSet";
import { Point3D } from "../types";


type QueryBox = {
  type: "timebox",
  lowX: number,
  highX: number,
  lowY: number,
  highY: number
} | {
  type: "angular"
  lowX: number,
  highX: number,
  lowSlope: number,
  highSlope: number
};

export function scoring(
  minMaxSets: Map<number, MinMaxSet>,
  percentages: Map<number, number>,
  points: Point3D[],
  queryBox: QueryBox,
  lineIDs?: number[]
): Map<number, number> {
  const scoreMap = new Map<number, number>();
  const iterableLineIDs = lineIDs ?? minMaxSets.keys();
  // if(queryBox.type === "timebox"){

  for (let lineID of iterableLineIDs) {
    const minMaxSet = minMaxSets.get(lineID);
    if (!minMaxSet) break;
    const distance = computeDistance(minMaxSet, points, queryBox);
    const width = computeWidth(minMaxSet, points, queryBox);
    const percentage = percentages.get(lineID);
    if (!percentage) continue;
    const score = computeScore(percentage, distance, width);
    scoreMap.set(lineID, score);
  }
  // } else if(queryBox.type == "angular"){
  // }
  return scoreMap;
}

function computeScore(percentage: number, distance: number, width: number, a: number = 1, b: number = 1, c: number = 1): number {
  // return (a * percentage + gaussian (b * c * distance * width)) / (a + 1);
  // return (a * percentage + b * gaussian(distance) + c * gaussian(width)) / (a + b + c);
  // return percentage * gaussian2D(b * width, c * distance);
  return percentage * (b * gaussian(distance) + c * gaussian(width)) / (b + c);
}
function computeDistance(minMaxSet: MinMaxSet, points: Point3D[], queryBox: QueryBox): number {
  const { min, max } = minMaxSet;
  let distance = 0;
  if (queryBox.type === "timebox") {
    for (let i = min; i <= max; ++i) {
      if (minMaxSet.has(i)) continue;
      distance += computePointRangeDistance(points[i]["y"], queryBox.lowY, queryBox.highY);
    }
    distance /= (max - min + 1);
  } else if (queryBox.type === "angular") { }
  return distance;
}

function computePointRangeDistance(pointPos: number, boxMin: number, boxMax: number): number {
  if (pointPos < boxMin) {
    return boxMin - pointPos;
  } else if (pointPos > boxMax) {
    return pointPos - boxMax;
  }
  return 0;
}

function computeWidth(minMaxSet: MinMaxSet, points: Point3D[], queryBox: QueryBox): number {
  const { min, max } = minMaxSet;
  let width = 0;
  if (queryBox.type === "timebox") {
    // let leftSeg = min;
    // let rightSeg = max;
    // if(leftSeg > 0 && !isLastPoint(leftSeg-1, points)) leftSeg--;
    // for(let segPos = leftSeg; segPos<=rightSeg; segPos++){
    //   width += computeLineBoxWidth(points[segPos], points[segPos+1], queryBox);
    // }
  } else if (queryBox.type === "angular") { }
  return width;
}

export function computeLineBoxWidth(point0: Point3D, point1: Point3D, queryBox: QueryBox) {
  let [x0, y0, x1, y1] = [point0.x, point0.y, point1.x, point1.y];
  if (y0)
    // if(){}
    return 0;
}

export function gaussian(valueX: number, mean: number = 0, sigma: number = 1): number {
  // const a = 1 / Math.sqrt(2 * Math.PI)
  // return (a / sigma) * (Math.E ** (-0.5 * ((valueX - mean) / sigma) ** 2)) // area
  return Math.E ** (- ((valueX - mean) ** 2) / (2 * sigma ** 2));
}


export function gaussian2D(valueX: number, valueY: number, meanX: number = 0, meanY: number = 0, sigma: number = 1): number {
  // const a = 1 / Math.sqrt(2 * Math.PI)
  // return (a / sigma) * (Math.E ** (-0.5 * ((valueX - mean) / sigma) ** 2)) // area
  return Math.E ** (- ((valueX - meanX) ** 2 + (valueY - meanY) ** 2) / (2 * sigma ** 2));
}


function isLastPoint(i: number, points: Point3D[]) {
  return !Number.isFinite(points[i].z);
}