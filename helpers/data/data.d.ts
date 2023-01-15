type DataType = "number" | "string" | "date";
type TimeDataType = Extract<DataType, "number" | "date">;
type ValueDataType = Extract<DataType, "string" | "number">;
type Time = number | Date;
type Value = number | string;

export type RawData = string[][];
export type ScreenPoint = { x: number, y: number };
export type ScreenData = ScreenPoint[][];

type Attr = {
  type: DataType,
  name: string,
  column: number,
}



// type TimeArrayType = Date[] | Float64Array;
// type ValueArrayType = string[] | Float64Array;
// type AggregatedData = {
//   [id: string]: {
//     time: Date[], 
//     value: Float64Array
//   }
// } | {
//   [id: string]: {
//     time: Date[], 
//     value: string[] 
//   }
// } | {
//   [id: string]: {
//     time: Float64Array, 
//     value: Float64Array
//   }
// } | {
//   [id: string]: {
//     time: Float64Array,
//     value: string[] 
//   }
// };

type AggregatedData =
  AggregatedDataGeneric<Extract<Time, number>, Extract<Value, number>>
  | AggregatedDataGeneric<Extract<Time, number>, Extract<Value, string>>
  | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, number>>
  | AggregatedDataGeneric<Extract<Time, Date>, Extract<Value, string>>
type AggregatedDataGeneric<T extends Time, V extends Value> = {
  [id: string]: Point<T, V>[];
}
type Point<X, Y> = {x: X, y: Y}
//type Line<T extends Time, V extends Value> = Point<T, V>[];
//type Lines<T extends Time, V extends Value> = Line<T, V>[];

