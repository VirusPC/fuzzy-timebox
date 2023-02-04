import { Component, ConstraintEffect, StyleMap } from "../../../lib/ui"

type TimeboxGeometries = "centerRect" | "topRect" | "rightRect" | "bottomRect" | "leftRect" | "slider" | "sliderHandle" | "sliderRect";
export type TimeboxLayoutConstraints = {
  x: number;
  y: number;
  width: number;
  height: number;
  p: number;
};
export type TimeboxConstraintEffect = ConstraintEffect<"timebox", TimeboxGeometries, TimeboxLayoutConstraints>;
export type TimeboxComponent = Component<"timebox", TimeboxGeometries, TimeboxLayoutConstraints>;

const DEFAULT_TIMEBOX_CONSTRAINTS: TimeboxLayoutConstraints = { x: 0, y: 0, width: 0, height: 0, p: 1};
const NORMAL_BORDER_RECT_STYLEMAP = {
  fill: "rgba(0, 0, 0, 0)",
  strokeWidth: 0
}
const NORMAL_RECT_STYLEMAP = {
  stroke: "black",
  fill: "rgba(0, 0, 0, 0.4)",
  strokeWidth: 1,
}
const HIGHLIGHT_RECT_STYLEMAP = {
  stroke: "red",
  fill: "rgba(0, 0, 0, 0.4)",
  strokeWidth: 2,
}
// const HIGHLIGHT_BORDER_RECT_STYLEMAP = {
  // fill: "rgba(0, 0, 0, 0)",
  // strokeWidth: 0
// }
const TIMEBOX_STYLEMAPS: {
  [styleMapName: string]: StyleMap;
} = {
  "normal": {
    "centerRect": NORMAL_RECT_STYLEMAP,
    "innerRect": NORMAL_RECT_STYLEMAP,
    "topRect": NORMAL_BORDER_RECT_STYLEMAP,
    "rightRect": NORMAL_BORDER_RECT_STYLEMAP,
    "bottomRect": NORMAL_BORDER_RECT_STYLEMAP,
    "leftRect": NORMAL_BORDER_RECT_STYLEMAP,
    "sliderRect": NORMAL_RECT_STYLEMAP,
  },
  "highlight": {
    "centerRect": HIGHLIGHT_RECT_STYLEMAP,
    "sliderRect": HIGHLIGHT_RECT_STYLEMAP,
    "topRect": NORMAL_BORDER_RECT_STYLEMAP,
    "rightRect": NORMAL_BORDER_RECT_STYLEMAP,
    "bottomRect": NORMAL_BORDER_RECT_STYLEMAP,
    "leftRect": NORMAL_BORDER_RECT_STYLEMAP,
  }
};

const timeboxConstraintEffect: TimeboxConstraintEffect = function (component) {
  const { x, y, width, height, p } = component.getLayoutConstraints();
  const handleWidth = 15;
  const halfHandleWidth = handleWidth / 2;
  const sliderX = x + width * p;
  component.modifyGeometry("centerRect", { x, y, width, height });
  component.modifyGeometry("slider", {x1: sliderX, y1: y, x2: sliderX, y2: y+height});
  component.modifyGeometry("sliderRect", { x, y, width: sliderX - x, height });
  component.modifyGeometry("topRect", { x, y: y - halfHandleWidth, width, height: handleWidth });
  component.modifyGeometry("rightRect", { x: x + width - halfHandleWidth, y: y, width: handleWidth, height: height });
  component.modifyGeometry("bottomRect", { x, y: y + height - halfHandleWidth, width, height: handleWidth });
  component.modifyGeometry("leftRect", { x: x - halfHandleWidth, y: y, width: handleWidth, height: height });
  component.modifyGeometry("sliderHandle", { x: sliderX - halfHandleWidth, y: y, width: handleWidth, height: height });
}

export default function initializeTimeboxComponent(): TimeboxComponent {
  const timeboxComponent: TimeboxComponent = new Component("timebox", DEFAULT_TIMEBOX_CONSTRAINTS, {
    styleMaps: TIMEBOX_STYLEMAPS
  });
  timeboxComponent.addGeometry("sliderRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("centerRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("slider", {type: "line", x1: 0, x2: 0, y1: 0, y2: 0});
  timeboxComponent.addGeometry("leftRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("bottomRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("rightRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("topRect", { type: "rect", x: 0, y: 0, width: 0, height: 0 });
  timeboxComponent.addGeometry("sliderHandle", { type: "rect", x: 0, y: 0, width: 0, height: 0 });

  timeboxComponent.hideGeometry("leftRect");
  timeboxComponent.hideGeometry("bottomRect");
  timeboxComponent.hideGeometry("rightRect");
  timeboxComponent.hideGeometry("topRect");
  timeboxComponent.hideGeometry("sliderHandle");

  timeboxComponent.addConstraintEffect("mapToGeometries", timeboxConstraintEffect);

  timeboxComponent.setStyleMap("highlight");

  return timeboxComponent;
}

