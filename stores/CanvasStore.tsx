import { Colormap, colormaps } from "../helpers/color";
import { makeAutoObservable, autorun } from "mobx";
import { useStaticRendering } from "mobx-react";
import { LayerInfo } from "../components/layer";


const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);


class CanvasStore {
  layerInfos: LayerInfo[];
  showCursorValue: boolean;
  reverseYAxis: boolean;
  normalize: boolean;
  enlargeFont: boolean;

  constructor(){
    this.layerInfos = [{
      type: "line",
      id: "raw_line",
      name: "raw line",
      colormap: colormaps[17].value,
      opacity: 0.01,
    }, 
    // {
    //   type: "density",
    //   id: "raw_density",
    //   name: "density",
    //   colormap: colormaps[17].value,
    //   opacity: 1,
    // }, 
    {
      type: "line",
      id: "selected_line",
      name: "selected line",
      colormap: colormaps[17].value,
      opacity: 1,
    }, 
    // {
    //   type: "density",
    //   id: "selected_density",
    //   name: "selected density",
    //   colormap: colormaps[17].value,
    //   opacity: 0,
    // }, {
    //   type: "line",
    //   id: "rep_line",
    //   name: "representative line",
    //   colormap: colormaps[17].value,
    //   opacity: 1,
    //   lineCount: 3,
    //   diverse: 0.1,
    // }
  ];
    this.showCursorValue = true;
    this.reverseYAxis = false;
    this.normalize = true;
    this.enlargeFont= false;
    makeAutoObservable(this);
  }
}

const canvasStore = new CanvasStore();
export default canvasStore;