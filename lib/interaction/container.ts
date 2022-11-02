import { Component } from "../ui";
import { LayoutConstraints } from "../ui/component";
// import Instrument from "./instrument";
// import Layer from "./layer";
type GeneralComponent = Component<string, string, {}>;
export default class Container {
  private _containerElement: HTMLCanvasElement;
  private _width: number;
  private _height: number;
  private _componentMap: Map<string, GeneralComponent>;
  private _componentZIndexMap: Map<string, number>;
  private _maxZIndex: number;

  constructor(containerElement: HTMLCanvasElement, width: number, height: number) {
    this._containerElement = containerElement;
    this._width = width;
    this._height = height;
    this._containerElement.setAttribute("width", `${width}px`);
    this._containerElement.setAttribute("height", `${height}px`);
    this._componentMap = new Map();
    this._componentZIndexMap = new Map();
    this._maxZIndex = -1;
  }
  set width(width: number) {
    this._containerElement.setAttribute("width", `${width}px`);
    this._width = width;
  }
  set height(height: number) {
    this._containerElement.setAttribute("height", `${height}px`);
    this._height = height;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }

  // addComponent

  getContainerElement() {
    return this._containerElement;
  }

  getContext() {
    return this._containerElement.getContext("2d");
  }

  getComponent(componentName: string) {
    return this._componentMap.get(componentName);
  }

  pushComponent(componentName: string, component: GeneralComponent) {
    component.setContext(this._containerElement.getContext("2d")!);
    this._componentMap.set(componentName, component);
    this._maxZIndex++;
    this._componentZIndexMap.set(componentName, this._maxZIndex);
  }

  removeComponent(componentName: string) {
    this._componentMap.delete(componentName);
    this._componentZIndexMap.delete(componentName);
    this._maxZIndex = Math.max(...Array.from(this._componentZIndexMap.values()));
  }

  reRender() {
    const componentOrder = Array
      .from(this._componentZIndexMap.entries())
      .sort((a, b) => {
        return a[1] - b[1]; // zindex 升序 
      })
      .map(d => d[0]);
    const orderedComponents = componentOrder.map(componentName => this._componentMap.get(componentName));
    this._containerElement?.getContext("2d")?.clearRect(0, 0, this._width, this._height);
    // console.log("rerender", orderedComponents);
    orderedComponents.forEach(component => component?.render());
  }

  onWhere(x: number, y: number): { componentName: string; where: string } | null {
    const componentOrder = Array
      .from(this._componentZIndexMap.entries())
      .sort((a, b) => {
        return a[1] - b[1]; // zindex 升序 
      })
      .map(d => d[0]);
    const orderedComponents =
      componentOrder
        .map(componentName => this._componentMap.get(componentName))
        .filter(component => component !== undefined) as GeneralComponent[];
    for (const componentName of componentOrder) {
      const component = this._componentMap.get(componentName);
      if (!component) continue;
      const where = component.onWhere(x, y);
      if (where !== null) return { componentName, where };
    }
    this._containerElement?.getContext("2d")?.clearRect(0, 0, this._width, this._height);
    orderedComponents.forEach(component => component?.render());
    return null;
  }

}