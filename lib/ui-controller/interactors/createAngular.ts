import { Container, Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { Component } from "../../ui";
import { initializeAngularComponent, AngularComponent, initializeAngularPreviewComponent, AngularPreviewComponent } from "../components";

export default function initializeCreateAngularInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "createstart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
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
    console.log("creating");
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    if(!previewComponent) return;
    previewComponent.setLayoutConstraints({
      x1: Math.min(startPos.x, event.offsetX),
      x2: Math.max(startPos.x, event.offsetX),
    });
    // renderTargetLayer.clear();
    // const queriers = instrument.getState("queriers");
    // queriers.forEach((query) => {query.render()});
    // previewComponent.render({highlights: ["hLine"]});
    container.reRender();
  })
  interactor.addEventListener("createend", (event, props) => {
    const { container, instrument } = props;
    if(!previewComponent) return;
    container.popComponent();
    // just set preview as result conponent
    // const queriers = instrument.getState("queriers");
    const angularComponent = initializeAngularComponent();
    const {x1, x2, y} = previewComponent.getLayoutConstraints();
    angularComponent.setLayoutConstraints({x1, x2, y});
    container.pushComponent(`angular-${new Date()}`, angularComponent);
    container.reRender();
    // angularComponent.setIntersectionTester(intersecitonTester);
    // angularComponent.setRenderer(renderer);
    // console.log(angularComponent.getLayoutConstraints());
    // queriers.push(angularComponent);
    // instrument.setState("activeQuerierIndex", -1);
    // renderTargetLayer.clear();
    // queriers.forEach((query) => {query.render()});
  })

  return interactor;
}