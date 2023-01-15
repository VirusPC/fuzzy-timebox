import { GeneralComponent } from "../../../lib/interaction/container";
import { AngularComponent, TimeboxComponent } from "../../ui-controller/components";
import { AngularQueryTask, LegalComponent, QueryTask, TimeboxQueryTask } from "../types";

// export default function parseComponents(components: GeneralComponent[] | GeneralComponent): QueryTask[] {
//   if(Array.isArray(components)){
//     return components.map(component => parseComponent(component)).filter(task => task !== null) as QueryTask[];
//   } else {
//     const task = parseComponent(components)
//     return  task ? [task] : [];
//   }
// }


export default function parseComponent(component: LegalComponent | LegalComponent[], screenHeight: number ): QueryTask[] {
  if(Array.isArray(component)) {
    const tasks = component.map((c) => parseSingleComponent(c, screenHeight)).filter(c => c!==null) as QueryTask[];
    return tasks;
  } else {
    const task = parseSingleComponent(component, screenHeight);
    return task ? [task] : [];
  }
}

function parseSingleComponent(component: TimeboxComponent | AngularComponent, screenHeight: number): TimeboxQueryTask | AngularQueryTask | null {
  if (component.type === "timebox") {
    const { x, y, width, height, p } = component.getLayoutConstraints();
    const task: TimeboxQueryTask = {
      mode: "timebox",
      constraint: {
        xStart: x,
        xEnd: x + width,
        // yStart: screenHeight -  y - height,
        // yEnd: screenHeight - y,
        yStart:  y,
        yEnd: y + height,
        p: p
      }
    };
    return task;
  } else if (component.type === "angular") {
    const { x1, x2, startAngle, endAngle, p } = component.getLayoutConstraints();
    const task: AngularQueryTask = {
      mode: "angular",
      constraint: {
        xStart: x1,
        xEnd: x2,
        sStart: -endAngle, // reverse y-axis
        sEnd: -startAngle,
        p: p
      }
    }
    return task;
  }
  return null;
}
