import { Interactor } from "../../../lib/interaction";
import { QueryInstrumentProps } from "../uiController";
import { initializeTimeboxComponent, TimeboxComponent } from "../components";
import { Component } from "../../../lib/ui";

export default function initializeCreateTimeboxInteractor() {
  const interactor = new Interactor<QueryInstrumentProps>("createTimebox", "start", [
    // angular brush
    {
      action: "hover",
      events: ["mousemove"],
      // filter: (event: Event, props: QueryInstrumentProps) => {
      // const { container, instrument } = props;
      // return  !!instrument.getState("activeComponent");
      // },
      fromState: "start",
      toState: "start",
    }
  ]);

  let lastActiveComponent: Component<string, string, {}> | null = null;
  interactor.addEventListener("hover", (event, props) => {
    const { container, instrument } = props;
    const activeComponent = instrument.getState("activeComponent");
    if (activeComponent === lastActiveComponent) return;
    activeComponent?.setStyleMap("highlight");
    lastActiveComponent?.setStyleMap("normal");
    lastActiveComponent = activeComponent;
    container.reRender();
  })
  return interactor;
}