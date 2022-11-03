import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";
import { QueryMode, QueryInstrumentState } from "../lib/ui-controller";
import { Container, Instrument } from "../lib/interaction";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

type SerializedStore = {
  title: string;
  content: string;
};

class QueryStore {
  // @observable title: string | undefined;
  // data: object[];
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
}

const queryStore = new QueryStore();
export default queryStore;

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {};
// }