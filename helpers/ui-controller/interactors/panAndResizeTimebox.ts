import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { TimeboxComponent } from "../components";

export default function initializePanAndResizeTimeboxInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        return  instrument.getState("activeComponent")?.type === "timebox";
      },
      fromState: "start",
      toState: "running",
    },
    {
      action: "modifying",
      events: ["mousemove"],
      fromState: "running",
      toState: "running",
    },
    {
      action: "modifyend",
      events: ["mouseup"],
      fromState: "running",
      toState: "start",
    },
  ]);

  // let minMaxRect= { xMin: 0, xMax: 0, yMin: 0, yMax: 0};
  let offsetX = 0;
  let offsetY = 0;
  let fixedSide = 0;
  
  // let activeComponentIndex = -1;
  let activeComponent: TimeboxComponent | null = null;
  let localWhere = "";
  interactor.addEventListener("modifystart", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("activeComponentWhere")!;
    activeComponent = instrument.getState("activeComponent") as TimeboxComponent;
    activeComponent.setStyleMap("highlight");
    const {x, y, width, height} = activeComponent.getLayoutConstraints()!;
    switch(localWhere) {
      case "topRect":  offsetY = event.offsetY - y; fixedSide = y + height; break;
      case "rightRect": offsetX = event.offsetX - x - width; fixedSide = x; break;
      case "bottomRect": offsetY = event.offsetY - y - height; fixedSide = y; break;
      case "leftRect": offsetX = event.offsetX - x; fixedSide = x + width; break;
      case "centerRect": offsetX = event.offsetX - x; offsetY = event.offsetY-y; break;// todo
    }
  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    let {x, y, width, height} = activeComponent!.getLayoutConstraints()!;
    switch(localWhere) {
      case "topRect": 
      {
        const newY = event.offsetY - offsetY; 
        y = Math.min(newY , fixedSide);
        height = Math.abs(newY - fixedSide);
        if(newY > fixedSide) localWhere = "bottomRect";
        break;
      }
      case "bottomRect": 
      {
        const newY = event.offsetY - offsetY; 
        y = Math.min(newY , fixedSide);
        height = Math.abs(newY - fixedSide);
        if(newY < fixedSide){
          localWhere = "topRect";
        }
        break;
      }
      case "rightRect":
      { 
        const newX = event.offsetX - offsetX; 
        x = Math.min(newX, fixedSide);
        width = Math.abs(newX - fixedSide);
        if(newX < fixedSide) localWhere = "leftRect";
        break;
      }
      case "leftRect":
      { 
        const newX = event.offsetX - offsetX; 
        x = Math.min(newX, fixedSide);
        width = Math.abs(newX - fixedSide);
        if(newX > fixedSide) localWhere = "rightRect";
        break;
      }
      case "centerRect": 
      {
        x = event.offsetX - offsetX; 
        y = event.offsetY - offsetY; 
        break;
      }
    }
    activeComponent!.setLayoutConstraints({x, y, width, height});
    container.reRender();
  })
  interactor.addEventListener("modifyend", (event, props) => {
    const { container, instrument } = props;
    activeComponent?.setStyleMap("normal");
    container.reRender();
  })

  return interactor;
}