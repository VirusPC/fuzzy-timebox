import { AngularComponent, TimeboxComponent } from "../ui-controller/components";

// export type RawPoint = { [attribute: string]: any };
// export type Point = RawPoint | ScreenPoint;
// export type Line<P extends Point> = P[];
// export type RawLine = Line<RawPoint>;
// export type ScreenLine = Line<ScreenPoint>;
// export type RawData = RawPoint[][];

export type Scale = {
  (dataLevelData: any): number,
  domain: () => [number, number],
  range: () => [number, number],
}

export type TimeboxOption = {
  type: "timebox",
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  p: number,
}

export type AngularOption = {
  type: "angular"
  x1: number,
  x2: number,
  slope1: number,
  slope2: number,
  p: number
}

export type Option = TimeboxOption | AngularOption;

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
  radianStart: number,
  radianEnd: number,
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
