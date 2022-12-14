import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";
import { QueryMode, QueryInstrumentState, UIController } from "../helpers/ui-controller";
import { Container, Instrument } from "../lib/interaction";
import { AngularQueryTask, generateShapeSearch, parseComponent, parseShapeSearch, SequentialSearch, TimeboxQueryTask } from "../helpers/query";
import { screenHeight, screenWidth } from "../views/MainView";
import { GeneralComponent } from "../lib/interaction/container";
import { QueryTask, generateComponent } from "../helpers/query";
import { AngularComponent, TimeboxComponent } from "../helpers/ui-controller/components";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import dataStore from "./DataStore";
import { intersection } from "lodash";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

class QueryStore {
  queryMode: QueryMode;
  _uiController: UIController | null;
  _editor: monaco.editor.IStandaloneCodeEditor | null;
  tasks: QueryTask[];
  results: (Point<number, string>[] | Point<number, number>[] | Point<Date, number>[] | Point<Date, string>[])[];

  constructor() {
    this.queryMode = "timebox";
    this.tasks = [];
    this.results = [];
    this._uiController = null;
    this._editor = null;
    makeAutoObservable(this);
  }

  set uiController(controller: UIController | null) {
    if(this._uiController === controller) return;
    this._uiController?.clearup();
    if (controller) {
      this._controlEditor(controller);
    }
    this._uiController = controller;
  }

  set editor(editor: monaco.editor.IStandaloneCodeEditor | null) {
    if(this._editor === editor) return;
    if(!editor) {
      this._uiController?.removeAllEventListener();
    }
    this._editor = editor;
  }

  setQueryMode(queryMode: QueryMode) {
    this.queryMode = queryMode;
    this._uiController?.setMode(queryMode);
  }

  _executeVisualQuery(components: (TimeboxComponent | AngularComponent)[]) {
    const tasks = parseComponent(components, screenHeight);
    this.tasks = tasks;
    const shapeSearchExpr = generateShapeSearch(tasks, screenWidth, screenHeight,  (d: number) => d, (d: number) => d);
    this._editor?.setValue(shapeSearchExpr);
    this.executeTasks();
  }

  executeShapeSearch(text: string) {
    const tasks = parseShapeSearch(text, [0, screenWidth], [0, screenHeight], [-90, 90])?.filter(task => task !== null);
    if (!tasks) return;
    this.tasks = tasks;
    this._reRenderComponentsWithTasks();
    this.executeTasks();
  }

  executeTasks() {
    console.log("tasks: ", this.tasks);
    const resultsForTasks: number[][] =  this.tasks.map((task) => {
      let results: number[] = [];
      if(task.mode === "timebox") {
        console.log("kd tree", dataStore.kdTree);
        results = dataStore.kdTree?.timebox({
              x1: task.constraint.xStart,
              x2: task.constraint.xEnd,
              y1: task.constraint.yStart,
              y2: task.constraint.yEnd,
              p: task.constraint.p
        }) || [];
        // results = dataStore.sequentialSearch?.timebox({
        //   x1: task.constraint.xStart,
        //   x2: task.constraint.xEnd,
        //   y1: task.constraint.yStart,
        //   y2: task.constraint.yEnd,
        //   p: task.constraint.p
        // }) || [];
      } else if(task.mode === "angular"){
        results = dataStore.sequentialSearch?.angular({
          x1: task.constraint.xStart,
          x2: task.constraint.xEnd,
          slope1: task.constraint.sStart,
          slope2: task.constraint.sEnd,
          p: task.constraint.p
        }) || [];
      }
      return results;
    });
    const intersectionResults = intersection(...resultsForTasks);
    const lines = intersectionResults.map(lineId => dataStore.aggregatedPlainData[lineId]);
    this.results = lines;
    console.log("search results: ", lines);
  }

  private _reRenderComponentsWithTasks() {
    const components = generateComponent(this.tasks, screenWidth, screenHeight, (d: number) => d, (d: number) =>  d);
    const componentMap: { [name: string]: GeneralComponent } = {};
    components.forEach((component) => {
      if (!component) return;
      componentMap[`${component?.type}-${new Date()}`] = component;
    });
    this._uiController?.reRenderComponents(componentMap);
  }

  private _controlEditor(controller: UIController) {
    controller.addEventListener([
      "createTimebox_createend", 
      // "createTimebox_creating", 
      "createAngular_createend", 
      "panAndResizeTimebox_modifyend",
      "panAngular_modifyend",
      "resizeAngular_modifyend",
      "resizeAngular_modifywheel",
    ], (component, event, props) => {
      const components = [...controller.getComponents().values()];
      this._executeVisualQuery(components as (TimeboxComponent | AngularComponent)[]);
    });
  }

}

function diff(task1: QueryTask, task2: QueryTask) { }

const queryStore = new QueryStore();
export default queryStore;
