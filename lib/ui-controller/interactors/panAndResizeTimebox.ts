import { Layer, Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { TimeboxComponent } from "../components";

export default function initializePanAndResizeTimeboxInteractor(renderTargetLayer: Layer) {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeQuerierIndex = instrument.getState("activeQuerierIndex")
        if(activeQuerierIndex <0 ) return false;
        const queriers = instrument.getState("queriers");
        const activeQuerier = queriers[activeQuerierIndex];
        return activeQuerier.type === "timebox";
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
  
  let activeQuerierIndex = -1;
  let activeQuerier: TimeboxComponent | null = null;
  let localWhere = "";
  interactor.addEventListener("modifystart", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("where")!;
    const queriers = instrument.getState("queriers");
    activeQuerierIndex = instrument.getState("activeQuerierIndex")
    activeQuerier = queriers[activeQuerierIndex] as TimeboxComponent;
    const {x, y, width, height} = activeQuerier.getLayoutConstraints()!;
    switch(localWhere) {
      case "topRect":  offsetY = event.offsetY - y; fixedSide = y + height; break;
      case "rightRect": offsetX = event.offsetX - x - width; fixedSide = x; break;
      case "bottomRect": offsetY = event.offsetY - y - height; fixedSide = y; break;
      case "leftRect": offsetX = event.offsetX - x; fixedSide = x + width; break;
      case "centerRect": offsetX = event.offsetX - x; offsetY = event.offsetY-y; break;// todo
    }
    // minMaxRect = { xMin: x, xMax: x + width, yMin: y, yMax: y + height};
  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    const queriers = instrument.getState("queriers");
    let {x, y, width, height} = activeQuerier!.getLayoutConstraints()!;
    // let where = instrument.getState("where")
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
    activeQuerier!.setLayoutConstraints({x, y, width, height});
    // console.log(x, y, width, height);
    renderTargetLayer.clear();
    queriers.forEach((query, i) => {i !== activeQuerierIndex && query.render()});
    if(localWhere === "topRect" || localWhere === "bottomRect" || localWhere === "leftRect" || localWhere === "rightRect" || localWhere === "centerRect") {
      activeQuerier!.render({highlights: [localWhere]});
    }
  })
  interactor.addEventListener("modifyend", (event, props) => {
    const { container, instrument } = props;
    // just set preview as result conponent
    const queriers = instrument.getState("queriers");
    renderTargetLayer.clear();
    queriers.forEach((query) => {query.render()});
  })

  return interactor;
}