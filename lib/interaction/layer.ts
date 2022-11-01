import Container from "./container";
import Instrument from "./instrument";

export default class Layer {
  private _name: string;
  private _container: Container;
  private _graphic: HTMLCanvasElement;
  private _width: number;
  private _height: number;
  // private _styles: { [key: string]: string|number };
  // private instruments: Instrument[] = [];
  // private _listenerMap: { [event: string]: ((event: Event) => boolean | undefined)[] };

  constructor(name: string, container: Container, width: number, height: number) {
    this._name = name;
    const graphic = document.createElement("canvas");
    graphic.style.position = "absolute";
    graphic.style.top = "0";
    graphic.style.left = "0";
    graphic.setAttribute("width", "" + width);
    graphic.setAttribute("height", "" + height);
    // graphic.className = name;
    graphic.id= name;
    this._container = container;
    this._graphic = container.getGraphic().appendChild(graphic);
    this._width = width;
    this._height = height;
    // this._styles = {};
    // this._listenerMap = {};
  }

  get name() {
    return this._name;
  }
  get graphic() {
    return this._graphic;
  }
  get container() {
    return this._container;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  setAttribute(name: string, value: string) {
    this._graphic.setAttribute(name, value);
  }
  getAttribute(name: string){
    return this._graphic.getAttribute(name);
  }
  set className(name: string) {
    this._graphic.className = name;
  }
  get className() {
    return this._graphic.className;
  }
  get style(){
    return this._graphic.style;
  }
  set zIndex(zIndex: number) {
    this._graphic.style.zIndex = "" + zIndex;
  }
  get zIndex() {
    return parseInt(this._graphic.style.zIndex);
  }
  clear(){
    this._graphic?.getContext("2d")?.clearRect(0, 0, this._graphic.width, this._graphic.height);
  }

  // dispatch(event: Event): boolean | undefined {
  //   let stopPropagation: boolean | undefined = false;
  //   this._listenerMap[event.type].forEach(listener => {
  //     stopPropagation = listener(event) || stopPropagation;
  //   });
  //   return false;
  // }
  // on(event: string, listener: (event: Event) => boolean | undefined) {
  //   if(this._listenerMap[event] === undefined){
  //     this._listenerMap[event] = [];
  //   }
  //   this._listenerMap[event].push(listener);
  // }
  // off(event: string, listener: (event: Event) => boolean | undefined) {
  //   if(this._listenerMap[event] === undefined){
  //     return;
  //   }
  //   const index = this._listenerMap[event].indexOf(listener);
  //   if(index !== -1){
  //     this._listenerMap[event].splice(index, 1);
  //   }
  // }
  // attachInstrument(instrument: Instrument){
  //   this.instruments.push(instrument);
  // }
}

// class QueryLayer extends Layer {
//   // let currentState
//   constructor(name: string, container: HTMLElement, width: number, height: number) {
//     super(name, container, width, height);
//   }
// }