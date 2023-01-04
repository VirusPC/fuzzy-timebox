/**
 * @typedef {{
 *  domain(): [number, number],
 *  range(): [number, number],
 *  (dataLevelData: number): number
 * }} Scale domain：获取定义域；range：获取值域；inverse：从像素空间变换至数据空间；直接调用：从数据空间变换至像素空间
 *  inverse(pixelLevelData: number): number,
 * @typedef {{type: 'brush-box', lowX: number, lowY: number, highX: number, highY: number}} BrushFilterOption 矩形筛选模式。low{X,Y}：框选的最小xy；high{X,Y}：框选的最大xy
 * @typedef {{type: 'brush-x', lowX: number, highX: number}} BrushXFilterOption 一维x轴矩形筛选模式。lowX：框选的最小x；highX：框选的最大x
 * @typedef {{type: 'brush-y', lowY: number, highY: number}} BrushYFilterOption 一维y轴矩形筛选模式。lowY：框选的最小y；highY：框选的最大y
 * @typedef {{type: 'angular', lowX: number, lowSlope: number, highX: number, highSlope: number}} AngularFilterOption 斜率筛选模式。low{X,Slope}：框选的最小x、斜率值；high{X,Slope}：框选的最大x、斜率值
 * @typedef {{type: 'attr', field: string, values: any[]}} AttrFilterOption 属性筛选模式。field：需要筛选的字段；values：可以接受的值列表
 */

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
export type Scale = {
  domain(): [number,number]
  range(): [number,number]
  (dataLevelData: number): number
}
interface FilterOption {
  type: string
}
export interface BrushFilterOption extends FilterOption {
  type: "brush-box",
  lowX: number,
  lowY: number,
  highX: number,
  highY: number,
}
export interface BrushXFilterOption extends FilterOption {
  type: "brush-x",
  lowX : number,
  highX: number
}
export interface BrushYFilterOption extends FilterOption {
  type: "brush-y",
  lowY: number,
  highY: number
}
export interface AngularFilterOption extends FilterOption {
  type: "angular",
  lowX: number,
  lowSlope: number,
  highX: number,
  highSlope: number,
}
export interface AttrFilterOption extends FilterOption {
   type: "attr",
   field: string,
   values: any[]
}

