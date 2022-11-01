import { Component, ConstraintEffect } from "../../ui"

type TimeboxGeometries = "centerRect" | "topRect" | "rightRect" | "bottomRect" | "leftRect";
type TimeboxLayoutConstraints = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type TimeboxConstraintEffect = ConstraintEffect<"timebox", TimeboxGeometries, TimeboxLayoutConstraints>;
export type TimeboxComponent = Component<"timebox", TimeboxGeometries, TimeboxLayoutConstraints>;

const defaultTimeboxConstraints: TimeboxLayoutConstraints = {x: 0, y:0, width: 0, height: 0};

const timeboxConstraintEffect: TimeboxConstraintEffect = function (component) {
  const { x, y, width, height } = component.getLayoutConstraints(); 
  const handleWidth = 20;
  const halfHandleWidth = handleWidth / 2;
  component.modifyGeometry("centerRect", { x, y, width, height });
  component.modifyGeometry("topRect", { x, y: y - halfHandleWidth, width, height: handleWidth });
  component.modifyGeometry("rightRect", { x: x + width - halfHandleWidth, y: y, width: handleWidth, height: height });
  component.modifyGeometry("bottomRect", { x, y: y + height - halfHandleWidth, width, height: handleWidth });
  component.modifyGeometry("leftRect", { x: x - halfHandleWidth, y: y, width: handleWidth, height: height });
}

export default function initializeTimeboxComponent(): TimeboxComponent {
  const timeboxComponent: TimeboxComponent = new Component("timebox", defaultTimeboxConstraints);
  timeboxComponent.addGeometry("centerRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("leftRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("bottomRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("rightRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("topRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });

  timeboxComponent.hideGeometry("leftRect");
  timeboxComponent.hideGeometry("bottomRect");
  timeboxComponent.hideGeometry("rightRect");
  timeboxComponent.hideGeometry("topRect");

  timeboxComponent.addConstraintEffect("mapToGeometries", timeboxConstraintEffect);
  return timeboxComponent;
}

