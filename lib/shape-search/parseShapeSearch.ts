// import { GeneralComponent } from "../interaction/container";
import { QueryMode } from "../ui-controller";
// import { TimeboxLayoutConstraints, AngularLayoutConstraints } from "../ui-controller/";

const SHAPE_SEARCH_REGEX = /\[((x|y|s).(s|e)=-?(\d+),)*((x|y|s).(s|e)=-?(\d+))\]/g;
const PARTIAL_CONSTRAINT_REGEX = /(x|y|s).(s|e)=(-?\d*)/g

type ControlPoint = {
  name: "x" | "y" | "s",
  position: "start" | "end",
  value: number
}
type TimeboxConstraints = {
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
};

type AngularConstraints = {
  xStart: number,
  xEnd: number,
  sStart: number,
  sEnd: number,
};

type Constraints = TimeboxConstraints | AngularConstraints;

type GenericSSTask<M extends QueryMode, C extends Constraints> = {
  queryMode: M,
  constraint: C
}

export type SSTask = GenericSSTask<"timebox", TimeboxConstraints> | GenericSSTask<"angular", AngularConstraints>;

/**
 * shape search regex to component
 * @param expr 
 * @returns 
 */
export default function parseShapeSearch(expr: string, xRange: [number, number], yRange: [number, number], sRange: [number, number]): SSTask[] | null {
  // const str1 = '[x.start=1,x.end=10,y.start=2,y.end=20][y.start=2,y.end=20]';
  const formatedExpr = formatExpr(expr);
  const results: string[][] = [...formatedExpr.matchAll(SHAPE_SEARCH_REGEX)];
  const controlPoints = results
    .map(generateControlPoints)
  const tasks = controlPoints.map((cps) => getTask(cps, xRange, yRange, sRange));
  return tasks;
}

function formatExpr(expr: string) {
  return expr.replaceAll("\n", "").replaceAll(" ", "").toLowerCase();
}

function generateControlPoints(arr: string[]): ControlPoint[] {
  const input = arr[0];
  const paritalConstraints = input.slice(1, input.length - 1).split(",");
  const controlPoints: ControlPoint[] = paritalConstraints
    .map(paritalConstraint => {
      const [result] = [...paritalConstraint.matchAll(PARTIAL_CONSTRAINT_REGEX)];
      if(!result) return null;
      return {
        name: result[1],
        position:  result[2] === "s" ? "start" : "end",
        value: +result[3]
      }
    }).filter(cp => cp !== null) as ControlPoint[];

  // const num = Math.floor(arr.length/4);
  // const OFFSET = 1;
  // for(let i=0; i<num; ++i){
  //   const name = arr[OFFSET + i * 4 + 1] as "x";
  //   const position = arr[OFFSET + i * 4 + 2] === "s" ? "start" : "end";
  //   const value = +arr[OFFSET + i * 4 + 3];
  //   controlPoints.push({ name, position, value });
  // }
  return controlPoints;
}

function getTask(controlPoints: ControlPoint[], xRange: [number, number], yRange: [number, number], sRange: [number, number]): SSTask {
  const xStartConstrolPoint = controlPoints.find(cp => cp.name === "x" && cp.position === "start");
  const xEndConstrolPoint = controlPoints.find(cp => cp.name === "x" && cp.position === "end");
  const yStartConstrolPoint = controlPoints.find(cp => cp.name === "y" && cp.position === "start");
  const yEndConstrolPoint = controlPoints.find(cp => cp.name === "y" && cp.position === "end");
  const sStartConstrolPoint = controlPoints.find(cp => cp.name === "s" && cp.position === "start");
  const sEndConstrolPoint = controlPoints.find(cp => cp.name === "s" && cp.position === "end");
  const hasS = sEndConstrolPoint && sEndConstrolPoint;
  if (!hasS) {
    // timebox
    return {
      queryMode: "timebox",
      constraint: {
        "xStart": xStartConstrolPoint ? xStartConstrolPoint.value : xRange[0],
        "xEnd": xEndConstrolPoint ? xEndConstrolPoint.value : xRange[1],
        "yStart": yStartConstrolPoint ? yStartConstrolPoint.value : yRange[0],
        "yEnd": yEndConstrolPoint ? yEndConstrolPoint.value : yRange[1],
      }
    }
  } else {
    // angular
    return {
      queryMode: "angular",
      constraint: {
        "xStart": xStartConstrolPoint ? xStartConstrolPoint.value : xRange[0],
        "xEnd": xEndConstrolPoint ? xEndConstrolPoint.value : xRange[1],
        "sStart": sStartConstrolPoint ? sStartConstrolPoint.value : sRange[0],
        "sEnd": sEndConstrolPoint ? sEndConstrolPoint.value : sRange[1],
      }
    }
  }
}