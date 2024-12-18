import { LegalComponent, QueryTask } from "../types";
import { TimeboxComponent, AngularComponent, initializeTimeboxComponent, initializeAngularComponent } from "../../ui-controller/components";

type Scale = (d: number) => number;

export default function generateComponents(task: QueryTask | QueryTask[], screenWidth: number, screenHeight: number, scaleX: Scale, scaleY: Scale): LegalComponent[] {
  if(Array.isArray(task)) {
    const components = task.map((t) => generateSingleComponent(t, screenWidth, screenHeight, scaleX, scaleY)).filter(t => t!==null) as LegalComponent[];
    console.log(components);
    return components;
  } else {
    const component = generateSingleComponent(task, screenWidth, screenHeight, scaleX, scaleY);
    return component ? [component] : [];
  }
}

function generateSingleComponent(task: QueryTask, screenWidth: number, screenHeight: number, scaleX: Scale, scaleY: Scale): LegalComponent | null {
  if(task.mode === "timebox") {
    const timeboxComponent = initializeTimeboxComponent();
    const { xStart, xEnd, yStart, yEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    const [screenY1, screenY2] = [yStart, yEnd].map(scaleY);
    timeboxComponent.setLayoutConstraints({
      x: screenX1,
      y: screenY1,
      width: screenX2 - screenX1, 
      height: screenY2 - screenY1,
      p: p
    });
    return timeboxComponent;
  } else if(task.mode) {
    const angularComponent = initializeAngularComponent();
    const { xStart, xEnd, radianStart, radianEnd, p } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    angularComponent.setLayoutConstraints({
      x1: screenX1,
      x2: screenX2,
      y: screenHeight/ 2,
      startAngle: -radianEnd,
      endAngle: -radianStart,
      p: p
    });
    return angularComponent;
  }
  return null;
}