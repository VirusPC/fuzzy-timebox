import { Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { AngularComponent, TimeboxComponent } from "../components";

export default function initializePanAngularInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "modifystart",  // resize
      events: ["mousedown"],  // wheel
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeComponent = instrument.getState("activeComponent");
        const activeWhere = instrument.getState("activeComponentWhere");
        return !!(activeComponent) && activeComponent.type === "angular" && (activeWhere === "handle" || activeWhere === "outerArc");
      },
      fromState: "start",  // start
      toState: "running",  // start
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
  
  let activeComponent: AngularComponent | null = null;
  let localWhere = "";
  let width = 0;
  interactor.addEventListener("modifystart", (event, props) => {
    console.log("start");
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("activeComponentWhere")!;
    activeComponent = instrument.getState("activeComponent") as AngularComponent;
    activeComponent?.setStyleMap("highlight");
    const {x1, x2, y} = activeComponent.getLayoutConstraints()!;
    offsetX = event.offsetX - x1; 
    offsetY = event.offsetY - y; 
    width = x2 - x1;
  });
  interactor.addEventListener("modifying", (event, props) => {
    console.log("pan modifying");
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    let {x1, x2, y} = activeComponent!.getLayoutConstraints()!;
    // let where = instrument.getState("where")
    x1 = event.offsetX - offsetX;
    x2 = x1 + width;
    y = event.offsetY - offsetY; 
    activeComponent!.setLayoutConstraints({x1, x2, y});
    container.reRender();
    // queriers.forEach((query, i) => {i !== activeQuerierIndex && query.render()});
    // if(localWhere === "outerArc" || localWhere === "handle") {
      // activeQuerier!.render({highlights: ["hLine", "outerArc"]});
    // }
  })
  interactor.addEventListener("modifyend", (event, props) => {
    console.log("pan end");
    const { container, instrument } = props;
    // just set preview as result conponent
    // const queriers = instrument.getState("queriers");
    activeComponent?.setStyleMap("normal");
    container.reRender();
  })

  return interactor;
}