import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";
import { QueryMode, UIController } from "../helpers/ui-controller";
import { AngularConstraints, generateShapeSearch, parseComponent, parseShapeSearch, TimeboxConstraints } from "../helpers/query";
import { screenHeight, screenWidth } from "../views/MainView";
import { GeneralComponent } from "../lib/interaction/container";
import { QueryTask, generateComponent, CCHKDTree } from "../helpers/query";
import { AngularComponent, TimeboxComponent } from "../helpers/ui-controller/components";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import dataStore from "./DataStore";
import { intersection } from "lodash";
import { MinMaxSet } from "../helpers/query/algorithms/MinMaxSet";
import { scoring } from "../helpers/query/algorithms/scoring";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

class QueryStore {
  queryMode: QueryMode;
  _uiController: UIController | null;
  _editor: monaco.editor.IStandaloneCodeEditor | null;
  tasks: QueryTask[];
  results: number[];
  scores: { [lineID: number]: number };

  resultsEachTask: number[][];
  minMaxSetMaps: (Map<number, MinMaxSet> | null)[] = [];
  precentageMaps: (Map<number, number> | null)[] = [];

  constructor() {
    this.queryMode = "timebox";
    this.tasks = [];
    this.results = [];
    this.scores = Object.create(null);
    this._uiController = null;
    this._editor = null;
    this.resultsEachTask = [];
    this.minMaxSetMaps = [];
    this.precentageMaps = [];
    makeAutoObservable(this, {
      "minMaxSetMaps": false,
      "resultsEachTask": false,
      "precentageMaps": false
    },);
  }

  set uiController(controller: UIController | null) {
    if (this._uiController === controller) return;
    this._uiController?.clearup();
    if (controller) {
      this._controlEditor(controller);
    }
    this._uiController = controller;
  }

  set editor(editor: monaco.editor.IStandaloneCodeEditor | null) {
    if (this._editor === editor) return;
    if (!editor) {
      this._uiController?.removeAllEventListener();
    }
    this._editor = editor;
  }

  reset() {
    this.queryMode = "timebox";
    this._uiController?.clearup();
    // this._editor = null;
    this.tasks = [];
    this.resultsEachTask = [];
    this.results = [];
    this.minMaxSetMaps = [];
    this.precentageMaps = [];
    this.scores = Object.create(null);
  }

  setQueryMode(queryMode: QueryMode) {
    this.queryMode = queryMode;
    this._uiController?.setMode(queryMode);
  }

  _executeVisualQuery(components: (TimeboxComponent | AngularComponent)[]) {
    const tasks = parseComponent(components, screenHeight);
    console.log("visual query", components, tasks);
    const shapeSearchExpr = generateShapeSearch(tasks, screenWidth, screenHeight, (d: number) => d, (d: number) => d);
    this._editor?.setValue(shapeSearchExpr);
    this.executeTasks(tasks);
  }

  executeShapeSearch(text: string) {
    const tasks = parseShapeSearch(text, [0, screenWidth], [0, screenHeight], [-Math.PI/2, Math.PI/2])?.filter(task => task !== null);
    if (!tasks) return;
    this._reRenderComponentsWithTasks(tasks);
    this.executeTasks(tasks);
    this.scoring();
  }

  executeTasks(tasks: QueryTask[]) {
    console.log("tasks", tasks);
    this.tasks = tasks;
    const resultsEachTask: number[][] = [];
    const minMaxSetMaps: (Map<number, MinMaxSet> | null)[] = [];
    const precentageMaps: (Map<number, number> | null)[] = [];
    tasks.forEach((task) => {
      let results: number[] = [];
      console.time("query time");
      if (task.mode === "timebox") {
        results = dataStore.CCHKDTree?.timebox({
          type: "timebox",
          x1: task.constraint.xStart,
          x2: task.constraint.xEnd,
          y1: task.constraint.yStart,
          y2: task.constraint.yEnd,
          p: task.constraint.p
        }) || [];
      } else if (task.mode === "angular") {
        results = dataStore.CCHKDTree?.angular({
          type: "angular",
          x1: task.constraint.xStart,
          x2: task.constraint.xEnd,
          slope1: Math.tan(-task.constraint.radianEnd),
          slope2: Math.tan(-task.constraint.radianStart),
          p: task.constraint.p
        }) || [];
      }
      resultsEachTask.push(results);
      minMaxSetMaps.push((dataStore.CCHKDTree as CCHKDTree)._kdtree?.minMaxSet || null);
      precentageMaps.push((dataStore.CCHKDTree as CCHKDTree)._kdtree?.percentages || null);
      // return results;
    });
    console.timeEnd("query time");
    const intersectionResults = intersection(...resultsEachTask);
    this.results = intersectionResults;
    this.resultsEachTask = resultsEachTask;
    this.minMaxSetMaps = minMaxSetMaps;
    this.precentageMaps = precentageMaps;
    console.log("search results: ", intersectionResults);
  }

  scoring() {
    if (dataStore.CCHKDTree === null
      || !this.minMaxSetMaps || this.minMaxSetMaps.length === 0
      || !this.precentageMaps || this.precentageMaps.length === 0
      || !this.resultsEachTask || this.resultsEachTask.length === 0
    ) {
      this.scores = Object.create(null);
      return;
    };
    const kdtree = dataStore.CCHKDTree as CCHKDTree;
    console.log("scoring");
    const scoreMaps: { [lineID: number]: number }[] = this.tasks.map((task, i) => {
      const minMaxSetMap = this.minMaxSetMaps[i];
      const precentageMap = this.precentageMaps[i];
      const scoreMap = (minMaxSetMap && precentageMap)
        ? scoring(minMaxSetMap, precentageMap, kdtree._kdtree.pos, task, this.results)
        : Object.create(null);
      return scoreMap;
    });
    const scoreMap: {
      [lineID: number]: number;
    } = Object.create(null);
    this.results.forEach(lineID => {
      const score = scoreMaps.reduce((score, scoreMap) => score + (scoreMap[lineID] || 0), 0) / scoreMaps.length;
      scoreMap[lineID] = score;
    });
    this.scores = scoreMap;
  }

  private _reRenderComponentsWithTasks(tasks: QueryTask[]) {
    const components = generateComponent(tasks, screenWidth, screenHeight, (d: number) => d, (d: number) => d);
    console.log("shape search", components, tasks);
    const componentMap: { [name: string]: GeneralComponent } = {};
    components.forEach((component, i) => {
      if (!component) return;
      componentMap[`${component?.type}-${i}`] = component;
    });
    this._uiController?.reRenderComponents(componentMap);
  }

  private _controlEditor(controller: UIController) {
    controller.addEventListener([
      "createTimebox_createend",
      "createTimebox_creating",
      // "panAndResizeTimebox_modifystart",
      "panAndResizeTimebox_modifying",
      "panAndResizeTimebox_modifyend",
      "sliderTimebox_modifying",
      "sliderTimebox_modifyend",
      "createAngular_createend",
      "panAngular_modifyend",
      "resizeAngular_modifyend",
      "resizeAngular_modifywheel",
      "sliderAngular_modifying",
      "sliderAngular_modifyend",
    ], (component, event, props) => {
      const components = [...controller.getComponents().values()];
      this._executeVisualQuery(components as (TimeboxComponent | AngularComponent)[]);
    });

    controller.addEventListener([
      "createTimebox_createend",
      "panAndResizeTimebox_modifyend",
      "sliderTimebox_modifyend",
      "createAngular_createend",
      "panAngular_modifyend",
      "resizeAngular_modifyend",
      "resizeAngular_modifywheel",
      "sliderAngular_modifyend",
    ], (component, event, props) => {
      // const components = [...controller.getComponents().values()];
      this.scoring();
    });
  }

}

// function diffTasks(task1: QueryTask, task2: QueryTask): QueryTask[]{}

// function diffTask(task1: QueryTask, task2: QueryTask): boolean {
//   if (task1.mode !== task2.mode) return false;
//   const { mode, constraint: constraint1 } = task1;
//   const { constraint: constraint2 } = task2;
//   if (mode === "timebox") {
//     return (constraint1.xStart === constraint2.xStart)
//       && (constraint1.xEnd === constraint2.xEnd)
//       && (constraint1.yStart === (constraint2 as TimeboxConstraints).yStart)
//       && (constraint1.yEnd === (constraint2 as TimeboxConstraints).yEnd)
//       && (constraint1.p === constraint2.p)
//   } else if (mode === "angular") {
//     return (constraint1.xStart === constraint2.xStart)
//       && (constraint1.xEnd === constraint2.xEnd)
//       && (constraint1.sStart === (constraint2 as AngularConstraints).sStart)
//       && (constraint1.sEnd === (constraint2 as AngularConstraints).sEnd)
//       && (constraint1.p === constraint2.p)
//   }
//   return false;
// }

const queryStore = new QueryStore();
export default queryStore;
