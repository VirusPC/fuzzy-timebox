import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../uiController";
import { AngularComponent } from "../components";

export default function initializeSliderAngularInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("sliderAngular", "start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeComponent = instrument.getState("activeComponent");
        const activeWhere = instrument.getState("activeComponentWhere");
        return  activeComponent?.type === "angular" && activeWhere === "slider";
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
  let activeComponent: AngularComponent | null = null;
  let localWhere = "";
  interactor.addEventListener("modifystart", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("activeComponentWhere")!;
    activeComponent = instrument.getState("activeComponent") as AngularComponent;
    activeComponent.setStyleMap("highlight-slider");
    const {x1, x2, p} = activeComponent.getLayoutConstraints()!;
    offsetX = event.offsetX - (x2-x1) * p - x1;
  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    const {x1, x2} = activeComponent!.getLayoutConstraints()!;

    const newX = Math.max(Math.min(event.offsetX - offsetX, x2), x1); 

    const p = ((newX -  x1) / (x2 - x1)).toFixed(2);
    activeComponent!.setLayoutConstraints({p: +p});
    container.reRender();
  })
  interactor.addEventListener("modifyend", (event, props) => {
    const { container, instrument } = props;
    // activeComponent?.setStyleMap("normal");
    container.reRender();
  })

  return interactor;
}