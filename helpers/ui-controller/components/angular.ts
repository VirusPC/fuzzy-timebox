import { Component, ConstraintEffect, StyleMap } from "../../../lib/ui";

type AngularGeometries = "hLine" | "handle" | "innerArc" | "outerArc" | "hLineLeftRect" | "hLineRightRect" | "arcBottomArc" | "arcTopArc";
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
  }
};


const angularConstraintEffect: AngularConstraintEffect = function (component) {
  const { x1, x2, y, startAngle, endAngle } = component.getLayoutConstraints();
  const r = (x2-x1) / 2;
  const handleWidth = 15;
  // const sideSpanAngle = (endAngle - startAngle) / 8;
  const sideSpanAngle = Math.PI/30;
  component.modifyGeometry("hLine", { x1: x1, x2: x2, y1: y, y2: y});
  component.modifyGeometry("handle", { x: x1, y: y-handleWidth/2, width: x2-x1, height: handleWidth});
  component.modifyGeometry("innerArc", {cx: x1, cy: y, outerRadius: r, startAngle, endAngle});
  component.modifyGeometry("outerArc", {cx: x1, cy: y, outerRadius: r});
  component.modifyGeometry("hLineLeftRect", { x: x1-handleWidth/2, y: y-handleWidth/2, width: handleWidth, height: handleWidth});
  component.modifyGeometry("hLineRightRect", { x: x2-handleWidth/2, y: y-handleWidth/2, width: handleWidth, height: handleWidth});
  component.modifyGeometry("arcTopArc", {cx: x1, cy: y, outerRadius: r, startAngle: startAngle - sideSpanAngle, endAngle: startAngle + sideSpanAngle});
  component.modifyGeometry("arcBottomArc", {cx: x1, cy: y, outerRadius: r, startAngle: endAngle - sideSpanAngle, endAngle: endAngle + sideSpanAngle});
}

export default function initializeAngularComponent(): AngularComponent{
  const angularComponent: AngularComponent = new Component("angular", DEFAULT_ANGULAR_CONSTRAINTS, {
    styleMaps: ANGULAR_STYLEMAPS
  });
  angularComponent.addGeometry("hLine", {type: "line", x1: 0, x2: 0, y1: 0, y2: 0});
  angularComponent.addGeometry("handle", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("outerArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/2, endAngle: Math.PI/2});
  angularComponent.addGeometry("innerArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/4, endAngle: Math.PI/4});
  angularComponent.addGeometry("hLineLeftRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("hLineRightRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  // angularComponent.addGeometry("arcTopArc", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  // angularComponent.addGeometry("arcBottomRect", {type: "rect", x: 0, y: 0, width: 0, height: 0});
  angularComponent.addGeometry("arcTopArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: -Math.PI/16*5, endAngle: -Math.PI/16*3});
  angularComponent.addGeometry("arcBottomArc", {type: "arc", cx: 0, cy: 0, innerRadius: 0, outerRadius: 0, startAngle: Math.PI/16*3, endAngle: Math.PI/16*5});


  angularComponent.hideGeometry("handle");
  angularComponent.hideGeometry("arcTopArc");
  angularComponent.hideGeometry("arcBottomArc");
  angularComponent.hideGeometry("hLineLeftRect");
  angularComponent.hideGeometry("hLineRightRect");

  angularComponent.setStyleMap("normal");

  angularComponent.addConstraintEffect("mapToGeometries", angularConstraintEffect);
  return angularComponent;
}