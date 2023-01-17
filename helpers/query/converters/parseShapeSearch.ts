import type { QueryTask } from "../types"
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

/**
 * shape search expression parser
 * 
 * @param expr shape search expressions
 * @param xRange the range of x in data domain
 * @param yRange the range of y in data domain
 * @param sRange the range of s in data domain
 * @returns 
 */
export default function parseShapeSearch(expr: string, xRange: [number, number], yRange: [number, number], sRange: [number, number]): QueryTask[] | null {
  const formattedExpr = formatExpr(expr);
  if(formattedExpr.length<=0){
    return [];
  }
  const shapeSearchExprs = formattedExpr.slice(1, formattedExpr.length - 1).split("][");
  const controlPointsForTasks = shapeSearchExprs
    .map(shapeSearchExpr => generateControlPoints(shapeSearchExpr))
    .filter(cpft => cpft !== null) as ControlPoint[][];
  const tasks = controlPointsForTasks.map((controlPoints) => getTask(controlPoints, xRange, yRange, sRange));
  return tasks;
}

function generateControlPoints(shapeSearchExpr: string): ControlPoint[] | null {
  const controlPoints: ControlPoint[] = [];
  shapeSearchExpr.split(",").forEach((singleConstraintStr) => {
    const [property, value] = singleConstraintStr.split("=");
    if (!property || !value) return null;
    if (property === "p") {
      const formattedValue = formatControlPointValue(value, property);
      if (formattedValue === null) return null;
      controlPoints.push({
        name: "p",
        value: formattedValue
      });
    } else {
      const [name, position] = property.split(".");
      if (!name || !position) return null;
      const formattedName = formatControlPointName(name);
      const formattedPosition = formatControlPointPosition(position);
      if (formattedName === null || formattedPosition === null) return null;
      const formattedValue = formatControlPointValue(value, formattedName);
      if (formattedValue === null) return null;
      controlPoints.push({
        name: formattedName,
        position: formattedPosition,
        value: formattedValue
      });
    }
  });
  // // at least one position required
  // if(controlPoints.findIndex(cp => cp.name === "x" || cp.name === "y" || cp.name === "s") === -1) return null;
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

function getTask(controlPoints: ControlPoint[], xRange: [number, number], yRange: [number, number], sRange: [number, number]): QueryTask {
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
      mode: "timebox",
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
      mode: "angular",
      constraint: {
        "xStart": xStartConstrolPoint ? xStartConstrolPoint.value : xRange[0],
        "xEnd": xEndConstrolPoint ? xEndConstrolPoint.value : xRange[1],
        "radianStart": sStartConstrolPoint ? sStartConstrolPoint.value/180*Math.PI : sRange[0],
        "radianEnd": sEndConstrolPoint ? sEndConstrolPoint.value/180*Math.PI : sRange[1],
        "p": pConstrolPoint ? pConstrolPoint.value : 1
      }
    }
  }
}