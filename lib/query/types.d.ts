export type RawPoint = { [attribute: string]: any };
export type ScreenPoint = { x: number, y: number };
export type Point = RawPoint | ScreenPoint;
export type Line<P extends Point> = P[];
export type Data<P extends Point> = Line<P>[];
export type RawLine = Line<RawPoint>;
export type ScreenLine = Line<ScreenPoint>;
export type RawData = Data<RawPoint>;
export type ScreenData = Data<ScreenPoint>;

export type Scale = {
  (dataLevelData: any): number,
  domain: () => [number, number],
  range: () => [number, number],
}

export type timeboxOption = {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

export type angularOption = {
  x1: number,
  x2: number,
  slope1: number,
  slope2: number,
}