import Instrument from "./instrument";
import Layer from "./layer";
export default class Container {
  private _container: HTMLElement;
  private _width: number;
  private _height: number;
  private _layers: Layer[];
  private _nextZIndex: number = -1;
  private get nextZIndex(){
    return ++ this._nextZIndex;
  }
  // private instruments: Instrument[];

  constructor(container: HTMLElement, width: number, height: number){
    this._container = container;
    this._width = width;
    this._height = height;
    this._layers = [];
    // this.instruments = [];
    // this.addEventListeners();
  }
  get width(){
    return this._width;
  }
  get height(){
    return this._height;
  }
  getGraphic(){
    return this._container;
  }

  pushLayer(this: Container, layer: string | Layer){
    // let returnLayer = layer;
    let self = this;
    if(typeof layer === "string"){
      layer = new Layer(layer, self, this._width, this._height)
      this._layers.push(layer);
    }else {
      this._layers.push(layer);
    }
    layer.zIndex = this.nextZIndex;
    return layer;
  }
  getLayer(name: string){
    return this._layers.find(layer => layer.name === name);
  }
  clearLayer(layer?: string|string[]) { //|Layer){
    if(!layer) {
      this._layers.forEach(layer => layer.clear());
    } else if(typeof layer === "string") {
      this.getLayer(layer)?.clear();
    } else if(Array.isArray(layer)) {
      layer.forEach(layerName => this.getLayer(layerName)?.clear());
    }
    // else if(layer instanceof Layer){
    //   layer.clear();
    // }
  }

  // reRenderLayer(layers: string|string[] = []){
  //   if(!Array.isArray(layers)){
  //     layers = [layers];
  //   }
  //   layers.forEach(layer => {
  //     this.getLayer(layer)!.render();
  //   })
  // }
  

    // attachInstrument(instrument: Instrument){
    // this.instruments.push(instrument);
  // }
  // setLayerOrder(name: string, newOrder: number){
  //   const oldOrder = this._layers.findIndex(layer => layer.name === name);
  //   newOrder = Math.max(0, Math.min(this._layers.length - 1, newOrder));
  //   if(oldOrder === -1) return false;
  //   if(oldOrder === newOrder) {
  //     return true;
  //   } else if (oldOrder < newOrder){
  //     const layer = this._layers[oldOrder];
  //     for(let i=oldOrder+1; i<= newOrder; ++i){
  //       this._layers[i-1] = this._layers[i];
  //     }
  //     this._layers[newOrder] = layer;
  //   } else {
  //     const layer = this._layers[oldOrder];
  //     for(let i=newOrder+1; i<= oldOrder; ++i){
  //       this._layers[i] = this._layers[i-1];
  //     }
  //     this._layers[newOrder] = layer;
  //   }
  // };
  // raiseLayer(name: string){
  //   this.setLayerOrder(name, this._layers.length - 1);
  // }
  // lowerLayer(name: string){
  //   this.setLayerOrder(name, 0);
  // }

  // private addEventListeners(events: (keyof HTMLElementEventMap)[] = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"]){
  //   events.forEach(eventName => {
  //     this._container.addEventListener(eventName, (event: Event) => this.dispatch(event));
  //   });
  // }

  // private dispatch(event: Event){
  //   let stopPropogation: boolean | undefined = false;
  //   for(let i=this._layers.length-1; (i >= 0) && (!stopPropogation); --i){
  //     let layer = this._layers[i];
  //     stopPropogation = layer.dispatch(event);
  //   }
  // }

}