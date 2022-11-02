// import flattenJS from "@flatten-js/core";
import RenderUtil, { Style } from "./renderUtil";
import IntersectionTestUtil from "./intersectionTestUtil";
import { Geometry } from "./geometry"

export type RenderOptions<T> = {
  styleMap: StyleMap | string;
  // styleMapName: string;
  temporaryContext: CanvasRenderingContext2D;
};
export type ReLayoutOptions = {
  operation: string,
  [key: string]: unknown
};
export type LayoutConstraints = {};
export type ConstraintEffect<T extends string, G extends string, L extends LayoutConstraints> = (this: Component<T, G, L>, component: Component<T, G, L>) => void;
export type OptionalOptions = Partial<{
  // name: string,
  // geometries: {}
  context: CanvasRenderingContext2D,
  styleMaps: { [styleMapName: string]: StyleMap },
}>
export type StyleMap = {
  [styleName: string]: Style;
}


export default class Component<T extends string, G extends string, L extends LayoutConstraints> {
  private _context: CanvasRenderingContext2D | null;
  private _geometries: Map<G, Geometry>;
  private _isShow: Map<G, boolean>;
  private _styleMaps: { [styleMapName: string]: StyleMap };
  private _layoutConstraints: L;
  private _type: T;
  // private _RenderUtil: RenderUtil | null;
  // private _IntersectionTestUtil: IntersectionTestUtil | null;
  private _constraintEffects: Map<string, ConstraintEffect<T, G, L>>;
  constructor(type: T, defaultLayoutConstraints: L, optionalOptions: OptionalOptions = {}) {
    const { context, styleMaps } = optionalOptions;
    this._context = context || null;
    this._type = type;
    this._geometries = new Map();
    this._isShow = new Map();
    // this._RenderUtil = null;
    // this._IntersectionTestUtil = null;
    this._layoutConstraints = { ...defaultLayoutConstraints }; //Object.assign({}, defaultLayoutConstraints);
    this._styleMaps = styleMaps || {};
    this._constraintEffects = new Map();
  }
  get type(): T {
    return this._type;
  }
  addGeometry(name: G, geomery: Geometry) {
    this._geometries.set(name, geomery);
    this._isShow.set(name, true);
  }
  modifyGeometry(name: G, geomery: Partial<Geometry>) {
    const oldGeometry = this._geometries.get(name);
    if (!oldGeometry) return;
    this._geometries.set(name, Object.assign(oldGeometry, geomery));
  }
  removeGeometry(name: G) {
    this._geometries.delete(name);
    this._isShow.delete(name);
  }
  showGeometry(name: G) {
    this._isShow.set(name, true);
  }
  hideGeometry(name: G) {
    this._isShow.set(name, false);
  }
  setContext(context: CanvasRenderingContext2D) {
    this._context = context;
  }
  setStyleMaps(styleMaps: { [styleMapName: string]: StyleMap }) {
    this._styleMaps = styleMaps;
  }
  addStyleMap(styleMapName: string, styleMap: StyleMap) {
    this._styleMaps[styleMapName] = styleMap;
  }
  removeStyleMap(styleMapName: string) {
    delete this._styleMaps[styleMapName];
  }
  render(option: Partial<RenderOptions<G>> = {}) {
    if (!this._context) {
      console.error("Please set context first!");
      return;
    }
    const { styleMap, temporaryContext: context = this._context } = option;
    const realStyleMap = !styleMap ? {} : typeof styleMap === "string" ? this._styleMaps[styleMap] : styleMap;
    for (let geometryName of Array.from(this._geometries.keys())) {
      if (this._isShow.get(geometryName)) {
        const geometry = this._geometries.get(geometryName);
        const style = realStyleMap[geometryName];
        geometry && RenderUtil.render(context, geometry, style);
      }
    }
  }
  onWhere(x: number, y: number): G | null {
    for (let geometryName of Array.from(this._geometries.keys()).reverse()) {
      const geometry = this._geometries.get(geometryName)!;
      if (IntersectionTestUtil.contains(geometry, x, y)) return geometryName;
    }
    return null;
  }
  isOnComponent(x: number, y: number) {
    return this.onWhere(x, y) !== null;
  }
  setLayoutConstraints(layoutConstraints: Partial<L>) {
    Object.assign(this._layoutConstraints, layoutConstraints);
    this._constraintEffects.forEach((le) => {
      le.bind(this)(this);
    });
    // this.constraintsEffect();
  }
  // immutable
  getLayoutConstraints(): L {
    return { ...this._layoutConstraints };
  }

  addConstraintEffect(name: string, effect: ConstraintEffect<T, G, L>) {
    this._constraintEffects.set(name, effect);
  }
  removeConstraintEffect(name: string) {
    this._constraintEffects.delete(name);
  }
}