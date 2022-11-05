import axios from "axios";
import Papa from "papaparse";
import _ from "lodash";
import * as d3 from "d3";

export async function getData(url: string) {
  const response = await axios.get(url);
  const rawData = Papa.parse(response.data, { skipEmptyLines: true }).data as RawData;
  return rawData;
}

export function inferType(value: string): DataType {
  if (value.includes("-") || value.includes("/")) {
    let isDate = new Date(value).toString();
    if (isDate.startsWith("Invalid")) {
      return "string";
    }
    return "date";
  }
  if (/^\d*(\.\d*)?$/.test(value)) {
    return "number";
  }
  return "string";
}

/**
 * Infer attributes
 * @param rawData The first line of data is headers
 * @returns The index of the three infered attributes, and data type of time and value.
 */
export function inferAttr(data: RawData): {
  aggregationAttr: number,
  timeAttr: number,
  valueAttr: number,
  timeDataType: TimeDataType
  valueDataType: ValueDataType
} {
  let aggregationAttr = -1;
  let timeAttr = -1;
  let valueAttr = -1;
  let inferTypes: DataType[] = [];

  if (data.length > 1) {
    inferTypes = data[1].map(inferType);
    aggregationAttr = inferTypes.indexOf("string");
    timeAttr = inferTypes.indexOf("date");
    if (aggregationAttr < 0) aggregationAttr = 0;
    if (timeAttr < 0) {
      timeAttr = inferTypes.indexOf("number");
      if (aggregationAttr === timeAttr)
        timeAttr = inferTypes.indexOf(
          "number",
          aggregationAttr + 1
        );
    }
    if (timeAttr < 0) timeAttr = 0;

    valueAttr = inferTypes.indexOf("number");
    if (
      valueAttr === timeAttr ||
      valueAttr === aggregationAttr
    )
      valueAttr = inferTypes.indexOf("number", timeAttr + 1);
    if (valueAttr < 0) valueAttr = 0;
  }
  return {
    aggregationAttr,
    timeAttr,
    valueAttr,
    timeDataType: inferTypes[timeAttr] as TimeDataType,
    valueDataType: inferTypes[valueAttr] as ValueDataType
  }
}

export function aggregateData(rawData: RawData, aggregationAttrPos: number, timeAttrPos: number, valueAttrPos: number, timeDataType: TimeDataType, valueDataType: ValueDataType): AggregatedData {
  // aggregate data
  const aggregatedDataWithoutFormatting = _
    .chain(rawData)
    .groupBy(d => d[aggregationAttrPos])
    .entries()
    .map(([id, linesData]) => ({
      id: id,
      data: _
        .chain(linesData)
        .map((lineData) => ({
          x: lineData[timeAttrPos],
          y: lineData[valueAttrPos],
        }))
    }));

  let result: AggregatedData = [];

  // formatting data
  if (timeDataType === "date" && valueDataType === "number") {
    aggregatedDataWithoutFormatting
      .forEach(group =>
        (result as AggregatedDataGeneric<Date, number>).push(
          {
            id: group.id,
            data: (group.data.map(
              (lineData) => ({
                x: new Date(lineData.x),
                y: +lineData.y,
              })
            ).value())
          }

        )
      )
      .value();
  } else if (timeDataType === "date" && valueDataType === "string") {
    aggregatedDataWithoutFormatting
      .forEach(group =>
        (result as AggregatedDataGeneric<Date, string>).push(
          {
            id: group.id,
            data: (group.data.map(
              (lineData) => ({
                x: new Date(lineData.x),
                y: lineData.y,
              })
            ).value())
          }

        )
      )
      .value();
  } else if (timeDataType === "number" && valueDataType === "number") {
    aggregatedDataWithoutFormatting
      .forEach(group =>
        (result as AggregatedDataGeneric<number, number>).push(
          {
            id: group.id,
            data: (group.data.map(
              (lineData) => ({
                x: + lineData.x,
                y: +lineData.y,
              })
            ).value())
          }

        )
      )
      .value();
  } else if (timeDataType === "number" && valueDataType === "string") {
    aggregatedDataWithoutFormatting
      .forEach(group =>
        (result as AggregatedDataGeneric<number, string>).push(
          {
            id: group.id,
            data: (group.data.map(
              (lineData) => ({
                x: + lineData.x,
                y: lineData.y,
              })
            ).value())
          }

        )
      )
      .value();
  }

  return result;
}

// export function formatAggregatedData(data: AggregatedData): {}

export function aggregatedDataToLines(aggregateData: AggregatedData){
  return aggregateData.map(group => group.data);
}

// function getScale(aggregatedData: AggregatedData, attrName: string, attrType: DataType, length: number){
// }
// function getDomain(): void;

export function getXYScale(aggregatedData: AggregatedData, timeDataType: TimeDataType, valueDataType: ValueDataType, width: number, height: number) {
  let timeScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null = null;
  let valueScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null = null;
  const points = aggregatedDataToLines(aggregatedData).flat();
  if (points.length > 0) {
    // time scale
    const timeExtent = d3.extent(points, point => point.x);
    if (timeDataType === "date") {
      timeScale = d3.scaleTime().domain(timeExtent as [Date, Date]) as unknown as d3.ScaleTime<Date, number>;
    } else {
      timeScale = d3.scaleLinear().domain(timeExtent as [number, number]);
    }
    timeScale.range([0, width]);
    //timeScale = timeScale.nice();

    // value scale
    if (valueDataType === "number") {
      const valueExtent = d3.extent(points, point => point.y as number);
      valueScale = d3.scaleLinear().domain(valueExtent as [number, number]);
      valueScale.range([height, 0]);
      //valueScale = valueScale.nice();
    } else {
      const valueExtent = _.uniq(points.map(point => point.y as string));
      valueScale = d3.scaleBand().domain(valueExtent as string[]);
      valueScale.range([height, 0]);
    }
  }

  return { xScale: timeScale, yScale: valueScale }
}