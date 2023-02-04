import { Component, ConstraintEffect, StyleMap } from "../../../lib/ui";

type AngularGeometries = "hLine" | "handle" | "slider" | "innerArc" | "outerArc" | "hLineLeftRect" | "hLineRightRect" | "arcBottomArc" | "arcTopArc";
export type AngularLayoutConstraints = {
  x1: number;
  x2: number;
  y: number;
  startAngle: number;
  endAngle: number;
  p: number;
};
type AngularConstraintEffect = ConstraintEffect<"angular", AngularGeometries, AngularLayoutConstraints>;
export type AngularComponent = Component<"angular", AngularGeometries, AngularLayoutConstraints>;


const DEFAULT_ANGULAR_CONSTRAINTS: AngularLayoutConstraints = {x1: 0, x2: 0, y: 0, startAngle: -Math.PI/4, endAngle: Math.PI/4, p: 1};

const NORMAL_STYLE = {
  fill: "rgba(0, 0, 0, 0.5)",
  strokeWidth: 1
}
const BORDER_STYLE = {
  fill: "rgba(0, 0, 0, 0)",
  strokeWidth: 1
}
const HIGHLIGHT_STYLE = {
  fill: "rgba(0, 0, 0, 0.5)",
  stroke: "rgba(255, 0, 0, 1)",
  strokeWidth: 2
}
const HIGHLIGHT_BORDER_STYLE = {
  fill: "rgba(0, 0, 0, 0)",
  stroke: "rgba(255, 0, 0, 1)",
  strokeWidth: 2
}
const HIDDEN_STYLE = {
  fill: "rgba(0, 0, 0, 0)",
  strokeWidth: 0
}
const SLIDER_STYLE = {
  fill: "rgba(0, 0, 0, 0.5)",
  stroke: "rgba(0, 0, 0, 1)",
  strokeWidth: 1
}
const HIGHLIGHT_SLIDER_STYLE = {
  fill: "rgba(0, 0, 0, 0.5)",
  stroke: "rgba(255, 0, 0, 1)",
  strokeWidth: 1
}
const ANGULAR_STYLEMAPS: {
  [styleMapName: string]: StyleMap;
} = {
  "normal": {
    "hLine" : NORMAL_STYLE,
    "handle": HIDDEN_STYLE,
    "innerArc": NORMAL_STYLE,
    "outerArc": BORDER_STYLE,
    "hLineLeftRect": HIDDEN_STYLE,
    "hLineRightRect": HIDDEN_STYLE,
    "arcBottomArc": HIDDEN_STYLE,
    "arcTopArc": HIDDEN_STYLE,
    "slider": SLIDER_STYLE
  },
  "highlight": {
    "hLine" : HIGHLIGHT_STYLE,
    "handle": HIDDEN_STYLE,
    "innerArc": NORMAL_STYLE,
    "outerArc": HIGHLIGHT_BORDER_STYLE,
    "hLineLeftRect": HIDDEN_STYLE,
    "hLineRightRect": HIDDEN_STYLE,
    "arcBottomArc": HIDDEN_STYLE,
    "arcTopArc": HIDDEN_STYLE,
    "slider": SLIDER_STYLE
  },
  "highlight-inner-arc": {
    "hLine" : NORMAL_STYLE,
    "handle": HIDDEN_STYLE,
    "innerArc": HIGHLIGHT_STYLE,
    "outerArc": BORDER_STYLE,
    "hLineLeftRect": HIDDEN_STYLE,
    "hLineRightRect": HIDDEN_STYLE,
    "arcBottomArc": HIDDEN_STYLE,
    "arcTopArc": HIDDEN_STYLE,
    "slider": SLIDER_STYLE
  },
  "highlight-slider": {
    "hLine" : NORMAL_STYLE,
    "handle": HIDDEN_STYLE,
    "innerArc": NORMAL_STYLE,
    "outerArc": BORDER_STYLE,
    "hLineLeftRect": HIDDEN_STYLE,
    "hLineRightRect": HIDDEN_STYLE,
    "arcBottomArc": HIDDEN_STYLE,
    "arcTopArc": HIDDEN_STYLE,
    "slider": HIGHLIGHT_SLIDER_STYLE
  },
};


const HANDLE_HEIGHT = 16;
const SLIDER_WIDTH = 8;
const SLIDER_HEIGHT= 24;
const SIDE_SPAN_ANGLE = Math.PI/30;
const angularConstraintEffect: AngularConstraintEffect = function (component) {
  const { x1, x2, y, startAngle, endAngle, p } = component.getLayoutConstraints();
  const r = (x2-x1) / 2;
  const sliderX = x1 + (x2-x1) * p;
  component.modifyGeometry("hLine", { x1: x1, x2: x2, y1: y, y2: y});
  component.modifyGeometry("handle", { x: x1, y: y-HANDLE_HEIGHT/2, width: x2-x1, height: HANDLE_HEIGHT});
  component.modifyGeometry("slider", { x: sliderX - (SLIDER_WIDTH/2), y: y-SLIDER_HEIGHT/2, width: SLIDER_WIDTH, height: SLIDER_HEIGHT});
  component.modifyGeometry("innerArc", {cx: x1, cy: y, outerRadius: r, startAngle, endAngle});
  component.modifyGeometry("outerArc", {cx: x1, cy: y, outerRadius: r});
  component.modifyGeometry("hLineLeftRect", { x: x1-HANDLE_HEIGHT/2, y: y-HANDLE_HEIGHT/2, width: HANDLE_HEIGHT, height: HANDLE_HEIGHT});
  component.modifyGeometry("hLineRightRect", { x: x2-HANDLE_HEIGHT/2, y: y-HANDLE_HEIGHT/2, width: HANDLE_HEIGHT, height: HANDLE_HEIGHT});
  component.modifyGeometry("arcTopArc", {cx: x1, cy: y, outerRadius: r, startAngle: startAngle - SIDE_SPAN_ANGLE, endAngle: startAngle + SIDE_SPAN_ANGLE});
  component.modifyGeometry("arcBottomArc", {cx: x1, cy: y, outerRadius: r, startAngle: endAngle - SIDE_SPAN_ANGLE, endAngle: endAngle + SIDE_SPAN_ANGLE});
}

export default function initializeAngularComponent(): AngularComponent{
  const angularComponent: AngularComponent = new Component("angular", DEFAULT_ANGULAR_CONSTRAINTS, {
    styleMaps: ANGULAR_STYLEMAPS
  });
  angularComponent.addGeometry("hLine", {type: "line", x1: 0, x2: 0, y1: 0, y2: 0});
  angularComponent.addGeometry("handle", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  // angularComponent.addGeometry("slider", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("outerArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/2, endAngle: Math.PI/2});
  angularComponent.addGeometry("innerArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/4, endAngle: Math.PI/4});
  angularComponent.addGeometry("hLineLeftRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("hLineRightRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  // angularComponent.addGeometry("arcTopArc", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  // angularComponent.addGeometry("arcBottomRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("arcTopArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/16*5, endAngle: -Math.PI/16*3});
  angularComponent.addGeometry("arcBottomArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: Math.PI/16*3, endAngle: Math.PI/16*5});
  angularComponent.addGeometry("slider", {type: "rect", x: 0, y: 0, width: 0, height: 0});


  angularComponent.hideGeometry("handle");
  angularComponent.hideGeometry("arcTopArc");
  angularComponent.hideGeometry("arcBottomArc");
  angularComponent.hideGeometry("hLineLeftRect");
  angularComponent.hideGeometry("hLineRightRect");

  angularComponent.setStyleMap("normal");

  angularComponent.addConstraintEffect("mapToGeometries", angularConstraintEffect);
  return angularComponent;
}