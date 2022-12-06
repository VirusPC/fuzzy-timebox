import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";
import { QueryMode, QueryInstrumentState } from "../lib/ui-controller";
import { Container, Instrument } from "../lib/interaction";
import { parseShapeSearch } from "../lib/shape-search";
import { parseTask } from "../lib/query";
import { screenHeight, screenWidth } from "../views/MainView";
import dataStore from "./DataStore";

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
  constructor(){
    this.queryMode = "timebox";
    this.instrument = null;
    this.container = null;
    makeAutoObservable(this);
  }
  
  setQueryMode(queryMode: QueryMode){
    this.queryMode = queryMode;
    this.instrument?.setState("queryMode", queryMode);
    console.log(queryMode);
  }

  shapeSearch(text: string){
    console.log(this.container);
    if(!this.container) return;
    this.container.removeAllComponents();
    const tasks = parseShapeSearch(text, [0, screenWidth], [0, screenHeight], [-90, 90]);
    if(!tasks) return;
    // const components = tasks.map(task => parseTask(task, screenWidth, screenHeight, dataStore.timeScale, dataStore.valueScale));
    const components = tasks.map(task => parseTask(task, screenWidth, screenHeight, (d: number) => d, (d: number) => d));
    components.forEach((component) => {
      if(!component) return;
      this.container?.pushComponent(`${component?.type}-${new Date()}`, component);
    });
    this.container.reRender();
  }
}

const queryStore = new QueryStore();
export default queryStore;
