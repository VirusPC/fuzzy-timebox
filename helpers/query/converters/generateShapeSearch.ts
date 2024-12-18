import { QueryTask } from "../types";
import { TimeboxComponent, AngularComponent } from "../../ui-controller/components";

type Scale = (d: number) => number;

export default function generateShapeSearch(task: QueryTask | QueryTask[], screenWidth: number, screenHeight: number, scaleX: Scale, scaleY: Scale): string {
  if(Array.isArray(task)){
    const shapeSearchExprs = task.map(t => generateSingleShapeSearch(t, screenWidth, screenHeight, scaleX, scaleY)).filter(t => t!==null) as string[];
    return shapeSearchExprs.join("\n");
  } else {
    return generateSingleShapeSearch(task, screenWidth, screenHeight, scaleX, scaleY) || "";
  }
}

function generateSingleShapeSearch(task: QueryTask, screenWidth: number, screenHeight: number, scaleX: Scale, scaleY: Scale): string | null {
  if (task.mode === "timebox") {
    const { xStart, xEnd, yStart, yEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    const [screenY1, screenY2] = [yStart, yEnd].map(scaleY);

    return `[
  x.s=${screenX1},
  x.e=${screenX2},
  y.s=${screenY1},
  y.e=${screenY2},
  p=${p}
]`;
  } else if (task.mode === "angular") {
    const { xStart, xEnd, radianStart, radianEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    return `[
  x.s=${screenX1},
  x.e=${screenX2},
  s.s=${radianStart / Math.PI * 180},
  s.e=${radianEnd / Math.PI * 180},
  p=${p}
]`;
  }
  return null;
}