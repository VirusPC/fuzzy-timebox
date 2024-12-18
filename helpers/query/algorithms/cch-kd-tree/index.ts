import { Point2D, QueryDataStructure } from "../types"
import KDTree, { ConcreteSegInfo } from "./cchtree";
import { AngularOption, QueryTask, TimeboxOption, TimeboxQueryTask } from "../../types";
import { ScreenData } from "../../../data";
import { formatAngularOption, formatTimeboxOption } from "../../converters/helpers";
import { brensenhamArr } from "./util";
import { calculateCurvature } from "./util";

export class CCHKDTree implements QueryDataStructure {
  _kdtree: KDTree;
  _raw: ScreenData;
  _slopePixelCache: { [id: string]: number }[][] | null;
  _width: number;
  _height: number;
  // _slopePixelCache;
  // _precision: number;


  constructor(data: Point2D[][], width: number, height: number) {
    const precision = 1;
    this._raw = data;
    this._slopePixelCache = null;
    this._width = width;
    this._height = height;
    console.time("kdtree");
    // const kdtreeData: ConcreteSegInfo[] = data.map((line, i) => ({
    //   lineId: i,
    //   points: line
    // }));
    this._kdtree = new KDTree(data, precision);
    console.timeEnd("kdtree");
    // console.log("kdtree", this._kdtree);
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

  timebox(option: TimeboxOption): number[] {
    const { x1, y1, x2, y2, p } = formatTimeboxOption(option);
    return this._kdtree
      .fuzzyBrush([x1, y1], [x2, y2], p)

  }
  angular(option: AngularOption): number[] {
    const { x1, slope1, x2, slope2, p } = formatAngularOption(option);
    const indices = this._kdtree
      .fuzzyAngular(
        [x1, slope1],
        [x2, slope2],
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

  buildRenderCache() {
    const cache: { [id: string]: number }[][] = new Array(this._width)
      .fill(null)
      .map(() => new Array(this._height).fill(null).map(() => ({})));
    for (let id = 0; id < this._raw.length; ++id) {
      const line = this._raw[id];
      for (let i = 0; i < line.length - 1; i++) {
        brensenhamArr(
          [line[i], line[i + 1]],
          cache,
          id,
          (line[i + 1].y - line[i].y) / (line[i + 1].x - line[i].x)
        );
      }
    }
    this._slopePixelCache = cache;
  }

  /**
   * 渲染模块，会根据当前的数据量自动切换最快渲染模式
   * @param {HTMLCanvasElement} canvas 需要绘制的Canvas元素
   * @param {(weight: number)=>[number, number, number]} colormap 将（0，1）之间的权值映射到[Red, Green, Blue]数值（0-255）
   * @param {boolean } [normalize] 是否需要做归一化，如不传则不启用
   * @param {number[] } [indices] 需要绘制的线序号，如不传则绘制所有
   * @return {number} 返回密度图中的最大密度值
   */
  render(canvas: HTMLCanvasElement, colormap: (weight: number) => [number, number, number], normalize?: boolean, indices?: number[]): number {
    // debugger;
    const { _width: width, _height: height } = this;

    if (!indices)
      indices = Array(this._raw.length)
        .fill(null)
        .map((_, i) => i);

    // const totalPoint = indices.reduce((p, v) => p + this._raw[v].length, 0);
    // brensenham

    // const width = Math.abs(this._xScale.range().reduce((p, v) => p - v));
    // const height = Math.abs(this._yScale.range().reduce((p, v) => p - v));

    if (!this._slopePixelCache) {
      this.buildRenderCache();
    }
    if (this._slopePixelCache === null) return 0;

    let ids = indices;
    const fastMapping: { [id: string]: number } = {};
    ids.forEach((id) => (fastMapping[id] = 1));
    const bgContext = canvas.getContext("2d");
    if (bgContext === null) return 0;

    const tempBuffer = new Float32Array(width * height).map((_, i) => {
      const row = i % height;
      const col = Math.floor(i / height);
      const pixelCache = Object.entries(this._slopePixelCache![col][row]);
      if (normalize) {
        return pixelCache.reduce(
          (p, v) => p + (fastMapping[v[0]] ? v[1] : 0),
          0
        );
      } else {
        return pixelCache.reduce((p, v) => p + (fastMapping[v[0]] ? 1 : 0), 0);
      }
    });

    bgContext.fillStyle = "black";
    bgContext.globalAlpha = 1;
    bgContext.fillRect(0, 0, width, height);
    bgContext.clearRect(0, 0, width, height);
    const tempImageBuffer = new Uint8ClampedArray(width * height * 4);
    const maxWeight = Math.ceil(tempBuffer.reduce((p, v) => Math.max(p, v)));
    const colorCache: { [ratio: string]: [number, number, number] } = {};
    console.log("colorCache", colorCache);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const ratio = Math.round(
          (tempBuffer[i * height + j] / maxWeight) * 10000
        );
        if (!colorCache[ratio]) {
          colorCache[ratio] = colormap(ratio / 10000);
        }
        const color = colorCache[ratio];
        if (!color) {
          debugger;
          console.log(color);
        }
        tempImageBuffer.set(color, (j * width + i) * 4);
        tempImageBuffer[(j * width + i) * 4 + 3] = ratio <= 0 ? 0 : 255;
      }
    }
    const tempImageData = new ImageData(tempImageBuffer, width, height);
    bgContext.putImageData(tempImageData, 0, 0);
    return maxWeight;
  }




}

// function calcRepLines(ids: number[], repCount: number, queryOption: TimeboxOption | AngularOption) {
//   console.time("calc line weight");
//   const lineCount = repCount;
//   const lineWeights: {
//     id: number,
//     w: number[],
//     cur: {x: number, y: number}[]
//   }[] = ids.map((id) => ({
//     id,
//     w: calcLineWeight(id),
//     cur: []
//   }));

//   console.timeEnd("calc line weight");
//   lineWeights.sort(
//     (a, b) => b.w[0] * Math.sqrt(b.w[1]) - a.w[0] * Math.sqrt(a.w[1])
//   );
//   // if (!this.calculatedMaxDiverse) {
//   //   this.maxDiverse = d3.max(lineWeights, line => d3.max(line.cur, d=>d.y));
//   //   console.log('calculated maxdiverse', this.maxDiverse, lineWeights);
//   //   this.calculatedMaxDiverse = true;
//   // }
//   // const extend0 = d3.extent(lineWeights, d => d.cur[0]);
//   // const extend1 = d3.extent(lineWeights, d => d.cur[1]);
//   // const scale0 = d3.scaleLinear().domain(extend0).range([0, 1]);
//   // const scale1 = d3.scaleLinear().domain(extend1).range([0, 1]);
//   //
//   // lineWeights.forEach(d => {
//   //   d.cur[0] = scale0(d.cur[0]);
//   //   d.cur[1] = scale1(d.cur[1]);
//   // })
//   return (
//     lineWeights
//       .reduce((p, v) => {
//         // if (document.getElementById("show-all-clusters").checked) {
//         //   p.push(v);
//         //   return p;
//         // }

//         if (p.length >= lineCount) {
//           return p;
//         }
//         if (!v.cur) {
//           v.cur = calculateCurvature(
//             unobserve.result[v.id].filter((point) =>
//               unobserve.querys.length <= 0 && !unobserve.preview
//                 ? true
//                 : (unobserve.preview
//                   ? [unobserve.preview]
//                   : unobserve.querys
//                 ).find((query) => {
//                   if (query.type === "knn") {
//                     return true; // TODO: only line in knn
//                   } else if (query.type === "rnn") {
//                     return (
//                       Math.sqrt(
//                         Math.pow(point.x - query.start[0], 2) +
//                         Math.pow(point.y - query.start[1], 2)
//                       ) <= query.n
//                     );
//                   } else if (query.type === "brush") {
//                     const startX = Math.min(query.start[0], query.end[0]);
//                     const startY = Math.min(query.start[1], query.end[1]);
//                     const endX = Math.max(query.start[0], query.end[0]);
//                     const endY = Math.max(query.start[1], query.end[1]);
//                     return (
//                       point.x >= startX &&
//                       point.y >= startY &&
//                       point.x <= endX &&
//                       point.y <= endY
//                     );
//                   } else if (query.type === "ang") {
//                     const startX = Math.min(query.start[0], query.end[0]);
//                     const endX = Math.max(query.start[0], query.end[0]);
//                     return point.x >= startX && point.x <= endX;
//                   }
//                 })
//             )
//           );
//         }
//         if (p.find((a) => calculateDifference(a.cur, v.cur) < this.diverse)) {
//           return p;
//         }
//         p.push(v);
//         return p;
//       }, [])
//       // .slice(0, lineCount)
//       .map((x) => x.id)
//   );
// }



// function isTimeboxQueryTask<T extends Object>(input: null | undefined | T): input is T {
//   return input != null;
// }

// function calcLineWeight(id: number, queryTasks: QueryTask[]) {
//   let weight = 0;
//   let passedPixels = 0;
//   let lineLen = 0;
//   const hasBrush= queryTasks.find((q) => q.mode=== "timebox");

//   function isString(test: any): test is string {
//     return typeof test === "string";
// }



//   const brushes = queryTasks
//     .filter((q): q is TimeboxQueryTask => q.mode=== "timebox") 
//     .map((b) => [
//       Math.min(b.constraint.xStart, b.constraint.xEnd),
//       Math.max(b.constraint.xStart, b.constraint.xEnd),
//       Math.min(b.constraint.yEnd, b.constraint.yEnd),
//       Math.max(b , b.end[1]),
//     ]);
//   // if (unobserve.weightCache[id] !== undefined && !hasBrush) return unobserve.weightCache[id];
//   const line = unobserve.result[id];
//   const width = this.option.width;
//   const height = this.option.height;
//   const cache = this.initDensityBufferCache;

//   for (let i = 0; i < line.length - 1; i++) {
//     let xx = Math.floor(line[i + 1].x);
//     let yy = Math.floor(line[i + 1].y);
//     let x = Math.floor(line[i].x);
//     let y = Math.floor(line[i].y);
//     // BRENSENHAM
//     let dx = Math.abs(xx - x);
//     let sx = x < xx ? 1 : -1;
//     let dy = -Math.abs(yy - y);
//     let sy = y < yy ? 1 : -1;
//     let err = dx + dy;
//     let errC; // error value
//     let end = false;
//     let x1 = x;
//     let y1 = y;
//     let px = 0;

//     while (!end) {
//       if (
//         (!hasBrush ||
//           brushes.find(
//             (b) => b[0] <= x1 && b[1] >= x1 && b[2] <= y1 && b[3] >= y1
//           )) &&
//         x1 >= 0 &&
//         x1 < width &&
//         y1 >= 0 &&
//         y1 < height
//       ) {
//         weight += cache[x1 * height + y1];
//         passedPixels++;
//         if (x1 !== px) {
//           px = x1;
//           lineLen++;
//         }
//       }
//       if (x1 === xx && y1 === yy) {
//         end = true;
//       } else {
//         errC = 2 * err;
//         if (errC >= dy) {
//           err += dy;
//           x1 += sx;
//         }
//         if (errC <= dx) {
//           err += dx;
//           y1 += sy;
//         }
//       }
//     }
//   }

//   let oldWeight = weight;
//   weight /= passedPixels;

//   if (!isFinite(weight) || isNaN(weight)) {
//     weight = 0.00001;
//   }

//   if (!hasBrush) {
//     unobserve.weightCache[id] = [
//       weight * Math.sqrt(lineLen),
//       line[line.length - 1].x - line[0].x,
//     ];
//   }
//   return [weight * Math.sqrt(lineLen), line[line.length - 1].x - line[0].x];
// }