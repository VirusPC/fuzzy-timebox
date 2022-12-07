import { QueryTask } from "./types";
import { TimeboxComponent, AngularComponent, initializeTimeboxComponent, initializeAngularComponent } from "../ui-controller/components";

type Component = TimeboxComponent | AngularComponent
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
    const timeboxComponent = initializeTimeboxComponent();
    const { xStart, xEnd, yStart, yEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    const [screenY1, screenY2] = [yStart, yEnd].map(scaleY);
    timeboxComponent.setLayoutConstraints({
      x: screenX1,
      y: screenY1,
      width: screenX2 - screenX1,
      height: screenY2 - screenY1
    });
    return `[x.s=${screenX1}, x.e=${screenX2}, y.s=${screenY1}, y.e=${screenY2}, s=${p}]`;
  } else if (task.mode) {
    const angularComponent = initializeAngularComponent();
    const { xStart, xEnd, sStart, sEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    angularComponent.setLayoutConstraints({
      x1: screenX1,
      x2: screenX2,
      y: screenHeight / 2,
      startAngle: sStart / 360 * 2 * Math.PI,
      endAngle: sEnd / 360 * 2 * Math.PI,
    });
    return `[x.s=${screenX1}, x.e=${screenX2}, y.s=${sStart}, y.e=${sEnd}, s=${p}]`;
  }
  return null;
}