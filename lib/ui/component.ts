// import flattenJS from "@flatten-js/core";
import Renderer from "./renderer";
import IntersectionTester from "./intersectionTester";
import { Geometry } from "./geometry"

export type RenderOptions<T> = { highlights: T[] };
export type ReLayoutOptions = {
  operation: string,
  [key: string]: unknown
};
export type LayoutConstraints = {};
export type ConstraintEffect<T extends string, G extends string, L extends LayoutConstraints> = (this: Component<T, G, L>, component: Component<T, G, L>) => void;
export type ComponentOptions = {
  name: string,
  geometries: {}
}

export default class Component<T extends string, G extends string, L extends LayoutConstraints> {
  private _geometries: Map<G, Geometry>;
  private _isShow: Map<G, boolean>;
  private _layoutConstraints: L;
  private _type: T;
  private _renderer: Renderer | null;
  private _intersectionTester: IntersectionTester | null;
  private _constraintEffects: Map<string, ConstraintEffect<T, G, L>>;
  constructor(type: T, defaultLayoutConstraints: L) {
    this._type= type;
    this._geometries = new Map();
    this._isShow = new Map();
    this._renderer = null;
    this._intersectionTester = null;
    this._layoutConstraints = {...defaultLayoutConstraints}; //Object.assign({}, defaultLayoutConstraints);
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
    if(!oldGeometry) return;
    this._geometries.set(name, Object.assign(oldGeometry, geomery));
  }
  removeGeometry(name: G) {
    this._geometries.delete(name);
    this._isShow.delete(name);
  }
  showGeometry(name: G){
    this._isShow.set(name, true);
  }
  hideGeometry(name: G){
    this._isShow.set(name, false);
  }
  setRenderer(renderer: Renderer) {
    this._renderer = renderer;
  }
  setIntersectionTester(tester: IntersectionTester) {
    this._intersectionTester = tester;
  }
  render(option: Partial<RenderOptions<G>> = {}) {
    if (!this._renderer) {
      console.log("Please set renderer first!");
      return;
    }
    const { highlights = [] } = option;
    for (let geometryName of Array.from(this._geometries.keys())) {
      const geometry = this._geometries.get(geometryName)!;
      if (highlights.includes(geometryName)) {
        this._renderer.render(geometry, true);
      } else {
        if (this._isShow.get(geometryName)) this._renderer.render(geometry);
      }
    }
  }
  onWhere(x: number, y: number): G | null {
    if (!this._intersectionTester) {
      console.log("Please set intersecitonTester first!");
      return null;
    }
    for (let geometryName of Array.from(this._geometries.keys()).reverse()) {
      const geometry = this._geometries.get(geometryName)!;
      if (this._intersectionTester.contains(geometry, x, y)) return geometryName;
    }
    return null;
  }
  setLayoutConstraints(layoutConstraints: Partial<L>){
    Object.assign(this._layoutConstraints, layoutConstraints);
    this._constraintEffects.forEach((le) => {
      le.bind(this)(this);
    });
    // this.constraintsEffect();
  }
  // immutable
  getLayoutConstraints(): L {
    return {...this._layoutConstraints};
  }

  addConstraintEffect(name: string, effect: ConstraintEffect<T, G, L>) {
    this._constraintEffects.set(name,effect);
  }
  removeConstraintEffect(name: string) {
    this._constraintEffects.delete(name);
  }
}