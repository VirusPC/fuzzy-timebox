import { angularOption, timeboxOption } from "../types";

export type Point2D = {
  x: number,
  y: number,
};
export type Point3D = {
  x: number,
  y: number,
  z: number,
};
export type Point = Point2D | Point3D
export interface QueryDataStructure {
  timebox(option: timeboxOption): number[];
  angular(option: angularOption): number[];
}

// export type Scale = {
//   domain(): [number,number]
//   range(): [number,number]
//   (dataLevelData: number): number
// }
// interface FilterOption {
//   type: string
// }
// export interface BrushFilterOption extends FilterOption {
//   type: "brush-box",
//   lowX: number,
//   lowY: number,
//   highX: number,
//   highY: number,
// }
// export interface BrushXFilterOption extends FilterOption {
//   type: "brush-x",
//   lowX : number,
//   highX: number
// }
// export interface BrushYFilterOption extends FilterOption {
//   type: "brush-y",
//   lowY: number,
//   highY: number
// }
// export interface AngularFilterOption extends FilterOption {
//   type: "angular",
//   lowX: number,
//   lowSlope: number,
//   highX: number,
//   highSlope: number,
// }
// export interface AttrFilterOption extends FilterOption {
//    type: "attr",
//    field: string,
//    values: any[]
// }

