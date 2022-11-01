import { Layer, Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { Component, IntersectionTester, Renderer } from "../../ui";
import { initializeTimeboxComponent, TimeboxComponent } from "../components";

export default function initializeCreateTimeboxInteractor(renderTargetLayer: Layer) {
  const context = renderTargetLayer.graphic.getContext("2d")!
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "createstart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        // trigger when click on background
        return (instrument.getState("activeQuerierIndex") < 0)
          && (instrument.getState("queryMode") === "timebox");
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

  const intersecitonTester = new IntersectionTester();
  const renderStyle = {
    normal: {
      strokeStyle: "black",
      fillStyle: "rgba(1, 1, 1, 0.3)",
      lineWidth: 3,
    },
    highlight: {
      strokeStyle: "red",
      fillStyle: "rgba(0, 0, 0, 0.5)",
      lineWidth: 5,
    },
}
  const renderer = new Renderer(context, renderStyle);
  let previewComponent: TimeboxComponent | null = null;
  let startPos = { x: 0, y: 0 };
  interactor.addEventListener("createstart", (event, props) => {
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    previewComponent = initializeTimeboxComponent();
    previewComponent.setIntersectionTester(intersecitonTester);
    previewComponent.setRenderer(renderer);
    previewComponent.setLayoutConstraints({ x: event.offsetX, y: event.offsetY });
    startPos = { x: event.offsetX, y: event.offsetY };
  });
  interactor.addEventListener("creating", (event, props) => {
    console.log("creating");
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    if(!previewComponent) return;
    previewComponent.setLayoutConstraints({
      x: Math.min(startPos.x, event.offsetX),
      y: Math.min(startPos.y, event.offsetY),
      width: Math.abs(event.offsetX - startPos.x),
      height: Math.abs(event.offsetY - startPos.y),
    });
    renderTargetLayer.clear();
    const queriers = instrument.getState("queriers");
    queriers.forEach((query) => {query.render()});
    previewComponent.render({highlights: ["centerRect"]});
  })
  interactor.addEventListener("createend", (event, props) => {
    const { container, instrument } = props;
    if(!previewComponent) return;
    // just set preview as result conponent
    const queriers = instrument.getState("queriers");
    queriers.push(previewComponent);
    renderTargetLayer.clear();
    queriers.forEach((query) => {query.render()});
  })

  return interactor;
}