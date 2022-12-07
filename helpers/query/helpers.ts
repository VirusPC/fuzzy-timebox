import { angularOption, RawData, RawLine, Scale, ScreenData, ScreenPoint, timeboxOption } from "./types";

export function rawData2ScreenData(data: RawData, xField: string, yField: string, xScale: Scale, yScale: Scale): ScreenData {
  return data.map((line) =>
    line.map((point) =>
    ({
      x: xScale(point[xField]),
      y: yScale(point[yField])
    })));
}

export function formatTimeboxOption(option: timeboxOption) {
  const { x1, x2, y1, y2 } = option;
  const { min, max } = Math;
  return {
    x1: min(x1, x2),
    x2: max(x1, x2),
    y1: min(y1, y2),
    y2: max(y1, y2),
  }
}

export function formatAngularOption(option: angularOption) {
  const { x1, x2, slope1, slope2 } = option;
  const { min, max } = Math;
  return {
    x1: min(x1, x2),
    x2: max(x1, x2),
    slope1: min(slope1, slope2),
    slope2: max(slope1, slope2),
  }
}

export function computeSlope(point1: ScreenPoint, point2: ScreenPoint): number{
  return (point2.y - point1.y) / (point2.x - point1.x);
}