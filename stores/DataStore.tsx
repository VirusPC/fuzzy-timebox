import { makeAutoObservable, autorun } from "mobx";
import { useStaticRendering } from "mobx-react";
import datasetConfig from './dataConfig.json';
import axios from 'axios';
import Papa from 'papaparse';
import { aggregateData, inferAttr, getXYScale } from "../helpers/data";

const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);

export type RawData = string[][];
type DataType = "number" | "string" | "date";
type TimeDataType = Extract<DataType, "number" | "date">;
type ValueDataType = Extract<DataType, "string" | "number">;
type Time = number | Date;
type Value = number | string;
type AggregatedData =
  AggregatedDataGeneric<Extract<Time, number>, Extract<Value, number>>
  | AggregatedDataGeneric<Extract<Time, number>, Extract<Value, string>>
  | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, number>>
  | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, string>>
type AggregatedDataGeneric<T extends Time, V extends Value> = {
  id: string;
  data: Point<T, V>[];
}[]
type Point<X, Y> = { x: X, y: Y }


type DatasetConfig = { name: string, url: string, size: string }[];

class DataStore {
  datasetConfig: DatasetConfig;
  status: 'idle' | 'loading' | 'failed';

  width: number;
  height: number;

  selectedDatasetName: string | null;
  rawData: RawData;
  headers: string[];
  // kdTree: AliTVSTree | null;

  aggregationAttrPos: number;
  timeAttrPos: number;
  valueAttrPos: number;
  timeDataType: TimeDataType;
  valueDataType: ValueDataType;

  aggregatedData: AggregatedData;

  timeScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null;
  valueScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null;

  get timeAttrName(): string{
    return this.headers[this.timeAttrPos]
  }
  get valueAttrName(): string{
    return this.headers[this.valueAttrPos]
  }

  get aggregatedData2(){
    return this.aggregatedData.map(line => line.data);
  }

  constructor() {
    this.status = 'idle';
    this.datasetConfig = datasetConfig;
    this.width = 1000;
    this.height = 500;
    this.selectedDatasetName = null;
    this.rawData = [];
    this.headers = [];
    this.aggregationAttrPos = -1;
    this.timeAttrPos = -1;
    this.valueAttrPos = -1;
    this.timeDataType = "date";
    this.valueDataType = "number";
    this.aggregatedData = [];
    this.timeScale = null;
    this.valueScale = null;
    makeAutoObservable(this);
  }

  apply() {
    this.aggregatedData = aggregateData(
      dataStore.rawData,
      dataStore.aggregationAttrPos,
      dataStore.timeAttrPos,
      dataStore.valueAttrPos,
      dataStore.timeDataType,
      dataStore.valueDataType);
    const { xScale, yScale } = getXYScale(dataStore.aggregatedData, dataStore.timeDataType, dataStore.valueDataType, dataStore.width, dataStore.height);
    dataStore.timeScale = xScale;
    dataStore.valueScale = yScale;
  }
}

const dataStore = new DataStore();
autorun(async () => {
  const selectedName = dataStore.selectedDatasetName;
  const url = datasetConfig.find(c => c.name === selectedName)?.url;
  if (url) {
    dataStore.status = "loading";
    const response = await axios.get(url);
    const rawData = Papa.parse(response.data, { skipEmptyLines: true }).data as RawData;
    dataStore.headers = rawData[0];
    dataStore.rawData = rawData.slice(1);
    const { aggregationAttr, timeAttr, valueAttr, timeDataType, valueDataType } = inferAttr(rawData);
    dataStore.aggregationAttrPos = aggregationAttr;
    dataStore.timeAttrPos = timeAttr;
    dataStore.valueAttrPos = valueAttr;
    dataStore.timeDataType = timeDataType;
    dataStore.valueDataType = valueDataType;
    dataStore.status = "idle";
  }
});

// autorun(() => {
// });

export default dataStore;

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {};
// }