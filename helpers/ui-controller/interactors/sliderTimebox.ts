import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../uiController";
import { TimeboxComponent } from "../components";

export default function initializeSliderTimeboxInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("sliderTimebox", "start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeComponent = instrument.getState("activeComponent");
        const activeWhere = instrument.getState("activeComponentWhere");
        return  activeComponent?.type === "timebox" && activeWhere === "sliderHandle";
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
    const {x, y, width, height, p} = activeComponent.getLayoutConstraints()!;
    offsetX = event.offsetX - width * p - x;
  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    let {x, y, width, height} = activeComponent!.getLayoutConstraints()!;

    const newX = Math.max(Math.min(event.offsetX - offsetX, x+width), x); 

    const p = ((newX -  x) / width).toFixed(2);
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