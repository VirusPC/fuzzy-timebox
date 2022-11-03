import { Component, ConstraintEffect, StyleMap } from "../../ui";

type AngularPreviewGeometries = "hLine";
type AngularPreviewLayoutConstraints = {
  x1: number;
  x2: number;
  y: number;
};
type AngularPreviewConstraintEffect = ConstraintEffect<"angular", AngularPreviewGeometries, AngularPreviewLayoutConstraints>;
export type AngularPreviewComponent = Component<"angular", AngularPreviewGeometries, AngularPreviewLayoutConstraints>;

const ANGULAR_PREVIEW_STYLEMAPS: {
  [styleMapName: string]: StyleMap;
} = {
  "highlight": {
    "hLine": {
      stroke: "red",
      strokeWidth: 2,
    },
  }
};

const angularPreviewConstraintEffect: AngularPreviewConstraintEffect = function (component) {
  const { x1, x2, y } = component.getLayoutConstraints();
  component.modifyGeometry("hLine", {type: "line", x1: x1, x2: x2, y1: y, y2: y});
}

export default function initializeAngularPreviewComponent(): AngularPreviewComponent{
  const angularPreviewComponent: AngularPreviewComponent = new Component("angular", {x1: 0, x2: 0, y: 0}, {
    styleMaps: ANGULAR_PREVIEW_STYLEMAPS
  });
  angularPreviewComponent.addGeometry("hLine", {type: "line", x1: 0, x2: 0, y1: 0, y2: 0});
  angularPreviewComponent.addConstraintEffect("mapToGeometries", angularPreviewConstraintEffect);
  angularPreviewComponent.setStyleMap("highlight");
  return angularPreviewComponent;
}