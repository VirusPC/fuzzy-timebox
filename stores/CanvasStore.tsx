import { Colormap, colormaps, getRandomColor } from "../helpers/color";
import { makeAutoObservable, autorun } from "mobx";
import { useStaticRendering } from "mobx-react";
import { LayerInfo } from "../components/layer";
import dataStore from "./DataStore";


const isServer = typeof window === "undefined";
// eslint-disable-next-line react-hooks/rules-of-hooks
useStaticRendering(isServer);


class CanvasStore {
  layerInfos: LayerInfo[];
  densityColorMap: { name: string, value: Colormap };
  selectedDensityColorMap: { name: string, value: Colormap };
  linesColorMap: { name: string, value: Colormap };

  showCursorValue: boolean;
  reverseYAxis: boolean;
  normalize: boolean;
  enlargeFont: boolean;
  // strokeStyleCache: {[id: number]: string};

  get linesColorScale(): (id: number) => [number, number, number] {
    const colorCache: {[id: string]: [number, number, number]} = {};
    Object.keys(dataStore.aggregatedData).forEach((lineId) => {
      colorCache[lineId] = getRandomColor(this.linesColorMap.value);
    });
    return (id: number) => {
      return colorCache[id] ?? [0, 0, 0];
    }
  }

  constructor() {
    // this.strokeStyleCache = {};
    this.layerInfos = [{
      type: "line",
      id: "raw_line",
      name: "raw line",
      // colormap: colormaps[17].value,
      // strokeStyleScale: (i) => this.strokeStyleCache[i] || "rgba(0, 0, 0, 0)",
      // rgba(${[...getRandomColor(colormap), opacity].join(",")})
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
      // colormap: colormaps[17].value,
      // strokeStyleScale: (i) => this.strokeStyleCache[i] || "rbga(0, 0, 0, 0)",
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
    this.densityColorMap = colormaps[17];
    this.selectedDensityColorMap = colormaps[17];
    this.linesColorMap = colormaps[17];
    this.showCursorValue = true;
    this.reverseYAxis = false;
    this.normalize = true;
    this.enlargeFont = false;
    makeAutoObservable(this);
  }
}

const canvasStore = new CanvasStore();
export default canvasStore;