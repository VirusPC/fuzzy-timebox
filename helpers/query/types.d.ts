import { AngularComponent, TimeboxComponent } from "../ui-controller/components";

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

export type TimeboxConstraints = {
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  p: number,
};

export type AngularConstraints = {
  xStart: number,
  xEnd: number,
  sStart: number,
  sEnd: number,
  p: number,
};

type Constraints = TimeboxConstraints | AngularConstraints;

type GenericQueryTask<M extends QueryMode, C extends Constraints> = {
  mode: M,
  constraint: C

}

export type TimeboxQueryTask = GenericQueryTask<"timebox", TimeboxConstraints>;
export type AngularQueryTask = GenericQueryTask<"angular", AngularConstraints>;
export type QueryTask = TimeboxQueryTask | AngularQueryTask;

export type LegalComponent = TimeboxComponent | AngularComponent;
