import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../uiController";
import { Component } from "../../../lib/ui";
import { initializeTimeboxComponent, TimeboxComponent } from "../components";

export default function initializeCreateTimeboxInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("createTimebox", "start", [
    // angular brush
    {
      action: "createstart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        return  !instrument.getState("activeComponent") && instrument.getState("queryMode") === "timebox";
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

  let previewComponent: TimeboxComponent | null = null;
  let startPos = { x: 0, y: 0 };

  interactor.addEventListener("createstart", (event, props) => {
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    previewComponent = initializeTimeboxComponent();
    previewComponent.setLayoutConstraints({ x: event.offsetX, y: event.offsetY });
    previewComponent.setStyleMap("highlight");
    startPos = { x: event.offsetX, y: event.offsetY };
    container.pushComponent(`timebox-${new Date()}`, previewComponent);
  });
  interactor.addEventListener("creating", (event, props) => {
    const { container, instrument } = props;
    if (!(event instanceof MouseEvent)) return;
    if(!previewComponent) return;
    previewComponent.setLayoutConstraints({
      x: Math.min(startPos.x, event.offsetX),
      y: Math.min(startPos.y, event.offsetY),
      width: Math.abs(event.offsetX - startPos.x),
      height: Math.abs(event.offsetY - startPos.y),
    });
    container.reRender();
  })
  interactor.addEventListener("createend", (event, props) => {
    const { container, instrument } = props;
    if(!previewComponent) return;
    previewComponent.setStyleMap("normal");
    container.reRender();
  })

  return interactor;
}