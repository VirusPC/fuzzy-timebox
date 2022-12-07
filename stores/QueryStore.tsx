import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";
import { QueryMode, QueryInstrumentState } from "../helpers/ui-controller";
import { Container, Instrument } from "../lib/interaction";
import { AngularQueryTask, parseComponent, parseShapeSearch, TimeboxQueryTask } from "../helpers/query";
import { screenHeight, screenWidth } from "../views/MainView";
import { GeneralComponent } from "../lib/interaction/container";
import { QueryTask, generateComponent } from "../helpers/query";
import { AngularComponent, TimeboxComponent } from "../helpers/ui-controller/components";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

type SerializedStore = {
  title: string;
  content: string;
};

class QueryStore {
  queryMode: QueryMode;
  instrument: Instrument<QueryInstrumentState> | null;
  container: Container | null;
  tasks: QueryTask[];
  results: unknown[];

  constructor() {
    this.queryMode = "timebox";
    this.instrument = null;
    this.container = null;
    this.tasks = [];
    this.results = [];
    makeAutoObservable(this);
  }

  setQueryMode(queryMode: QueryMode) {
    this.queryMode = queryMode;
    this.instrument?.setState("queryMode", queryMode);
    console.log(queryMode);
  }

  executeVisualQuery(components: (TimeboxComponent | AngularComponent)[]) {
    const tasks = parseComponent(components);
    this.tasks = tasks;
  }

  executeShapeSearch(text: string) {
    const tasks = parseShapeSearch(text, [0, screenWidth], [0, screenHeight], [-90, 90])?.filter(task =>task!==null);
    if (!tasks) return;
    this.tasks = tasks;
    this.reRenderComponentsWithTasks();
  }

  executeTasks(tasks: QueryTask[]) { }

  private reRenderComponentsWithTasks() {
    if (!this.container) return;
    const components = generateComponent(this.tasks, screenWidth, screenHeight, (d: number) => d, (d: number) => d);
    const componentMap: { [name: string]: GeneralComponent } = {};
    components.forEach((component) => {
      if (!component) return;
      componentMap[`${component?.type}-${new Date()}`] = component;
    });
    this.container.reRender(componentMap);
  }

  private reGenerateShapeSearchText(){
  }

}

function diff(task1: QueryTask, task2: QueryTask){}

const queryStore = new QueryStore();
export default queryStore;
