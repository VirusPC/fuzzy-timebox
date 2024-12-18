import { observable, computed, action, makeObservable, autorun } from "mobx";
import { useStaticRendering } from "mobx-react";
import datasetConfig from './dataConfig.json';
import { aggregateData, getXYScale, inferType, ScreenPoint } from "../helpers/data";
import queryStore from "./QueryStore";
import { CCHKDTree, SequentialSearch } from "../helpers/query";
import canvasStore from "./CanvasStore";
import { getRandomColor } from "../helpers/color";
import { AggregatedData, Point, RawData, Time, TimeDataType, Value, ValueDataType } from "../helpers/data";
import { QueryDataStructure } from "../helpers/query/algorithms/types";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

// export type RawData = string[][];
// type DataType = "number" | "string" | "date";
// type TimeDataType = Extract<DataType, "number" | "date">;
// type ValueDataType = Extract<DataType, "string" | "number">;
// type Time = number | Date;
// type Value = number | string;
// type AggregatedData =
//   AggregatedDataGeneric<Extract<Time, number>, Extract<Value, number>>
//   | AggregatedDataGeneric<Extract<Time, number>, Extract<Value, string>>
//   | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, number>>
//   | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, string>>
// type AggregatedDataGeneric<T extends Time, V extends Value> = {
//   [id: string]: Point<T, V>[];
// }
// type Point<X, Y> = { x: X, y: Y }


type DatasetConfig = { name: string, url: string, size: string }[];

class DataStore {
  datasetConfig: DatasetConfig;
  // @observable status: 'idle' | 'loading' | 'failed';

  @observable width: number;
  @observable height: number;

  @observable selectedDatasetName: string | null;
  @observable rawData: RawData;
  @observable headers: string[];

  @observable aggregationAttrPos: number;
  @observable timeAttrPos: number;
  @observable valueAttrPos: number;

  @observable aggregatedData: AggregatedData;

  @observable isComputing: boolean;

  sequentialQuery: QueryDataStructure | null;
  CCHKDTree: QueryDataStructure | null;

  @computed
  get timeDataType(): TimeDataType {
    const inferedType = this.timeAttrPos >= 0 ? inferType(this.rawData[0][this.timeAttrPos]) as TimeDataType : "number";  // !! check type
    return inferedType;
  }
  @computed
  get valueDataType(): ValueDataType {
    const inferedType = this.valueAttrPos >= 0 ? inferType(this.rawData[0][this.valueAttrPos]) as ValueDataType : "number";  // !! check type
    return inferedType;
  }

  @computed
  get aggregationAttrName(): string {
    return this.headers[this.aggregationAttrPos]
  }

  @computed
  get timeAttrName(): string {
    return this.headers[this.timeAttrPos]
  }

  @computed
  get valueAttrName(): string {
    return this.headers[this.valueAttrPos]
  }

  @computed
  get aggregatedScreenData(): { [id: string]: ScreenPoint[] } {
    const screenData: { [id: string]: ScreenPoint[] } = {};
    const { timeScale, valueScale } = this.scales;
    if (!timeScale || !valueScale) return screenData;
    this.aggregatedData.forEach((group, lineId) => {
      screenData[lineId] = this.aggregatedData[+lineId].data.map(point => ({ x: timeScale(point.x), y: valueScale(point.y as any) as number }));
    });
    return screenData;
  }

  @computed
  get aggregatedPlainData() {
    return this.aggregatedData.map(line => line.data);
  }

  @computed
  get aggregatedPlainScreenData() {
    // const { timeScale, valueScale} = this.scales;
    // if(!timeScale || !valueScale) return [];
    // return this.aggregatedPlainData.map((points)=> points.map(point => ({x: timeScale(point.x), y: valueScale(point.y as any) as number})));
    return Object.values(this.aggregatedScreenData);
  }

  @computed
  get isComplete() {
    return this.selectedDatasetName && this.aggregationAttrPos !== -1 && this.timeAttrPos !== -1 && this.valueAttrPos !== -1;
  }

  @computed
  get scales(): {
    timeScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null;
    valueScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null;
  } {
    const { xScale, yScale } = getXYScale(dataStore.aggregatedData, dataStore.timeDataType, dataStore.valueDataType, dataStore.width, dataStore.height);
    return {
      timeScale: xScale,
      valueScale: yScale
    }
  }

  @computed
  get timeScale(): d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null {
    return this.scales.timeScale;
  }

  @computed
  get valueScale(): d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null {
    return this.scales.valueScale;
  }

  constructor() {
    // this.status = 'idle';
    this.datasetConfig = datasetConfig;
    this.width = 1000;
    this.height = 500;
    this.selectedDatasetName = null;
    this.rawData = [];
    this.headers = [];
    this.aggregationAttrPos = -1;
    this.timeAttrPos = -1;
    this.valueAttrPos = -1;
    this.aggregatedData = [];
    this.sequentialQuery = null;
    this.CCHKDTree = null;
    this.isComputing = false;
    makeObservable(this);
  }

  @action
  checkConfig() {
    if (this.selectedDatasetName && this.aggregationAttrPos !== -1 && this.timeAttrPos !== -1 && this.valueAttrPos !== -1
      && this.width > 0 && this.height > 0) {
      return true;
    }

  }

  @action
  apply() {
    if (!this.checkConfig()) return false;
    queryStore.reset();
    const aggregatedData = aggregateData(
      dataStore.rawData,
      dataStore.aggregationAttrPos,
      dataStore.timeAttrPos,
      dataStore.valueAttrPos,
      dataStore.timeDataType,
      dataStore.valueDataType);
    this.aggregatedData = aggregatedData;
    console.log({aggregatedData});
    if (this.timeScale === null || this.valueScale === null) return false;
    console.time("create data structure for sequential query");
    const sequentialQuery = new SequentialSearch(
      dataStore.aggregatedPlainScreenData,
    );
    console.timeEnd("create data structure for sequential query");
    console.time("create data structure for cch kd tree query");
    const cchKDTree = new CCHKDTree(dataStore.aggregatedPlainScreenData, this.width, this.height);
    console.timeEnd("create data structure for cch kd tree query");
    this.sequentialQuery = sequentialQuery;
    this.CCHKDTree = cchKDTree;
    return true;
  }

  @action setIsComputing(value: boolean){
    this.isComputing = value;
  }
}


const dataStore = new DataStore();

export default dataStore;

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {};
// }