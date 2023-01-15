type Point = {
  x: number,
  y: number
};

interface Scale {
  domain(): [number, number],
  range(): [number, number],
  inverse(pixelLevelData: number): number,
  [dataLevelData: number]: number
}

export enum FilterType {
  BRUSH_BOX, BRUSH_X, BRUSH_Y, ANGULAR, ATTR
}

type BrushFilterOption = {
  type: FilterType.BRUSH_BOX,
  lowX: number,
  lowY: number,
  highX: number,
  highY: number
};
type BrushXFilterOption = {
  type: FilterType.BRUSH_X,
  lowX: number,
  highX: number,
};
type BrushYFilterOption = {
  type: FilterType.BRUSH_Y
  lowY: number,
  highY: number
};
type AngularFilterOption = {
  type: FilterType.ANGULAR,
  lowX: number,
  lowSlope: number,
  highX: number,
  highSlope: number
};
type AttrFilterOption = {
  type: FilterType.ATTR,
  field: string,
  values: any[]
};

declare namespace AliTVSTree {
}

export default AliTVSTree;