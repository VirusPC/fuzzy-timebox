import { makeAutoObservable, autorun } from "mobx";
import { useStaticRendering } from "mobx-react";
import datasetConfig from './dataConfig.json';
import axios from 'axios';
import Papa from 'papaparse';
import { aggregateData, inferAttr } from "../helpers/data";
// import stocksFilePath from "/data/stocks.filtered.csv";
// import airlineFilePath from "/data/airline.filtered.csv";
// import weatherFilePath from "/data/weather.filtered.csv";
// import readingFilePath from "/data/reading.filtered.csv";
// import hardDriveFilePath from "/data/mergeSMART194month.filtered.csv";

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

  get aggregatedData(): AggregatedData {
    return  aggregateData(
        dataStore.rawData,
        dataStore.aggregationAttrPos,
        dataStore.timeAttrPos,
        dataStore.valueAttrPos,
        dataStore.timeDataType,
        dataStore.valueDataType);
  }

  // timeScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null;
  // valueScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null;

  constructor() {
    this.status = 'idle';
    this.datasetConfig = datasetConfig;
    this.width = 1000;
    this.height = 500;
    this.selectedDatasetName = null;
    this.rawData = [];
    this.headers = [];
    // this.aggregatedData = [];
    this.aggregationAttrPos = -1;
    this.timeAttrPos = -1;
    this.valueAttrPos = -1;
    this.timeDataType = "date";
    this.valueDataType = "number";
    // this.timeScale = null;
    // this.valueScale = null;
    makeAutoObservable(this);
  }

  async hello() { }
}

const dataStore = new DataStore();
autorun(async () => {
  const selectedName = dataStore.selectedDatasetName;
  const url = datasetConfig.find(c => c.name ===selectedName)?.url;
  if(url){
    dataStore.status = "loading";
    const response = await axios.get(url);
    const rawData = Papa.parse(response.data, { skipEmptyLines: true }).data as RawData;
    dataStore.headers= rawData[0];
    dataStore.rawData = rawData.slice(1);
    const { aggregationAttr, timeAttr, valueAttr, timeDataType, valueDataType } = inferAttr(rawData);
    dataStore.aggregationAttrPos = aggregationAttr;
    dataStore.timeAttrPos = timeAttr;
    dataStore.valueAttrPos = valueAttr;
    dataStore.timeDataType = timeDataType;
    dataStore.valueDataType = valueDataType;
    dataStore.status = "idle";
    console.log(dataStore.aggregationAttrPos);
    console.log(dataStore.valueAttrPos);
  }
});

autorun(() => {
})

export default dataStore;

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {};
// }