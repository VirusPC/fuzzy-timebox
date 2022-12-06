import { SSTask } from "../shape-search/parseShapeSearch";
import { TimeboxComponent, AngularComponent, initializeTimeboxComponent, initializeAngularComponent } from "../ui-controller/components";

type Component = TimeboxComponent | AngularComponent
type Scale = (d: number) => number;

export default function parseTask(task: SSTask, screenWidth: number, screenHeight: number, scaleX: Scale, scaleY: Scale): Component | null {
  if(task.queryMode === "timebox") {
    const timeboxComponent = initializeTimeboxComponent();
    const { xStart, xEnd, yStart, yEnd } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    const [screenY1, screenY2] = [yStart, yEnd].map(scaleY);
    timeboxComponent.setLayoutConstraints({
      x: screenX1,
      y: screenY1,
      width: screenX2 - screenX1, 
      height: screenY2 - screenY1
    });
    return timeboxComponent;
  } else if(task.queryMode) {
    const angularComponent = initializeAngularComponent();
    const { xStart, xEnd, sStart, sEnd } = task.constraint;
    const [screenX1, screenX2] = [xStart, xEnd].map(scaleX);
    angularComponent.setLayoutConstraints({
      x1: screenX1,
      x2: screenX2,
      y: screenHeight/ 2,
      startAngle: sStart / 360 * 2 * Math.PI,
      endAngle: sEnd / 360 * 2 * Math.PI,
    });
    return angularComponent;
  }
  return null;
}