// import AliTVSTree from "../../../../lib/kd-box-incremental";
import { Container, Instrument, Interactor } from "../interaction";
import { InstrumentProps } from "../interaction";
import { Component } from "../ui";
import { LayoutConstraints } from "../ui/component";
import { initializeCreateTimeboxInteractor, initializePanAndResizeTimeboxInteractor } from "./interactors";
import { initializeCreateAngularInteractor, initializePanAngularInteractor, initializeResizeAngularInteractor } from "./interactors";
// import { initializeTimeboxComponent, initializeAngularComponent, initializeAngularPreviewComponent } from "./components";
import { TimeboxComponent, AngularPreviewComponent, AngularComponent } from "./components";
// import initializePanAndResizeTimeboxInteractor from "./interactors/panAndResizeTimebox";
// import initializeCreateAngularInteractor from "./interactors/createAngular";
// import initializePanAngularInteractor from "./interactors/panAngular";
// import initializeResizeAngularInteractor from "./interactors/resizeAngular";

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

/**
 *
 *
 * @export
 * @param {HTMLDivElement} root
 * @param {AliTVSTree} kdTree
 * @param {{width: number, height: number, top: number, left: number}} layerStyle
 */
export default function appendUIController(
  root: HTMLCanvasElement,
  // kdTree: AliTVSTree,
  width: number,
  height: number,
  defaultQueryMode: QueryMode = "timebox",
  setQueriers: (queriers: QueryComponent[]) => void,
) {
  const container = new Container(root, width, height);

  /** add interaction */
  const defaultState: QueryInstrumentState = {
    queryMode: defaultQueryMode,
    activeComponentName: null,
    activeComponent: null,
    activeComponentWhere: null,
    syntheticEvent: null,
  }
  const instrument = new Instrument<QueryInstrumentState>(defaultState);
  instrument.setContainer(container);

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
      console.log(where.where);
    } else {
      instrument.setState("activeComponentName", null);
      instrument.setState("activeComponentWhere", null);
      instrument.setState("activeComponent", null);
    }
  });

  // const setQueriersState = () => {
  //   const queriers = instrument.getState("queriers");
  //   setQueriers([...queriers]);
  // }

  // timebox
  const createTimeboxQueryInteractor = initializeCreateTimeboxInteractor();
  instrument.addInteractor(createTimeboxQueryInteractor);

  const modifyTimeboxInteractor = initializePanAndResizeTimeboxInteractor();
  instrument.addInteractor(modifyTimeboxInteractor);

  // angular
  const createAngularQueryInteractor = initializeCreateAngularInteractor();
  // createAngularQueryInteractor.addEventListener("createend", setQueriersState)
  instrument.addInteractor(createAngularQueryInteractor);

  const panAngularQueryInteractor = initializePanAngularInteractor();
  // panAngularQueryInteractor.addEventListener("modifyend", setQueriersState)
  instrument.addInteractor(panAngularQueryInteractor);

  const resizeAngularQueryInteractor = initializeResizeAngularInteractor();
  // resizeAngularQueryInteractor.addEventListener("modifyend", setQueriersState)
  instrument.addInteractor(resizeAngularQueryInteractor);
  // modify timebox query component 
  // const createTimeboxInteractor = initializeTimeboxInteractor(queryLayer);
  // instrument.addInteractor(createTimeboxInteractor);

  // modify angular query component 
  // const createAngularInteractor = initializeTimeboxInteractor(queryLayer);
  // instrument.addInteractor(createTimeboxInteractor);
  return {
    // queriers: instrument.getState("queriers"),
    setQueryMode: function (mode: QueryMode) {
      console.log("set query mode on UI: ", mode);
      instrument.setState("queryMode", mode);
    },
    container: container,
    instrument: instrument
    // deleteQuerier: function (index?: number) {
    //   console.log("delete query", index)
    //   const queriers = instrument.getState("queriers");
    //   if (index === undefined) {
    //     instrument.setState("queriers", []);
    //     queryLayer.clear();
    //   } else {
    //     queriers.splice(index, 1);
    //     queryLayer.clear();
    //     queriers.forEach((querier) => querier.render());
    //   }
    //   setQueriersState();
    // },
    // reRenderAll: function () {
    //   const queriers = instrument.getState("queriers");
    //   queryLayer.clear();
    //   queriers.forEach((querier) => querier.render());
    // }
  }
}
