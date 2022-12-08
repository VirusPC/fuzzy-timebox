import { formatAngularOption, formatTimeboxOption, rawData2ScreenData, computeSlope } from "../helpers";
import { angularOption, RawData, Scale, ScreenData, ScreenLine, timeboxOption, ScreenPoint } from "../types";
import { sortedIndexBy } from "lodash";

/**
 * 注意考虑 1. 非均匀采样 2. 可能有空值
 * data: 每条线上的点，在时间维度是有序的
 */
export class SequentialSearch {
  // _rawData: RawData;
  _screenData: ScreenData;
  _xField: string;
  _yField: string;
  // _xScale: Scale;
  // _yScale: Scale;
  constructor(data: ScreenData, xField: string, yField: string) {
    this._screenData= data;
    // this._xScale = xScale;
    // this._yScale = yScale;
    this._xField = xField;
    this._yField = yField;
    // this._screenData = rawData2ScreenData(data, xField, yField, xScale, yScale);
  }

  timebox(option: timeboxOption): number[] {
    console.time("sequential timebox");
    const { x1, y1, x2, y2 } = formatTimeboxOption(option);
    const result: number[] = [];
    for (let i = 0; i < this._screenData.length; ++i) {
      const screenLine = this._screenData[i];
      // 由于是非均匀采样，需要对于每条线单独定位窗口边界
      const l = sortedIndexBy(screenLine, {x: x1, y: 0}, "x");
      const r = sortedIndexBy(screenLine, {x: x2 + Number.MIN_VALUE, y: 0}, "x") - 1;
      if(l >= r) continue;
      console.log({l, r});
      let isSatisfied = true;
      for(let i=l; i<=r; ++i){
        const point = screenLine[i];
        if(!(y1 <= point.y && point.y <= y2)) {
          isSatisfied = false;
          break;
        }
      }
      if(isSatisfied) result.push(i);
    }
    console.timeEnd("sequential timebox");
    return result;
  }

  angular(option: angularOption): number[] {
    console.time("sequential angular");
    const { x1, slope1, x2, slope2 } = formatAngularOption(option);
    const result: number[] = [];
    for (let i = 0; i < this._screenData.length; ++i) {
      const screenLine = this._screenData[i];
      // 由于是非均匀采样，需要对于每条线单独定位窗口边界
      const l = sortedIndexBy(screenLine, {x: x1, y: 0}, "x");
      const r = sortedIndexBy(screenLine, {x: x2 + Number.MIN_VALUE, y: 0}, "x") - 1;
      if(l >= r) continue;
      let isSatisfied = true;
      for(let i=l; i<r; ++i){
        const point1 = screenLine[i];
        const point2 = screenLine[i+1];
        const slope = computeSlope(point1, point2);
        if(!(slope1 <= slope && slope <= slope2)) {
          isSatisfied = false;
          break;
        }
      }
      if(isSatisfied) result.push(i);
    }
    console.timeEnd("sequential angular");
    return result;
  }
}

