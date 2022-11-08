import { SSTask } from "./parseShapeSearch";
import { TimeboxComponent, AngularComponent, initializeTimeboxComponent, initializeAngularComponent } from "../ui-controller/components";
import type { TimeboxLayoutConstraints, AngularLayoutConstraints } from "../ui-controller";

type Component = TimeboxComponent | AngularComponent

export default function parseTask(task: SSTask, width: number, height: number): Component | null {
  if(task.queryMode === "timebox") {
    const timeboxComponent = initializeTimeboxComponent();
    const { xStart, xEnd, yStart, yEnd } = task.constraint;
    timeboxComponent.setLayoutConstraints({
      x: xStart,
      y: yStart,
      width: xEnd - xStart, 
      height: yEnd - yStart
    });
    return timeboxComponent;
  } else if(task.queryMode) {
    const angularComponent = initializeAngularComponent();
    const { xStart, xEnd, sStart, sEnd } = task.constraint;
    angularComponent.setLayoutConstraints({
      x1: xStart,
      x2: xEnd,
      y: height / 2,
      startAngle: sStart / 360 * 2 * Math.PI,
      endAngle: sEnd / 360 * 2 * Math.PI,
    });
    return angularComponent;
  }
  return null;
}