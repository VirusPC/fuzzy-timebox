import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../uiController";
import { initializeAngularComponent, initializeAngularPreviewComponent, AngularPreviewComponent } from "../components";

export const NAME = "CREATE_ANGULAR"; 
export const ACTIONS = [
  "createstart", 
  "creating",
  "createend"
]; 

export default function initializeCreateAngularInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("createAngular", "start", [
    // angular brush
    {
      action: "createstart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { instrument } = props;
        return  !instrument.getState("activeComponent") && instrument.getState("queryMode") === "angular";
      },
      fromState: "start",
      toState: "running",
    },
    {
      action: "creating",
      events: ["mousemove"],
      fromState: "running",
      toState: "running",
    },
    {
      action: "createend",
      events: ["mouseup"],
      fromState: "running",
      toState: "start",
    },
  ]);

  let previewComponent: AngularPreviewComponent | null = null;
  let startPos = { x: 0, y: 0 };
  interactor.addEventListener("createstart", (event, props) => {
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    previewComponent = initializeAngularPreviewComponent();
    previewComponent.setLayoutConstraints({ x1: event.offsetX, x2: event.offsetX, y: event.offsetY });
    startPos = { x: event.offsetX, y: event.offsetY };
    container.pushComponent(`angular-${new Date()}`, previewComponent);
    container.reRender();
  });
  interactor.addEventListener("creating", (event, props) => {
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    if(!previewComponent) return;
    previewComponent.setLayoutConstraints({
      x1: Math.min(startPos.x, event.offsetX),
      x2: Math.max(startPos.x, event.offsetX),
    });
    container.reRender();
  })
  interactor.addEventListener("createend", (event, props) => {
    const { container, instrument } = props;
    if(!previewComponent) return;
    container.popComponent();
    const angularComponent = initializeAngularComponent();
    const {x1, x2, y} = previewComponent.getLayoutConstraints();
    angularComponent.setLayoutConstraints({x1, x2, y, p: 0.8});
    container.pushComponent(`angular-${new Date()}`, angularComponent);
    container.reRender();
  })

  return interactor;
}