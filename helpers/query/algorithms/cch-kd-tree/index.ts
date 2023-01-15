import {Point2D, QueryDataStructure } from "../types"
import KDTree, { ConcreteSegInfo } from "./cchtree";
import { angularOption,  timeboxOption } from "../../types";
import { ScreenData } from "../../../data";
import { formatAngularOption, formatTimeboxOption } from "../../converters/helpers";

export class CCHKDTree implements QueryDataStructure {
  _kdtree: KDTree;
  _raw: ScreenData;
  // _slopePixelCache;
  // _precision: number;


  constructor(data: Point2D[][]) {
    const precision = 1;
    this._raw = data;
    console.time("kdtree");
    const kdtreeData: ConcreteSegInfo[] = data.map((line, i) => ({
      lineId: i,
      points: line
    }));
    this._kdtree = new KDTree(kdtreeData, precision);
    console.timeEnd("kdtree");
    console.log("kdtree", this._kdtree);
  }


  // /**
  //  * 
  //  * @param {[number, number]} newXExtent 
  //  * @returns {AliTVSTree}
  //  */
  // getDetailedKdtree(newXExtent){
  //   // return this;
  //   const oldExtent = this._xScale.range();
  //   if(!newXExtent || newXExtent[0] === newXExtent[1]) return this;
  //   if(newXExtent[0] === oldExtent[0] && newXExtent[1] === oldExtent[1]) return this;
  //   const factor = (newXExtent[1] - newXExtent[0]) / (oldExtent[1] - oldExtent[0]);
  //   const newPrecision = this._precision * factor;
  //   // console.log(this._kdtree._rangeSegReal());
  //   // const segs = this._kdtree.getPixelData({type: 'brush-x', lowX: newXExtent[0], highX: newXExtent[1]});
  //   console.log("newExtent", newXExtent);
  //   const segs = this._kdtree.brushXSegs(...newXExtent);
  //   if(segs.length<=0) return this;
  //   console.log("newsegs", segs);
  //   const domain = newXExtent.map(d => this._xScale.invert(d));
  //   console.time("detailedKdtree");
  //   const tree = new AliTVSTree(this._raw, this._xField, this._yField, this._xScale.copy().domain(domain), this._yScale.copy(), segs, newPrecision);
  //   console.timeEnd("detailedKdtree");
  //   return tree;
  //   // return this;
  //   // return 
  // }

  getRawData() {
    return this._raw;
  }

  // /**
  //  * 获取距离xy最近的点位置及数据
  //  * @param {number} x 像素空间x坐标
  //  * @param {number} y 像素空间y坐标
  //  * @return {{
  //  *  position: [number, number],
  //  *  data: any[]
  //  * }} position：最近的点位置；data：最近的线原始数据
  //  */
  // getCrossPoints(x: number, y: number) {
  //   const closest = this._kdtree.knn([x, y], 1)[0];
  //   const data = this._raw[closest.id];
  //   return {
  //     position: { x: closest.point.x, y: closest.point.y },
  //     data,
  //   };
  // }

  // /**
  //  * 获取在xy周围的n条线
  //  * @param {number} x 像素空间x坐标
  //  * @param {number} y 像素空间y坐标
  //  * @param {number} r 查询半径
  //  * @param {number} topN 取其中n条线
  //  * @return {{
  //  *  position: [number, number],
  //  *  data: any[][]
  //  * }} position：选中的中心坐标；data：选中的线数据
  //  */
  // getHoverLines(x, y, r, topN) {
  //   const indices = this._kdtree.rnn([x, y], r).slice(0, topN);
  //   indices.map((index) => this._raw[index]);
  //   return { position: [x, y], data: indices };
  // }

  timebox(option: timeboxOption): number[] {
    const { x1, y1, x2, y2, p } = formatTimeboxOption(option);
    return this._kdtree
      .fuzzyBrush([x1, y1], [x2, y2], p)

  }
  angular(option: angularOption): number[] {
    const { x1, slope1, x2, slope2, p } = formatAngularOption(option);
    const tan1 = Math.tan(slope1);
    const tan2 = Math.tan(slope2);
    const indices = this._kdtree
      .fuzzyAngular(
        [x1, Math.min(tan1, tan2)],
        [x2, Math.max(tan1, tan2)],
        p
      )
    return indices;
  }


  // /**
  //  * 根据给定筛选器找到对应线数据
  //  * @param {(data: any[]) => boolean} filter 给定线数据判断是否为所需的线
  //  * @return {any[][]} 最终的筛选结果
  //  */
  // getSelectedLines(filter: (data: ScreenData) => boolean) {
  //   let resultData = this._raw;
  //   if (filter) {
  //     resultData = resultData.filter((line) => filter(line));
  //   }
  //   return resultData;
  // }

  // buildRenderCache() {
  //   const width = Math.abs(this._xScale.range().reduce((p, v) => p - v));
  //   const height = Math.abs(this._yScale.range().reduce((p, v) => p - v));
  //   const cache = new Array(width)
  //     .fill()
  //     .map(() => new Array(height).fill().map(() => ({})));
  //   for (let id in this._raw) {
  //     const line = this._raw[id].map((p) => ({
  //       x: this._xScale(p[this._xField]),
  //       y: this._yScale(p[this._yField]),
  //     }));
  //     for (let i = 0; i < line.length - 1; i++) {
  //       brensenhamArr(
  //         [line[i], line[i + 1]],
  //         cache,
  //         id,
  //         (line[i + 1].y - line[i].y) / (line[i + 1].x - line[i].x)
  //       );
  //     }
  //   }
  //   this._slopePixelCache = cache;
  // }

  // /**
  //  * 渲染模块，会根据当前的数据量自动切换最快渲染模式
  //  * @param {HTMLCanvasElement} canvas 需要绘制的Canvas元素
  //  * @param {(weight: number)=>[number, number, number]} colormap 将（0，1）之间的权值映射到[Red, Green, Blue]数值（0-255）
  //  * @param {boolean } [normalize] 是否需要做归一化，如不传则不启用
  //  * @param {number[] } [indices] 需要绘制的线序号，如不传则绘制所有
  //  * @return {number} 返回密度图中的最大密度值
  //  */
  // render(canvas, colormap, normalize, indices) {
  //   if (!indices)
  //     indices = Array(this._raw.length)
  //       .fill()
  //       .map((_, i) => i);
  //   // const totalPoint = indices.reduce((p, v) => p + this._raw[v].length, 0);
  //   // brensenham

  //   const width = Math.abs(this._xScale.range().reduce((p, v) => p - v));
  //   const height = Math.abs(this._yScale.range().reduce((p, v) => p - v));

  //   if (!this._slopePixelCache) {
  //     this.buildRenderCache();
  //   }

  //   let ids = indices;
  //   const fastMapping = {};
  //   ids.forEach((id) => (fastMapping[id] = 1));
  //   const bgContext = canvas.getContext("2d");

  //   const tempBuffer = new Float32Array(width * height).map((_, i) => {
  //     const row = i % height;
  //     const col = Math.floor(i / height);
  //     const pixelCache = Object.entries(this._slopePixelCache[col][row]);
  //     if (normalize) {
  //       return pixelCache.reduce(
  //         (p, v) => p + (fastMapping[v[0]] ? v[1] : 0),
  //         0
  //       );
  //     } else {
  //       return pixelCache.reduce((p, v) => p + (fastMapping[v[0]] ? 1 : 0), 0);
  //     }
  //   });

  //   bgContext.fillStyle = "black";
  //   bgContext.globalAlpha = 1;
  //   bgContext.fillRect(0, 0, width, height);
  //   bgContext.clearRect(0, 0, width, height);
  //   const tempImageBuffer = new Uint8ClampedArray(width * height * 4);
  //   const maxWeight = Math.ceil(tempBuffer.reduce((p, v) => Math.max(p, v)));
  //   const colorCache = {};
  //   for (let i = 0; i < width; i++) {
  //     for (let j = 0; j < height; j++) {
  //       const ratio = Math.round(
  //         (tempBuffer[i * height + j] / maxWeight) * 10000
  //       );
  //       if (!colorCache[ratio]) {
  //         colorCache[ratio] = colormap(ratio / 10000);
  //       }
  //       const color = colorCache[ratio];
  //       tempImageBuffer.set(color, (j * width + i) * 4);
  //       tempImageBuffer[(j * width + i) * 4 + 3] = ratio <= 0 ? 0 : 255;
  //     }
  //   }
  //   // if (arguments.length >= 5 && typeof arguments[4] === "function") {
  //   //   // for test framework, bug in putImageData
  //   //   var ImageData = arguments[4];
  //   //   canvas.getContext = () => ({
  //   //     getImageData() {
  //   //       return { data: tempImageBuffer };
  //   //     },
  //   //   });
  //   // }
  //   const tempImageData = new ImageData(tempImageBuffer, width, height);
  //   bgContext.putImageData(tempImageData, 0, 0);
  //   return maxWeight;
  // }
}
