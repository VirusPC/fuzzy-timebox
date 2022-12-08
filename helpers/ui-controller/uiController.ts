import { Container, Instrument, Interactor } from "../../lib/interaction";
import { InstrumentProps } from "../../lib/interaction";
import { Component } from "../../lib/ui";
import { initializeCreateTimeboxInteractor, initializePanAndResizeTimeboxInteractor } from "./interactors";
import { initializeCreateAngularInteractor, initializePanAngularInteractor, initializeResizeAngularInteractor } from "./interactors";
import { TimeboxComponent, AngularPreviewComponent, AngularComponent } from "./components";

export type QueryMode = "timebox" | "angular" | "mix" | "knn" | "rnn" | "hover" | "sketch" | "zoom";
export type InteractorType = "create" | QueryMode;

export type QueryComponent = TimeboxComponent | AngularComponent

export type QueryInstrumentState = {
  activeComponentName: null | string,
  activeComponent: null | Component<string, string, {}>,
  activeComponentWhere: null | string,
  queryMode: QueryMode,
  syntheticEvent: {
    rawEvent: Event,
    x: number,
    y: number,
  } | null,
}
export type QueryInstrumentProps = InstrumentProps<QueryInstrumentState>;
export type Listener = (event: Event, props: QueryInstrumentProps) => void;

export class UIController {
  container: Container;
  instrument: Instrument<QueryInstrumentState>;
  listeners: { [eventName: string]: Listener[] }

  constructor(root: HTMLCanvasElement, width: number, height: number, defaultQueryMode: QueryMode = "timebox",) {
    // container
    this.container = new Container(root, width, height);

    // listeners
    this.listeners = {};

    // instrument
    const defaultState: QueryInstrumentState = {
      queryMode: defaultQueryMode,
      activeComponentName: null,
      activeComponent: null,
      activeComponentWhere: null,
      syntheticEvent: null,
    }
    this.instrument = new Instrument<QueryInstrumentState>(defaultState);
    this.instrument.setContainer(this.container);
    initializeQueryInstrument(this.instrument, this.listeners);
  }

  clearup() {
    this.instrument.removeFromContainer();
  }

  addEventListener(eventName: string, listener: Listener) {
    this.listeners[eventName] ? this.listeners[eventName].push(listener) : this.listeners[eventName] = [listener];
  }

  removeEventListener(eventName: string, listener?: Listener) {
    if (!this.listeners[eventName]) return;
    if (!listener) {
      delete this.listeners[eventName];
    } else {
      this.listeners[eventName] = this.listeners[eventName].filter(l => l !== l);
      if (this.listeners[eventName].length === 0) delete this.listeners[eventName];
    }
  }

}

function initializeQueryInstrument(instrument: Instrument<QueryInstrumentState>, listenerMap: { [eventName: string]: Listener[] }) {
  instrument.setPreEffect((event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    instrument.setState("syntheticEvent", {
      rawEvent: event,
      x: event.offsetX,
      y: event.offsetY,
    });
    const where = container.onWhere(event.offsetX, event.offsetY);
    if (where !== null) {
      instrument.setState("activeComponentName", where.componentName);
      instrument.setState("activeComponentWhere", where.where);
      instrument.setState("activeComponent", container.getComponent(where.componentName) || null);
    } else {
      instrument.setState("activeComponentName", null);
      instrument.setState("activeComponentWhere", null);
      instrument.setState("activeComponent", null);
    }
  });

  function getCommonListener(newActionName: string): Listener {
    return (event, props) => {
      const listeners = listenerMap[newActionName];
      if (listeners) {
        listeners.forEach((listener) => {
          listener(event, props);
        });
      }
    };
  }

  // timebox
  const createTimeboxQueryInteractor = initializeCreateTimeboxInteractor();
  instrument.addInteractor(createTimeboxQueryInteractor);

  const modifyTimeboxInteractor = initializePanAndResizeTimeboxInteractor();
  instrument.addInteractor(modifyTimeboxInteractor);

  // angular
  const createAngularQueryInteractor = initializeCreateAngularInteractor();
  instrument.addInteractor(createAngularQueryInteractor);

  const panAngularQueryInteractor = initializePanAngularInteractor();
  instrument.addInteractor(panAngularQueryInteractor);

  const resizeAngularQueryInteractor = initializeResizeAngularInteractor();
  instrument.addInteractor(resizeAngularQueryInteractor);

  instrument.interactors.forEach((interactor) => {
    interactor.actions.forEach((action) => {
      interactor.addEventListener(action, getCommonListener(`${interactor.name}_${action}`));
    });
  });

}