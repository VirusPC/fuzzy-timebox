// import { Geometry } from "./component";
// import flattenJS from "@flatten-js/core";
// import d3Shape from "d3-shape";
import { Point, Line, Rect, Polygon, Circle, Arc, Geometry } from "./geometry"


// type RendererType = "line" | "arc" | "polygon";
export type Style = {
  stroke: string;
  fill: string;
  strokeWidth: number;
};
// export type StyleMap = {
//   [styleName: string]: Style;
// }

// it is better to use interface rather than high depend on flatten-js
// interface Segement {}
// interface Arc {}
// interface Polygon {}

// const defaultStyleMap = {
//     normal: {
//       strokeStyle: "black",
//       fillStyle: "rgba(0, 0, 0, 0.5)",
//       lineWidth: 1,
//     },
//     highlight: {
//       strokeStyle: "red",
//       fillStyle: "rgba(0, 0, 0, 0.5)",
//       lineWidth: 3,
//     },
//   }
const DEFUALT_STYLE: Style = {
  stroke: "black",
  fill: "rgba(0, 0, 0, 0)",
  strokeWidth: 1,
};

export default class Renderer {
  // private static line = d3Shape.line();
  // private _context: CanvasRenderingContext2D;
  // private _defaultStyle: Style;
  // private _styleMap: StyleMap;

  // constructor(context: CanvasRenderingContext2D,
  //   { defaultStyle = DEFUALT_STYLE, styleMap = {} }: { defaultStyle: Style, styleMap: StyleMap }) {
  //   this._context = context;
  //   this._defaultStyle = defaultStyle;
  //   this._styleMap = styleMap
  // }

  static render(context: CanvasRenderingContext2D, geometry: Geometry, style?: Partial<Style>) {
    // const _style = (typeof style === "string" ? this._styleMap[style] : style) || this._defaultStyle;
    const { stroke = DEFUALT_STYLE.stroke, fill = DEFUALT_STYLE.fill, strokeWidth = DEFUALT_STYLE.strokeWidth } = style || DEFUALT_STYLE;
    switch (geometry.type) {
      case "line": Renderer.renderLine(context, geometry, strokeWidth, stroke); break;
      case "rect": Renderer.renderRect(context, geometry, strokeWidth, stroke, fill); break;
      case "polygon": Renderer.renderPolygon(context, geometry, strokeWidth, stroke, fill); break;
      case "circle": Renderer.renderCircle(context, geometry, strokeWidth, stroke, fill); break;
      case "arc": Renderer.renderArc(context, geometry, strokeWidth, stroke, fill); break;
    }
  }
  static renderLine(context: CanvasRenderingContext2D, line: Line, lineWidth: number, strokeStyle: string) {
    // context.save();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.beginPath();
    context.moveTo(line.x1, line.y1);
    context.lineTo(line.x2, line.y2);
    context.stroke();
    // context.restore();
  }
  static renderRect(context: CanvasRenderingContext2D, rect: Rect, lineWidth: number, strokeStyle: string, fillStyle: string) {
    // context.save();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.beginPath();
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    // context.restore();
  }
  static renderPolygon(context: CanvasRenderingContext2D, polygon: Polygon, lineWidth: number, strokeStyle: string, fillStyle: string) {
    if (polygon.points.length <= 0) return;
    // context.save();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.beginPath();
    context.moveTo(polygon.points[0].x, polygon.points[0].y);
    polygon.points.forEach((point) => context.lineTo(point.x, point.y));
    context.closePath();
    context.fill();
    context.stroke();
    // context.restore();
  }
  static renderCircle(context: CanvasRenderingContext2D, circle: Circle, lineWidth: number, strokeStyle: string, fillStyle: string) {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.stroke();
  }
  static renderArc(context: CanvasRenderingContext2D, arc: Arc, lineWidth: number, strokeStyle: string, fillStyle: string) {
    // context.save();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(arc.cx, arc.cy, arc.innerRadius, arc.startAngle, arc.endAngle, false);
    context.arc(arc.cx, arc.cy, arc.outerRadius, arc.endAngle, arc.startAngle, true);
    context.closePath();
    context.fill();
    context.stroke();
    // context.restore();
  }
}