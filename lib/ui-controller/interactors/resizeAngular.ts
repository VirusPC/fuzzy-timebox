import { Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { AngularComponent, TimeboxComponent } from "../components";

export default function initializeResizeAngularInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeComponent = instrument.getState("activeComponent");
        const activeWhere = instrument.getState("activeComponentWhere");
        return !!(activeComponent) && activeComponent.type === "angular" && (
          activeWhere === "innerArc" || activeWhere === "hLineLeftRect" || activeWhere === "hLineRightRect" || activeWhere === "arcBottomArc" || activeWhere === "arcTopArc");
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
    {
      action: "modifywheel",
      events: ["wheel"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeComponent = instrument.getState("activeComponent");
        const activeWhere = instrument.getState("activeComponentWhere");
        return !!activeComponent && activeComponent.type === "angular" && activeWhere === "innerArc";
      },
      fromState: "start",
      toState: "start"
    }
  ]);

  // let minMaxRect= { xMin: 0, xMax: 0, yMin: 0, yMax: 0};
  let offsetAngle = 0;
  let spanAngle = 0;
  let offsetX = 0;
  let fixedSide = 0;
  let fixedArc = 0;

  let activeComponent: AngularComponent | null = null;
  let localWhere = "";

  interactor.addEventListener("modifystart", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("activeComponentWhere")!;
    activeComponent = instrument.getState("activeComponent") as AngularComponent;
    activeComponent.setStyleMap("highlight-inner-arc");
    const { x1, x2, y, startAngle, endAngle } = activeComponent.getLayoutConstraints()!;
    switch (localWhere) {
      case "innerArc":
        {
          offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - startAngle;
          spanAngle = endAngle - startAngle;
          break;
        }
      case "hLineLeftRect":
        {
          offsetX = event.offsetX - x1;
          fixedSide = x2;
          break;
        }
      case "hLineRightRect":
        {
          offsetX = event.offsetX - x2;
          fixedSide = x1;
          break;
        }
      case "arcTopArc":
        {
          offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - startAngle;
          fixedArc = endAngle;
          break;
        }
      case "arcBottomArc":
        {
          offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - endAngle;
          fixedArc = startAngle;
          break;
        }
    }

  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    let { x1, x2, y, startAngle, endAngle } = activeComponent!.getLayoutConstraints()!;
    switch (localWhere) {
      case "innerArc":
        {
          const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
          const newStartAngle = currentAngle - offsetAngle;
          const newEndAngle = newStartAngle + spanAngle;
          if (newStartAngle > -Math.PI / 2 && newEndAngle < Math.PI / 2) {
            activeComponent!.setLayoutConstraints({ startAngle: newStartAngle, endAngle: newEndAngle });
          }
          break;
        }
      case "hLineLeftRect":
        {
          const newX = event.offsetX - offsetX;
          if (newX > fixedSide) { x1 = fixedSide; x2 = newX; }
          else x1 = newX;
          if (newX > fixedSide) localWhere = "hLineRightRect";
          activeComponent!.setLayoutConstraints({ x1, x2, y, startAngle, endAngle });
          break;
        }
      case "hLineRightRect":
        {
          const newX = event.offsetX - offsetX;
          if (newX < fixedSide) { x1 = newX; x2 = fixedSide; }
          else x2 = newX;
          if (newX < fixedSide) localWhere = "hLineLeftRect";
          activeComponent!.setLayoutConstraints({ x1, x2, y, startAngle, endAngle });
          break;
        }
      case "arcTopArc":
        {
          const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
          const newStartAngle = currentAngle - offsetAngle;
          const newEndAngle = endAngle;
          if (newStartAngle > fixedArc) { endAngle = newStartAngle; startAngle = fixedArc; }
          else startAngle = newStartAngle;
          if (newStartAngle > fixedArc) { localWhere = "arcBottomArc"; fixedArc = endAngle; }
          if (startAngle > -Math.PI / 2 && endAngle < Math.PI / 2) {
            activeComponent!.setLayoutConstraints({ startAngle, endAngle });
          }
          break;
        }
      case "arcBottomArc":
        {
          const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
          const newEndAngle = currentAngle - offsetAngle;
          const newStartAngle = startAngle;
          if (newEndAngle < fixedArc) { startAngle = newEndAngle; endAngle = fixedArc; }
          else endAngle = newEndAngle;
          if (newEndAngle < fixedArc) { localWhere = "arcTopArc"; fixedArc = startAngle; }
          if (startAngle > -Math.PI / 2 && endAngle < Math.PI / 2) {
            activeComponent!.setLayoutConstraints({ startAngle, endAngle });
          }
          break;
        }
    }
    container.reRender();
  })
  interactor.addEventListener("modifyend", (event, props) => {
    const { container, instrument } = props;
    // just set preview as result conponent
    activeComponent?.setStyleMap("normal");
    container.reRender();
  })

  let timer: NodeJS.Timeout | undefined = undefined;
  const EPAPSED_TIME = 1000;
  interactor.addEventListener("modifywheel", (event, props) => {
    if (!(event instanceof WheelEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("activeComponentWhere")!;
    activeComponent = instrument.getState("activeComponent") as AngularComponent;
    const { startAngle, endAngle } = activeComponent.getLayoutConstraints()!;
    let newStartAngle = 180 / Math.PI * startAngle;
    let newEndAngle = 180 / Math.PI * endAngle;
    const sign = Math.sign(event.deltaY);
    newStartAngle = Math.max(-90, newStartAngle - sign);
    newEndAngle = Math.min(90, newEndAngle + sign);
    newStartAngle = Math.PI / 180 * newStartAngle;
    newEndAngle = Math.PI / 180 * newEndAngle;
    activeComponent!.setLayoutConstraints({ startAngle: newStartAngle, endAngle: newEndAngle });
    activeComponent.setStyleMap("highlight-inner-arc");
    container.reRender();
    clearTimeout(timer);
    timer = setTimeout(() => {
      activeComponent?.setStyleMap("normal");
      container.reRender();
    }, EPAPSED_TIME);

  })

  return interactor;
}