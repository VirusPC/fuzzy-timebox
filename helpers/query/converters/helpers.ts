import { Point2D, Point3D } from "../algorithms/types";
import { AngularOption,  TimeboxOption } from "../types";

// export function rawData2ScreenData(data: RawData, xField: string, yField: string, xScale: Scale, yScale: Scale): ScreenData {
//   return data.map((line) =>
//     line.map((point) =>
//     ({
//       x: xScale(point[xField]),
//       y: yScale(point[yField])
//     })));
// }

export function formatTimeboxOption(option: TimeboxOption): TimeboxOption {
  const { x1, x2, y1, y2, p } = option;
  const { min, max } = Math;
  return {
    type: "timebox",
    x1: min(x1, x2),
    x2: max(x1, x2),
    y1: min(y1, y2),
    y2: max(y1, y2),
    p: max(0, min(1, p))
  }
}

export function formatAngularOption(option: AngularOption): AngularOption {
  const { x1, x2, slope1, slope2, p } = option;
  const { min, max } = Math;
  return {
    type: "angular",
    x1: min(x1, x2),
    x2: max(x1, x2),
    slope1: min(slope1, slope2),
    slope2: max(slope1, slope2),
    p: max(0, min(1, p))
  }
}

export function computeSlope(point1: Point2D | Point3D, point2: Point2D | Point3D): number{
  return (point2.y - point1.y) / (point2.x - point1.x);
}