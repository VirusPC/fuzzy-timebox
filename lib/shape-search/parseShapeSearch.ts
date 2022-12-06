// import { GeneralComponent } from "../interaction/container";
import { QueryMode } from "../ui-controller";
// import { TimeboxLayoutConstraints, AngularLayoutConstraints } from "../ui-controller/";

// const SHAPE_SEARCH_REGEX = /\[((x|y|s).(s|e)=-?(\d+),)*\]/g;
// const SHAPE_SEARCH_REGEX = /\[(\w|\d|.|,)*\]/g;
const PARTIAL_CONSTRAINT_REGEX = /(x|y|s).(s|e)=(-?\d*)/g

type PositionControlPointName = "x" | "y" | "s";
type PercentageControlPointName = "p";
type ControlPointName = PositionControlPointName | PercentageControlPointName;
type ControlPointPosition = "start" | "end";
type ControlPoint = {
  name: PositionControlPointName,
  position: ControlPointPosition,
  value: number
} | {
  name: PercentageControlPointName,
  value: number
}
type TimeboxConstraints = {
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  p: number,
};

type AngularConstraints = {
  xStart: number,
  xEnd: number,
  sStart: number,
  sEnd: number,
  p: number,
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
  // const str1 = '[x.s=1,x.e=10,y.s=2,y.e=20][y.s=2,y.e=20]';
  const formattedExpr = formatExpr(expr);
  const shapeSearchExprs = formattedExpr.slice(1, formattedExpr.length - 1).split("][");
  const controlPoints = shapeSearchExprs.map(shapeSearchExpr => generateControlPoints(shapeSearchExpr));
  // const results: string[][] = [...formattedExpr.matchAll(SHAPE_SEARCH_REGEX)];
  // const controlPoints = results
  //   .map(generateControlPoints)
  // const 
  const tasks = controlPoints.map((cps) => getTask(cps, xRange, yRange, sRange));
  console.log(tasks);
  // return tasks;
  return [];
}

function generateControlPoints(shapeSearchExpr: string): ControlPoint[] {
  const controlPoints: ControlPoint[] = [];
  shapeSearchExpr.split(",").forEach((singleConstraintStr) => {
    const [property, value] = singleConstraintStr.split("=");
    if (!property || !value) return;
    if (property === "p") {
      const formattedValue = formatControlPointValue(value, property);
      if (formattedValue === null) return;
      controlPoints.push({
        name: "p",
        value: formattedValue
      });
    } else {
      const [name, position] = property.split(".");
      if (!name || !position) return;
      const formattedName = formatControlPointName(name);
      const formattedPosition = formatControlPointPosition(position);
      if (formattedName === null || formattedPosition === null) return;
      const formattedValue = formatControlPointValue(value, formattedName);
      if (formattedValue === null) return;
      controlPoints.push({
        name: formattedName,
        position: formattedPosition,
        value: formattedValue
      });
    }
  });
  return controlPoints;
}

function formatExpr(expr: string) {
  return expr.replaceAll("\n", "").replaceAll(" ", "").toLowerCase();
}

function formatControlPointName(name: string): ControlPointName | null {
  if (name === "x" || name === "y" || name === "s" || name === "p") {
    return name;
  }
  return null;
}

function formatControlPointPosition(position: string): ControlPointPosition | null {
  if (position === "s" || position === "start") {
    return "start";
  } else if (position === "e" || position === "end") {
    return "end";
  }
  return null;
}

function formatControlPointValue(value: string, type: ControlPointName): number | null {
  if (type === "p") {
    if (!isNaN(+value)) {
      return +value;
    } else {
      return 1;
    };
  } else {
    if (!isNaN(+value)) {
      return +value;
    }
  }
  return null;
}


// function generateControlPoints(arr: string[]): ControlPoint[] {
//   const input = arr[0];
//   const paritalConstraints = input.slice(1, input.length - 1).split(",");
//   const controlPoints: ControlPoint[] = paritalConstraints
//     .map(paritalConstraint => {
//       const [result] = [...paritalConstraint.matchAll(PARTIAL_CONSTRAINT_REGEX)];
//       if(!result) return null;
//       return {
//         name: result[1],
//         position:  result[2] === "s" ? "start" : "end",
//         value: +result[3]
//       }
//     }).filter(cp => cp !== null) as ControlPoint[];

//   // const num = Math.floor(arr.length/4);
//   // const OFFSET = 1;
//   // for(let i=0; i<num; ++i){
//   //   const name = arr[OFFSET + i * 4 + 1] as "x";
//   //   const position = arr[OFFSET + i * 4 + 2] === "s" ? "start" : "end";
//   //   const value = +arr[OFFSET + i * 4 + 3];
//   //   controlPoints.push({ name, position, value });
//   // }
//   return controlPoints;
// }

function getTask(controlPoints: ControlPoint[], xRange: [number, number], yRange: [number, number], sRange: [number, number]): SSTask {
  const xStartConstrolPoint = controlPoints.find(cp => cp.name === "x" && cp.position === "start");
  const xEndConstrolPoint = controlPoints.find(cp => cp.name === "x" && cp.position === "end");
  const yStartConstrolPoint = controlPoints.find(cp => cp.name === "y" && cp.position === "start");
  const yEndConstrolPoint = controlPoints.find(cp => cp.name === "y" && cp.position === "end");
  const sStartConstrolPoint = controlPoints.find(cp => cp.name === "s" && cp.position === "start");
  const sEndConstrolPoint = controlPoints.find(cp => cp.name === "s" && cp.position === "end");
  const pConstrolPoint = controlPoints.find(cp => cp.name === "p");
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
        "p": pConstrolPoint ? pConstrolPoint.value : 1
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
        "p": pConstrolPoint ? pConstrolPoint.value : 1
      }
    }
  }
}