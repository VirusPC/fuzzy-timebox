export interface Point {
  type: "point"
  x: number,
  y: number,
}
export interface Line {
  type: "line"
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}
export interface Rect {
  type: "rect"
  x: number,
  y: number,
  width: number,
  height: number,
}
// export interface Path{
//   type: "path"
//   points: Point[],
// }
export interface Polygon {
  type: "polygon"
  points: Point[],
}
export interface Circle {
  type: "circle"
  cx: number;
  cy: number;
  r: number
}
export interface Arc{
  type: "arc"
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number
  startAngle: number;
  endAngle: number
}
export type Geometry = Point | Line | Rect | Polygon | Circle | Arc;