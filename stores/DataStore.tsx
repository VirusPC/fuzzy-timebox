import { makeAutoObservable } from "mobx";
import { useStaticRendering } from "mobx-react";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

type SerializedStore = {
  title: string;
  content: string;
};

class DataStore {
  // @observable title: string | undefined;
  data: object[];
  constructor(){
    this.data = [];
    makeAutoObservable(this);
  }
  setData(){}
}

const dataStore = new DataStore();
export default dataStore;

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {};
// }