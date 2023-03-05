import { computeCurvature, lineRectCollide, pointDist, pointDot, pointMax, pointMin, pointNormalize, pointSub } from "./util";
import { Point, Point2D, Point3D } from "../types";
import { MinMaxSet } from "../MinMaxSet";
import { sortedIndexBy } from "lodash";


/**
 * indexed data
 */
type TSRD = {
  pos: Point3D[], //  flatten points
  cuv: Float32Array, // curvature of each point
  offsets: Uint16Array | Uint32Array,  //  the start index in the pos of each line
  sizes: Uint8Array | Uint16Array | Uint32Array,  //  the size of each line
  fastID: Uint16Array | Uint32Array,  //  the line index of each point, map point index to line index
  lineID: number[], // RDP. the line index of each segement after rdp, it has the same length with segINdex.
  segIndex: [number, number][], // RDP. the start and end point of all segments after rdp.
};

// start pos, end pos, angle, lineIndex
type SegInfo = [number, number, number, number]


// start point, end point, angle, lineIndex, backpoints
export type ConcreteSegInfo = {
  lineId: number,
  points: Point2D[]
}

type CCHInternalNode = {
  dim: number,
  pos: number,
  left: CCHInternalNode | CCHLeafNode,
  right: CCHInternalNode | CCHLeafNode
}

type CCHLeafNode = {
  segs: number[];
}

type AABB = {
  a: Point3D,
  b: Point3D,
}

type CurveInfo = {
  aabb: AABB,
  from: number,  // from index of point
  to: number,  // to index of point
  sp: number[],  // split points
}

type HeapDatum = {
  id: number,
  value: number, // search point 到 线段的距离
  point: Point3D, // 线段上的最近点
}

/**
 * Map<lineID, {
 *  minSegID, maxSegID,
 *  segIDsInRange: Set<segID>
 * }>
 */
type ScoreResult = Map<number, {
  minSegID: number,
  maxSegID: number,
  segIDsInRange: Set<number>
}>

const kdparam = {
  deg: 3,
  b: 1.128,
  k: 5, // max number in each node
  r: 0.05,
  cuveq: 0.06,
};

/**
 * @type {{
 *  id: number,
 *  value: number,
 *  point: Point
 * }}
 */
let globalHashCache: HeapDatum = {
  id: 0,
  value: 0,
  point: { x: 0, y: 0, z: 0 }
};

export default class CCHTree {
  root: CCHInternalNode | CCHLeafNode | null;
  segs: SegInfo[];
  pos: Point3D[];
  lines: Point2D[][];
  minMaxSet: null | Map<number, MinMaxSet>;
  percentages: null | Map<number, number>;
  offsets: null | TSRD["offsets"];


  /**
   *
   * @param {Point[][]} lines
   * @param { {lineId: number, points: Point[]}[] } segs
   * @param {number} precision
   */
  constructor(lines: Point2D[][], precision: number = 1000) {
    this.root = null;
    this.segs = [];
    this.lines = [];
    this.minMaxSet = null;
    this.percentages = null;
    this.offsets = null;
    console.time("seg to lines");
    // segs.sort((seg1, seg2) => seg1.lineId === seg2.lineId ? seg1.points[0].x - seg2.points[0].x : seg1.lineId - seg2.lineId);

    // const lines: Point2D[][] = [];
    this.lines = lines;
    // console.log("segs", segs);
    // segs.forEach((seg) => {
    //   if (lines[seg.lineId] === undefined) {
    //     lines[seg.lineId] = [];
    //   }
    //   lines[seg.lineId].push(...seg.points);
    // });
    for (let i = 0; i < lines.length; ++i) {
      if (!lines[i]) lines[i] = [];
    }
    console.timeEnd("seg to lines");



    // #region 1. prepare data
    const tsrd = initializeTSRD(lines);
    // console.time("rdp");
    rdp(tsrd, precision);
    // console.timeEnd("rdp");
    computeSlope(tsrd);
    const allci: CurveInfo[] = computeCurveInfos(tsrd);
    this.pos = tsrd.pos;
    this.offsets = tsrd.offsets;
    //#endregion

    //#region 2. construct kd-tree
    console.time('split');
    // [curveInfo[], isLeft, cchInternalNode, level }]
    const stacks: any[] = [];
    const segMapping = new Map();
    // let segcount = 0;
    // let totalTry = 0;
    // let futileTry = 0;
    stacks.push(allci, false, null, 0);
    while (stacks.length) {
      const si: [CurveInfo[], boolean, null | CCHInternalNode, number] = stacks.slice(stacks.length - 4, stacks.length) as [CurveInfo[], boolean, null | CCHInternalNode, number];
      //console.time('compute variance & dim');
      // let average = { x: 0, y: 0 };
      // let variance = { x: 0, y: 0 };

      //#region 5.1 compute aabb of this node
      /** @type {Point} min Point of the aabb of all points */
      // let minv = tsrd.pos[si[0][0].from];
      let minv = si[0][0] ? tsrd.pos[si[0][0].from] : { x: Infinity, y: Infinity, z: Infinity };
      /** @type {Point} max Point of the aabb of all points */
      let maxv = minv;
      // let pointCount = 0;
      for (let ci of si[0]) {
        // pointCount += ci.to - ci.from + 1;
        // for (let i = ci.from; i <= ci.to; i++) {
        //   average = pointAdd(average, tsrd.pos[i]);
        // }
        minv = pointMin(ci.aabb.a, minv);
        maxv = pointMax(ci.aabb.b, maxv);
      }
      /** @type {Point} max - min */
      const delta = pointSub(maxv, minv);
      //#endregion

      // average = pointDiv(average, pointCount);
      // for (let ci of si[0]) {
      //   for (let i = ci.from; i <= ci.to; i++) {
      //     const delta0 = pointSub(average, tsrd.pos[i]);
      //     variance = pointAdd(variance, pointMultiply(delta0, delta0));
      //   }
      // }
      //console.timeEnd('compute variance & dim');

      // //console.time('extract variance for each dim');
      // let vars = [];
      // vars.push([variance.x, 0], [variance.y, 1], [variance.z, 2]);
      // vars.sort((a, b) => a[0] - b[0]);
      // //console.timeEnd('extract variance for each dim');

      //console.time('try each dim');
      let leftResult: CurveInfo[] = [],
        rightResult: CurveInfo[] = [];
      /** @type {number} brute-force cost */
      const allc2 = countSegs(si[0]);
      // const allc = countWeight(si[0], weights, defaultWeight);
      /** @type {booean} if true, continue to divide. Otherwise, stop */
      let pass = false;
      /** @type {number} dimension index */
      let dim = 0;
      let expectPos = 0;

      // Accelerate first 3 level
      const level = si[3];
      // if level greater than 2, try all dim. Othewise, // try only the dim with the largest variance. Beacause the cost is too higth at the begin.
      const startDim = level > 1 ? 0 : level;
      const endDim = level > 1 ? 2 : level;
      // const startDim = 0;
      // const endDim = 2;

      //#region determine the split dimension and split point
      if (level < 10) {
        const costs = [];
        const expectPoss = [];
        const leftResults = [];
        const rightResults = [];
        for (let dimIndex = startDim; dimIndex <= endDim; dimIndex++) {
          //#region 1. stop split if the aabb is too small
          if (delta[dim2xyz(dim)] < kdparam.r * 2) {
            costs.push(Infinity);
            expectPoss.push(0);
            leftResults.push([]);
            rightResults.push([]);
            continue;
          }
          dim = dimIndex;
          //#endregion

          //#region 2. get candidate split hyperplanes on this dimension.
          /** @type {number[][]} candidate split hyperplane (all the segment endpoints) */
          let candidates = [];
          // let totalWeight = 0;
          for (let ci of si[0]) {
            for (let i = ci.from + 1; i < ci.to; i++) {
              const candidatePos = tsrd.pos[i][dim2xyz(dim)] ?? 0;
              // candidates.push([candidatePos, weights[i]]);
              candidates.push([candidatePos]);
              // totalWeight += weights[i];
            }
            let cpos1 = tsrd.pos[ci.from][dim2xyz(dim)] ?? 0;
            let cpos2 = tsrd.pos[ci.to][dim2xyz(dim)] ?? 0;
            // candidates.push([cpos1, defaultWeight + weights[ci.from]]);
            // candidates.push([cpos2, defaultWeight + weights[ci.to]]);
            candidates.push([cpos1]);
            candidates.push([cpos2]);
            // totalWeight += defaultWeight * 2;
          }
          //#endregion

          //#region 3. use median as the split point
          /** @type {number} median of candidates */
          const expectPos = getMidWeightedVal(candidates);
          expectPoss.push(expectPos);
          //#endregion

          //#region 4. compute cost
          // leftResult = [];
          // rightResult = [];
          const [leftResult, rightResult] = splitCurves(dim, expectPos, si[0], tsrd);
          leftResults.push(leftResult);
          rightResults.push(rightResult);
          const leftC2 = countSegs(leftResult);
          const rightC2 = countSegs(rightResult);
          const leftCurveCount = leftResult.length;
          const rightCurveCount = rightResult.length;
          const p = (expectPos - minv[dim2xyz(dim)]) / delta[dim2xyz(dim)];
          const cost = computeCost(leftC2, rightC2, allc2, p, 0, 0);
          //#endregion

          //#region 5. decide should split further or not
          if (
            cost < allc2 && // not meet the termination condition
            leftCurveCount >= kdparam.k && // the number of segments greater than k
            rightCurveCount >= kdparam.k && // the number of segments greater than k
            delta[dim2xyz(dim)] * p > kdparam.r && // the size of the aabb on this dimension is greater than r
            delta[dim2xyz(dim)] * (1 - p) > kdparam.r // the size of the aabb on this dimension is greater than r
          ) {
            costs.push(cost);
            // pass = true;
            // break;
          } else {
            costs.push(Number.POSITIVE_INFINITY);
          }
          //#endregion
        }
        let minCost = costs[0];
        dim = startDim;
        costs.forEach((cost, i) => {
          if (cost < minCost) {
            minCost = cost;
            dim = i + startDim;
          }
        });
        if (minCost < Number.POSITIVE_INFINITY) {
          expectPos = expectPoss[dim - startDim];
          pass = true;
          rightResult = rightResults[dim - startDim];
          leftResult = leftResults[dim - startDim];
        }
      }
      //#endregion

      //console.timeEnd('try each dim');

      //console.time('LR split');
      if (pass) {
        const ns: CCHInternalNode = {
          dim,
          pos: expectPos,
          left: { segs: [] },
          right: { segs: [] }
        };
        if (si[2] === null) {
          this.root = ns;
        } else {
          connectNode(si[2], ns, si[1]);
        }
        stacks.pop();
        stacks.pop();
        stacks.pop();
        stacks.pop();
        stacks.push(
          leftResult,
          true,
          ns,
          si[3] + 1,
          rightResult,
          false,
          ns,
          si[3] + 1
        );
      } else {
        //!!! 可以不存diff
        const nl: CCHLeafNode = { segs: [] };
        for (let ci of si[0]) {
          let lastIndex = ci.from;
          for (let currIndex of ci.sp) {
            if (lastIndex == currIndex) continue;
            const key = `${tsrd.pos[lastIndex].x}-${tsrd.pos[currIndex].x}-${tsrd.fastID[currIndex]}`;
            const mapKey = segMapping.get(key);
            if (mapKey !== undefined) {
              nl.segs.push(mapKey);
            } else {
              const diff = pointSub(tsrd.pos[currIndex], tsrd.pos[lastIndex]);
              /** @type {SegInfo} */
              // !!! 需要存，一共有多少个线段，每个线段的斜率怎样
              const ls: SegInfo = [
                lastIndex,
                // ci.to,
                currIndex,
                diff.y / diff.x,
                tsrd.fastID[currIndex],
              ];
              const lid = this.segs.length;
              this.segs.push(ls);
              nl.segs.push(lid);
              // console.log(nl);
              segMapping.set(key, lid);
              // brensenham(ls, lid, this.prebuiltPixel);
            }
            lastIndex = currIndex;
          }
          if (lastIndex == ci.to) continue;
          const key = `${tsrd.pos[lastIndex].x}-${tsrd.pos[ci.to].x}-${tsrd.fastID[ci.to]
            }`;
          const mapKey = segMapping.get(key);
          if (mapKey !== undefined) {
            nl.segs.push(mapKey);
          } else {
            const diff = pointSub(tsrd.pos[lastIndex], tsrd.pos[ci.to]);
            const ls: SegInfo = [
              lastIndex,
              ci.to,
              // tsrd.pos[lastIndex],
              // tsrd.pos[ci.to],
              diff.y / diff.x,
              tsrd.fastID[ci.to],
            ];
            const lid = this.segs.length;
            this.segs.push(ls);
            nl.segs.push(lid);
            segMapping.set(key, lid);
            // brensenham(ls, lid, this.prebuiltPixel);
          }
        }
        const endIndex = this.segs.length - 1;

        // segcount += nl.segs.length;
        if (si[2] === null) {
          this.root = nl;
        } else {
          connectNode(si[2], nl, si[1]);
        }
        stacks.pop();
        stacks.pop();
        stacks.pop();
        stacks.pop();
      }
      //console.timeEnd('LR split');
      //console.timeEnd('single stack');
    }

    console.timeEnd('split');
    //console.log(tsrd.);
    //_endregion

    //#endregion

    // console.log("this.segs", this.segs);
  }


  // knn(point: [number, number], k: number): number[] {
  //   globalHashCache = {
  //     id: 0,
  //     value: 0,
  //     point: {x: 0, y:0, z: 0}
  //   };
  //   const result = new Heap<HeapDatum>((a, b) => b.value - a.value);
  //   this._search(result, { x: point[0], y: point[1] }, k, this.root);
  //   // console.log(result.toArray());
  //   return result.toArray();
  // }

  // rnn(point, r) {
  //   // if (r <= 1 && r > 0) {
  //   //   const search = { x: point[0], y: point[1] };
  //   //   return this.ghost(point)
  //   //     .map((segId) => {
  //   //       const seg = this.segs[segId];
  //   //       const ap = pointSub(search, seg[0]);
  //   //       let dir = pointSub(seg[1], seg[0]);
  //   //       ap.z = 0;
  //   //       dir.z = 0;
  //   //       const len = Math.sqrt(pointDot(dir, dir));
  //   //       dir = pointDiv(dir, len);
  //   //       const dv = pointDot(ap, dir);
  //   //       const lineId = seg[3];
  //   //       let dis, point;
  //   //       if (dv <= 0) {
  //   //         dis = pointDist2D(seg[0], search);
  //   //         point = seg[0];
  //   //       } else if (dv >= len) {
  //   //         dis = pointDist2D(seg[1], search);
  //   //         point = seg[1];
  //   //       } else {
  //   //         dis = Math.sqrt(pointDot(ap, ap) - dv * dv);
  //   //         point = pointAdd(seg[0], pointMul(dir, dv));
  //   //       }
  //   //       return {
  //   //         id: lineId,
  //   //         value: dis,
  //   //         point,
  //   //       };
  //   //     })
  //   //     .filter((seg) => seg.value <= r);
  //   // }
  //   const result = {};
  //   this._searchRNN(result, { x: point[0], y: point[1] }, r, this.root);
  //   // console.log(Object.values(result));
  //   return Object.values(result);
  // }





  /**
   * xy brush (no z)
   * @param {[number, number]} lo  low x and y
   * @param {[number, number]} hi high x and y
   * @returns 
   */
  brush(lo: [number, number], hi: [number, number], p: number = 1): number[] {
    const result = new Set<number>();
    this._range(
      result,
      { x: lo[0], y: lo[1], z: -Infinity },
      { x: hi[0], y: hi[1], z: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    // console.log("first result", [...result]);
    // kdbox removal
    const removal = new Set<number>();
    this._range(
      removal,
      { x: lo[0], y: -Infinity, z: -Infinity },
      { x: hi[0], y: lo[1], z: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    this._range(
      removal,
      { x: lo[0], y: hi[1], z: -Infinity },
      { x: hi[0], y: Infinity, z: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    // this.brushSegs(lo, hi);
    const r = [...result].filter((x) => !removal.has(x));
    // console.log(r);
    return r;
  }

  /**
   * 
   * @param {[number, number]} loX 
   * @param {[number, number]} hiX 
   * @returns {ConcreteSegInfo[]}
   */
  brushSegs(lo: [number, number], hi: [number, number]): ConcreteSegInfo[] {
    const pos = this.pos;
    const segInfos = this._rangeSegReal(
      { x: lo[0], y: lo[1], z: -Infinity },
      { x: hi[0], y: hi[1], z: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    )

    console.time("remove duplicated segs");
    segInfos.sort((s1, s2) => {
      if (s1[3] !== s2[3]) return s1[3] - s2[3];
      if (s1[0] !== s1[0]) return s1[0] - s2[0];
      return s1[1] - s2[1];
    });
    // console.log("segInfos---", segInfos);
    let length = segInfos.length;
    // let preFrom = Infinity;
    let preTo = -Infinity;
    let deleteCount = 0;
    for (let i = 0; i < length; ++i) {
      const si = segInfos[i - deleteCount];
      if (si[1] <= preTo) {
        segInfos.splice(i - deleteCount, 1);
        deleteCount++;
        continue;
      }
      preTo = si[1];
    }

    length = segInfos.length;
    // if(segInfos.length >=0)
    // preTo = segInfos[0][1];
    preTo = -Infinity;
    deleteCount = 0;
    for (let i = 0; i < length; ++i) {
      const si = segInfos[i - deleteCount];
      if (si[0] <= preTo) {
        segInfos.splice(i - deleteCount, 1);
        deleteCount++;
        continue;
      }
      preTo = si[1];
    }
    console.timeEnd("remove duplicated segs");

    const segs: ConcreteSegInfo[] = segInfos.map(seg => {
      // return [...seg, pos.slice(seg[0], seg[1]+1)];
      return {
        lineId: seg[3],
        points: pos.slice(seg[0], seg[1] + 1),
      }
    });

    // console.log("loX, hiX: ", lo, hi);
    // console.log("segs: ", segs);
    return segs;
  }


  /**
   * brush x segments
   * @param lo  low X
   * @param hi low Y
   * @returns 
   */
  brushXSegs(lo: number, hi: number): ConcreteSegInfo[] {
    return this.brushSegs([lo, -Infinity], [hi, Infinity]);
  }

  /**
   *  angular query
   * @param lo  low X
   * @param hi low Y
   * @returns 
   */
  angular(lo: [number, number], hi: [number, number]): number[] {
    const result = new Set<number>();
    this._range(
      result,
      { x: lo[0], z: lo[1], y: -Infinity },
      { x: hi[0], z: hi[1], y: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );

    const removal = new Set<number>();
    this._range(
      removal,
      { x: lo[0], z: hi[1], y: -Infinity },
      { x: hi[0], z: Infinity, y: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );

    this._range(
      removal,
      { x: lo[0], z: -Infinity, y: -Infinity },
      { x: hi[0], z: lo[1], y: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    return [...result].filter((x) => !removal.has(x));
  }

  // ghost(point) {
  //   return this.prebuiltPixel.get(`${point[0]}-${point[1]}`);
  // }

  // // k-nearest search
  // _search(result: Heap<HeapDatum>, point: Point3D, k: number, node: CCHInternalNode | CCHLeafNode | null) {
  //   if (!node || k <= 0) return;
  //   if ((node as CCHLeafNode).segs) {
  //     // Leaf node
  //     return this._searchLeaf(result, point, k, node as CCHLeafNode);
  //   }
  //   node = node as CCHInternalNode;
  //   const s = point[dim2xyz(node.dim)];
  //   if (s < node.pos) {
  //     this._search(result, point, k, node.left);
  //     if (result.top()!.value > node.pos - s || result.size() < k) {
  //       this._search(result, point, k, node.right);
  //     }
  //   } else {
  //     this._search(result, point, k, node.right);
  //     if (result.top()!.value > s - node.pos || result.size() < k) {
  //       this._search(result, point, k, node.left);
  //     }
  //   }
  // }

  // // k-nearest search
  // _searchLeaf(result: Heap<HeapDatum>, search: Point3D, k: number, node: CCHLeafNode) {
  //   for (let i of node.segs) {
  //     const [from, to, angle, lineId] = this.segs[i];
  //     const ap = pointSub(search, this.pos[from]);
  //     let dir = pointSub(this.pos[to], this.pos[from]);
  //     ap.z = 0;
  //     dir.z = 0;
  //     const len = Math.sqrt(pointDot(dir, dir));
  //     dir = pointDiv(dir, len);
  //     // ap 的长度
  //     const dv = pointDot(ap, dir);
  //     let dis, point;
  //     if (dv <= 0) { // search point 到 线段左端点的距离
  //       dis = pointDist2D(this.pos[from], search);
  //       point = this.pos[from];
  //     } else if (dv >= len) { // search point 到 线段右端点的距离
  //       dis = pointDist2D(this.pos[to], search);
  //       point = this.pos[to];
  //     } else { // search point 到 线段垂点的距离
  //       dis = Math.sqrt(pointDot(ap, ap) - dv * dv);
  //       point = pointAdd(this.pos[from], pointMul(dir, dv));
  //     }
  //     const obj = {
  //       id: lineId,
  //       value: dis, // search point 到 线段的距离
  //       point, // 线段上的最近点
  //     };
  //     this._insertHeapLimit(result, k, obj);
  //   }
  // }

  // _insertHeapLimit(heap: Heap<HeapDatum>, k, obj) {
  //   if (globalHashCache[obj.id] === undefined) {
  //     if (heap.size() < k) {
  //       heap.push(obj);
  //     } else {
  //       heap.pushpop(obj);
  //     }
  //     globalHashCache[obj.id] = obj;
  //   } else if (obj.value < globalHashCache[obj.id].value) {
  //     globalHashCache[obj.id].value = obj.value;
  //     globalHashCache[obj.id].point = obj.point;
  //     heap.updateItem(obj);
  //   }
  // }

  // _searchRNN(result, point, r, node) {
  //   if (!node || r <= 0) return;
  //   if (node.segs) {
  //     // Leaf node
  //     return this._searchLeafRNN(result, point, r, node);
  //   }
  //   const s = point[dim2xyz(node.dim)];
  //   if (s < node.pos) {
  //     this._searchRNN(result, point, r, node.left);
  //     if (r > node.pos - s) {
  //       this._searchRNN(result, point, r, node.right);
  //     }
  //   } else {
  //     this._searchRNN(result, point, r, node.right);
  //     if (r > s - node.pos) {
  //       this._searchRNN(result, point, r, node.left);
  //     }
  //   }
  // }

  // _searchLeafRNN(result, search, r, node) {
  //   for (let i of node.segs) {
  //     const [from, to, angle, lineId] = this.segs[i];
  //     const ap = pointSub(search, this.pos[from]);
  //     let dir = pointSub(this.pos[to], this.pos[from]);
  //     ap.z = 0;
  //     dir.z = 0;
  //     const len = Math.sqrt(pointDot(dir, dir));
  //     dir = pointDiv(dir, len);
  //     const dv = pointDot(ap, dir);
  //     let dis, point;
  //     if (dv <= 0) {
  //       dis = pointDist2D(this.pos[from], search);
  //       point = this.pos[from];
  //     } else if (dv >= len) {
  //       dis = pointDist2D(this.pos[to], search);
  //       point = this.pos[to];
  //     } else {
  //       dis = Math.sqrt(pointDot(ap, ap) - dv * dv);
  //       point = pointAdd(this.pos[from], pointMul(dir, dv));
  //     }
  //     if (dis < r) {
  //       if (result[lineId] === undefined) {
  //         result[lineId] = {
  //           id: lineId,
  //           value: dis,
  //           point,
  //         };
  //       } else if (result[lineId].value > dis) {
  //         result[lineId].value = dis;
  //         result[lineId].point = point;
  //       }
  //     }
  //   }
  // }

  /**
   * 
   * @param result 
   * @param p1 min search point
   * @param p2  max search point
   * @param aabb parent search space
   * @param node 
   * @returns 
   */
  _range(result: Set<number>, p1: Point3D, p2: Point3D, aabb: AABB, node: CCHInternalNode | CCHLeafNode | null) {
    // 1. ensure that p1 < p2 and node is not null.
    if (p1.x > p2.x || p1.y > p2.y || p1.z > p2.z || !node) return;

    // 2. search leaf directly
    if ((node as CCHLeafNode).segs) {
      return this._rangeLeaf(result, p1, p2, node as CCHLeafNode);
    }

    // 3. totally inside. 
    if (
      aabb.a.x >= p1.x &&
      aabb.a.y >= p1.y &&
      aabb.a.z >= p1.z &&
      aabb.b.x <= p2.x &&
      aabb.b.y <= p2.y &&
      aabb.b.z <= p2.z
    ) {
      return this._iterRange(result, p1, p2, node);
    }

    // 4. intersect
    node = node as CCHInternalNode;
    const s1 = p1[dim2xyz(node.dim)];
    const s2 = p2[dim2xyz(node.dim)];
    let skipLeft = false,
      skipRight = false;
    if (s1 >= node.pos) {
      skipLeft = true;
    }
    if (s2 <= node.pos) {
      skipRight = true;
    }
    skipLeft ||
      this._range(
        result,
        p1,
        p2,
        {
          a: aabb.a,
          b: { ...aabb.b, [dim2xyz(node.dim)]: node.pos },
        },
        node.left
      );
    skipRight ||
      this._range(
        result,
        p1,
        p2,
        {
          a: { ...aabb.a, [dim2xyz(node.dim)]: node.pos },
          b: aabb.b,
        },
        node.right
      );
  }

  _iterRange(result: Set<number>, p1: Point3D, p2: Point3D, node: CCHInternalNode | CCHLeafNode | null) {
    if (!node) return;
    if ((node as CCHLeafNode).segs) {
      return this._rangeLeaf(result, p1, p2, (node as CCHLeafNode));
    }
    this._iterRange(result, p1, p2, (node as CCHInternalNode).left);
    this._iterRange(result, p1, p2, (node as CCHInternalNode).right);
  }

  // _rangeLeafAll(result: Set<number>, p1: Point3D, p2: Point3D, node: CCHLeafNode) {
  //   for (const i of node.segs) {
  //     const [lineId] = this.segs[i];
  //     // if(!result.has(lineId)) result.add(lineId);
  //     result.add(lineId);
  //   }
  // }

  _rangeLeaf(result: Set<number>, p1: Point3D, p2: Point3D, node: CCHLeafNode) {
    for (let i of node.segs) {
      const [from, to, angle, lineId] = this.segs[i];
      if (!result.has(lineId)) {
        if (isFinite(p1.z) || isFinite(p2.z)) {
          if (
            angle >= p1.z &&
            angle <= p2.z &&
            this.pos[from].x < p2.x &&
            this.pos[to].x > p1.x
          ) {
            result.add(lineId);
          }
        } else {
          if (
            (this.pos[from].x >= p1.x &&
              this.pos[from].y >= p1.y &&
              this.pos[from].x <= p2.x &&
              this.pos[from].y <= p2.y) ||
            (this.pos[to].x >= p1.x &&
              this.pos[to].y >= p1.y &&
              this.pos[to].x <= p2.x &&
              this.pos[to].y <= p2.y) ||
            lineRectCollide(
              {
                x1: this.pos[from].x,
                y1: this.pos[from].y,
                x2: this.pos[to].x,
                y2: this.pos[to].y,
              },
              { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y }
            )
          )
            result.add(lineId);
        }
      }
    }
  }

  _rangeSegReal(p1: Point3D, p2: Point3D, aabb: AABB, node: CCHInternalNode | CCHLeafNode | null) {
    const segIdSet = new Set<number>();
    this._rangeSeg(segIdSet, p1, p2, aabb, node);
    const segs = this.segs;
    return Array.from(segIdSet).map((id) => segs[id]);
  }


  _rangeSeg(result: Set<number>, p1: Point3D, p2: Point3D, aabb: AABB, node: CCHInternalNode | CCHLeafNode | null) {
    if (p1.x >= p2.x || p1.y >= p2.y || p1.z >= p2.z || !node) return;
    if ((node as CCHLeafNode).segs) {
      return this._rangeLeafSeg(result, p1, p2, (node as CCHLeafNode));
    }
    node = node as CCHInternalNode;
    if (
      aabb.a.x >= p1.x &&
      aabb.a.y >= p1.y &&
      aabb.a.z >= p1.z &&
      aabb.b.x <= p2.x &&
      aabb.b.y <= p2.y &&
      aabb.b.z <= p2.z
    ) {
      return this._iterRangeSeg(result, p1, p2, node);
    }
    const s1 = p1[dim2xyz(node.dim)];
    const s2 = p2[dim2xyz(node.dim)];
    let skipLeft = false,
      skipRight = false;
    if (s1 >= node.pos) {
      skipLeft = true;
    }
    if (s2 <= node.pos) {
      skipRight = true;
    }
    skipLeft ||
      this._rangeSeg(
        result,
        p1,
        p2,
        {
          a: aabb.a,
          b: { ...aabb.b, [dim2xyz(node.dim)]: node.pos },
        },
        node.left
      );
    skipRight ||
      this._rangeSeg(
        result,
        p1,
        p2,
        {
          a: { ...aabb.a, [dim2xyz(node.dim)]: node.pos },
          b: aabb.b,
        },
        node.right
      );
  }

  _iterRangeSeg(result: Set<number>, p1: Point3D, p2: Point3D, node: CCHInternalNode | CCHLeafNode | null) {
    if (!node) return;
    if ((node as CCHLeafNode).segs) {
      return this._rangeLeafSeg(result, p1, p2, (node as CCHLeafNode));
    }
    this._iterRangeSeg(result, p1, p2, (node as CCHInternalNode).left);
    this._iterRangeSeg(result, p1, p2, (node as CCHInternalNode).right);
  }

  _rangeLeafSeg(result: Set<number>, p1: Point3D, p2: Point3D, node: CCHLeafNode) {
    for (let i of node.segs) {
      const [from, to, angle, lineId] = this.segs[i];
      if (!result.has(lineId)) {
        if (isFinite(p1.z) || isFinite(p2.z)) {
          if (
            angle >= p1.z &&
            angle <= p2.z &&
            this.pos[from].x < p2.x &&
            this.pos[to].x > p1.x
          ) {
            // console.log("from, to", this.pos[from], this.pos[to]);
            result.add(i);
          }
        } else {
          if (
            (this.pos[from].x >= p1.x &&
              this.pos[from].y >= p1.y &&
              this.pos[from].x <= p2.x &&
              this.pos[from].y <= p2.y) ||
            (this.pos[to].x >= p1.x &&
              this.pos[to].y >= p1.y &&
              this.pos[to].x <= p2.x &&
              this.pos[to].y <= p2.y) ||
            lineRectCollide(
              {
                x1: this.pos[from].x,
                y1: this.pos[from].y,
                x2: this.pos[to].x,
                y2: this.pos[to].y,
              },
              { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y }
            )
          )
            result.add(i);
        }
      }
    }
  }



  /**
 * xy brush (no z)
 * @param {[number, number]} lo  low x and y
 * @param {[number, number]} hi high x and y
 * @returns 
 */
  fuzzyBrush(lo: [number, number], hi: [number, number], p: number = 1, scoreFunc: () => number = () => 1): number[] {
    // lineID: Set<pointIDInBox>
    const result = new Map<number, MinMaxSet>();
    console.time("fuzzy range");
    console.log("lo-hi", lo, hi);
    this._fuzzyRange(
      result,
      { x: lo[0], y: lo[1], z: -Infinity },
      { x: hi[0], y: hi[1], z: Infinity },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    console.timeEnd("fuzzy range");
    const result2: number[] = [];
    console.time("fuzzy range2");
    const percentages = computePercentageAndUpdateMinMax(result, this.lines, lo, hi, this.offsets);
    for (let [lineId, percentage] of percentages) {
      if (percentage >= p) result2.push(lineId);
    }
    console.timeEnd("fuzzy range2");
    this.minMaxSet = result;
    this.percentages = percentages;
    return result2;
  }


  /**
* xy brush (no z)
* @param {[number, number]} lo  low x and s
* @param {[number, number]} hi high x and s
* @returns 
*/
  fuzzyAngular(lo: [number, number], hi: [number, number], p: number = 1, scoreFunc: () => number = () => 1): number[] {
    // lineID: Set<pointIDInBox>
    const result = new Map<number, MinMaxSet>();
    console.time("fuzzy angular");
    console.log("lo-hi", lo, hi);
    this._fuzzyRange(
      result,
      { x: lo[0], y: -Infinity, z: lo[1] },
      { x: hi[0], y: Infinity, z: hi[1] },
      {
        a: { x: -Infinity, y: -Infinity, z: -Infinity },
        b: { x: Infinity, y: Infinity, z: Infinity },
      },
      this.root
    );
    console.timeEnd("fuzzy angular");
    console.log("result", result);
    // console.log("fuzzy range", lo, hi, p, result);
    // const r = [...result];
    const result2: number[] = [];
    const entries = result.entries();
    console.time("fuzzy angular2");
    const percentages = computePercentageAndUpdateMinMax(result, this.lines, lo, hi, this.offsets);
    for (let [lineId, percentage] of percentages) {
      if (percentage >= p) result2.push(lineId);
    }
    console.timeEnd("fuzzy angular2");
    this.minMaxSet = result;
    this.percentages = percentages;
    return result2;
  }


  /**
   * 
   * @param result 
   * @param p1 min search point
   * @param p2  max search point
   * @param aabb parent search space
   * @param node 
   * @returns 
   */
  _fuzzyRange(result: Map<number, MinMaxSet>, p1: Point3D, p2: Point3D, aabb: AABB, node: CCHInternalNode | CCHLeafNode | null) {
    // 1. ensure that p1 < p2 and node is not null.
    if (p1.x > p2.x || p1.y > p2.y || p1.z > p2.z || !node) return;

    // 2. search leaf directly
    if ((node as CCHLeafNode).segs) {
      return this._fuzzyRangeLeaf(result, p1, p2, node as CCHLeafNode);
    }

    // 3. totally inside. 
    if (
      aabb.a.x >= p1.x &&
      aabb.a.y >= p1.y &&
      aabb.a.z >= p1.z &&
      aabb.b.x <= p2.x &&
      aabb.b.y <= p2.y &&
      aabb.b.z <= p2.z
    ) {
      return this._fuzzyIterRange(result, p1, p2, node);
    }

    // 4. intersect
    node = node as CCHInternalNode;
    const s1 = p1[dim2xyz(node.dim)];
    const s2 = p2[dim2xyz(node.dim)];
    let skipLeft = false,
      skipRight = false;
    if (s1 >= node.pos) {
      skipLeft = true;
    }
    if (s2 <= node.pos) {
      skipRight = true;
    }
    skipLeft ||
      this._fuzzyRange(
        result,
        p1,
        p2,
        {
          a: aabb.a,
          b: { ...aabb.b, [dim2xyz(node.dim)]: node.pos },
        },
        node.left
      );
    skipRight ||
      this._fuzzyRange(
        result,
        p1,
        p2,
        {
          a: { ...aabb.a, [dim2xyz(node.dim)]: node.pos },
          b: aabb.b,
        },
        node.right
      );
  }

  _fuzzyIterRange(result: Map<number, MinMaxSet>, p1: Point3D, p2: Point3D, node: CCHInternalNode | CCHLeafNode | null) {
    if (!node) return;
    if ((node as CCHLeafNode).segs) {
      return this._fuzzyRangeLeaf(result, p1, p2, (node as CCHLeafNode));
    }
    this._fuzzyIterRange(result, p1, p2, (node as CCHInternalNode).left);
    this._fuzzyIterRange(result, p1, p2, (node as CCHInternalNode).right);
  }

  // _fuzzyRangeLeafAll(result: Map<number, Set<number>>, p1: Point3D, p2: Point3D, node: CCHLeafNode) {
  //   for (const i of node.segs) {
  //     const [lineId] = this.segs[i];
  //     // if(!result.has(lineId)) result.add(lineId);
  //     if (result.has(lineId)) {
  //       const lineIDSet = result.get(lineId)!;//;?.add(node.segs);
  //       for (const seg of node.segs) {
  //         lineIDSet.add(seg);
  //       }
  //     } else {
  //       result.set(lineId, new Set(node.segs));
  //     }
  //   }
  // }

  _fuzzyRangeLeaf(result: Map<number, MinMaxSet>, p1: Point3D, p2: Point3D, node: CCHLeafNode) {
    // console.log("fuzzy leaf", node.segs, this.segs);
    for (let i of node.segs) {
      let [from, to, angle, lineId] = this.segs[i];

      let pointSet = result.get(lineId)!;
      const resultPointID: number[] = [];
      const isAngularQuery = isFinite(p1.z) || isFinite(p2.z);

      // if(isAngularQuery) to--;
      for (let pointID = from; pointID <= to; pointID++) {
        if (pointSet && pointSet.has(pointID)) continue;
        const point = this.pos[pointID];
        if (isAngularQuery) { // angular
          if (point.z >= p1.z && point.z <= p2.z
            && point.x >= p1.x && point.x <= p2.x) {
            resultPointID.push(pointID);
          }
        } else if ( // timebox
          (point.x >= p1.x &&
            point.y >= p1.y &&
            point.x <= p2.x &&
            point.y <= p2.y)
        )
          resultPointID.push(pointID);
      }

      if (resultPointID.length > 0) {
        if (result.has(lineId)) {
          resultPointID.forEach(pi => pointSet.add(pi));
        } else {
          pointSet = new MinMaxSet();
          result.set(lineId, pointSet);
          resultPointID.forEach(pi => pointSet.add(pi));
        }
      }

    }
  }
}








function splitIntoSegmentsByMaximumDistance(from: number, to: number, threshold: number, line: number, tsrd: TSRD) {
  if (to < from) return;
  if (to - from <= 1) {
    applySegment(from, to, line, tsrd);
    return;
  }
  const beginPos = tsrd.pos[from];
  const endPos = tsrd.pos[to];
  const dir = pointNormalize(pointSub(endPos, beginPos));
  let maximumDis = 0;
  let bestIndex = from;
  for (let i = from; i <= to; i++) {
    const curPos = tsrd.pos[i];
    const ap = pointSub(curPos, beginPos);
    const abLen = pointDot(ap, dir);
    const curDis = pointDot(ap, ap) - abLen * abLen;
    if (curDis > maximumDis) {
      bestIndex = i;
      maximumDis = curDis;
    }
  }
  if (maximumDis < threshold || bestIndex === from || bestIndex === to) {
    applySegment(from, to, line, tsrd);
  } else {
    splitIntoSegmentsByMaximumDistance(from, bestIndex, threshold, line, tsrd);
    splitIntoSegmentsByMaximumDistance(bestIndex, to, threshold, line, tsrd);
  }
}


function applySegment(from: number, to: number, line: number, tsrd: TSRD) {
  // const start = tsrd.pos[from];
  // const end = tsrd.pos[to];
  tsrd.lineID.push(line);
  // tsrd.segIndex.push([from, to, (end.y - start.y) / (end.x - start.x)]);
  tsrd.segIndex.push([from, to]);
}

/**
 * count the number of all segments in this node
 * @param {CurveInfo[]} org
 * @returns {number}
 */
function countSegs(org: CurveInfo[]) {
  let count = 0;
  for (let ci of org) {
    count += ci.sp.length + 1;
  }
  return count;
}

/**
 *
 * @param {*} org
 * @param {Float32Array} w
 * @param {number} defaultv
 * @returns {number}
 */
// function countWeight(org, w, defaultv) {
//   let count = 0;
//   for (let ci of org) {
//     for (let i = ci.from + 1; i < ci.to; i++) {
//       count += w[i];
//     }
//     count += defaultv;
//   }
//   return count / defaultv;
// }

/**
 * 中位数
 * @param {number[][]} data
 * @param {number} weight
 * @returns
 */
function getMidWeightedVal(data: number[][]) {
  //}, weight) {
  if (data.length <= 0) return Infinity;
  // data.sort((a, b) => a[0] < b[0]);
  data.sort((a, b) => a[0] - b[0]);
  return data[Math.floor(data.length / 2)][0];
  // return randomizedWeightedSelect(data, 0, data.length - 1, weight, 0, 0);
}

// function randomizedWeightedSelect(a, p, r, w, wlsum, wrsum) {
//   const q = randomizedPartition(a, p, r);
//   let wl = wlsum,
//     wr = wrsum;
//   for (let i = p; i < q; i++) wl += a[i][1];
//   for (let i = q + 1; i <= r; i++) wr += a[i][1];
//   const curw = a[q][1];
//   const allw = wl + wr + curw;
//   const expectW = allw * w;
//   if ((wl <= expectW && wr <= expectW) || p >= r) return a[q][0];
//   if (wl > expectW && p != q)
//     return randomizedWeightedSelect(a, p, q - 1, w, wlsum, wr + curw);
//   if (r != q) return randomizedWeightedSelect(a, q + 1, r, w, wl + curw, wrsum);
//   return a[q][0];
// }

// function randomizedPartition(a, p, r) {
//   const i = p + Math.round(Math.random() * (r - p));
//   swap(a, i, r);
//   return partition(a, p, r);
// }

// function partition(a, p, r) {
//   const x = a[r];
//   let i = p - 1,
//     j;
//   for (j = p; j < r; j++) {
//     if (a[j][0] < x[0]) {
//       i++;
//       swap(a, i, j);
//     }
//   }
//   swap(a, j, i + 1);
//   return i + 1;
// }

// function swap(a, i, j) {
//   const temp = a[i];
//   a[i] = a[j];
//   a[j] = temp;
// }

function dim2xyz(dim: number): "x" | "y" | "z" {
  return dim == 0 ? "x" : dim == 1 ? "y" : "z";
}

function updateAABB(ci: CurveInfo, pos: Point[]) {
  const beginIndex = ci.from;
  const endIndex = ci.to;
  ci.aabb = {
    a: {
      x: pos[beginIndex].x,
      y: pos[beginIndex].y,
      z: (pos[beginIndex] as Point3D).z ?? 0,
    },
    b: {
      x: pos[beginIndex].x,
      y: pos[beginIndex].y,
      z: (pos[beginIndex] as Point3D).z ?? 0,
    },
  };
  for (let j = beginIndex + 1; j <= endIndex; j++) {
    ci.aabb = {
      a: {
        x: Math.min(ci.aabb.a.x, pos[j].x),
        y: Math.min(ci.aabb.a.y, pos[j].y),
        z: Math.min(ci.aabb.a.z, (pos[j] as Point3D).z ?? 0),
      },
      b: {
        x: Math.max(ci.aabb.b.x, pos[j].x),
        y: Math.max(ci.aabb.b.y, pos[j].y),
        z: Math.max(ci.aabb.b.z, (pos[j] as Point3D).z ?? 0),
      },
    };
  }
}

/**
 * !!!
 * split curves based on pos
 * @param {number} dim
 * @param {number} pos split plane
 * @param {CurveInfo[]} org curve infos in this node
 * @param {TSRD} tsrd
 * @return {[CurveInfo[], CurveInfo[]]}
 */
function splitCurves(dim: number, pos: number, org: CurveInfo[], tsrd: TSRD) {
  const resultLeft = [];
  const resultRight = [];
  // !!!
  if (dim === 2) { };
  for (let ci of org) {
    let a = ci.aabb.a[dim2xyz(dim)];
    let b = ci.aabb.b[dim2xyz(dim)];
    if (a > b) {
      const temp = a;
      a = b;
      b = temp;
    }
    if (pos <= a) {
      resultRight.push(ci);
    } else if (pos >= b) {
      resultLeft.push(ci);
    } else {
      let candidateIndex = 0;
      let newci: CurveInfo = {
        aabb: {
          a: { x: 0, y: 0, z: 0 },
          b: { x: 0, y: 0, z: 0 }
        }, from: 0, to: 0, sp: []
      };
      let lastNewci = newci;
      let curIsLeft = tsrd.pos[ci.from][dim2xyz(dim)] < pos;
      newci.from = ci.from;
      for (let index = ci.from + 1; index <= ci.to; index++) {
        const p = tsrd.pos[index][dim2xyz(dim)];
        let changed = false;
        if (p < pos) {
          if (!curIsLeft) {
            newci.to = index;
            resultRight.push(newci);
            lastNewci = newci;
            checkSpUnion(lastNewci, tsrd);
            updateAABB(lastNewci, tsrd.pos);
            newci = {
              aabb: {
                a: { x: 0, y: 0, z: 0 },
                b: { x: 0, y: 0, z: 0 }
              }, from: 0, to: 0, sp: []
            };
            newci.from = index - 1;
            curIsLeft = true;
            changed = true;
          }
        } else {
          if (curIsLeft) {
            newci.to = index;
            resultLeft.push(newci);
            lastNewci = newci;
            checkSpUnion(lastNewci, tsrd);
            updateAABB(lastNewci, tsrd.pos);
            newci = {
              aabb: {
                a: { x: 0, y: 0, z: 0 },
                b: { x: 0, y: 0, z: 0 }
              }, from: 0, to: 0, sp: []
            };;
            newci.from = index - 1;
            curIsLeft = false;
            changed = true;
          }
        }

        if (ci.sp.length > candidateIndex) {
          if (ci.sp[candidateIndex] < index) ++candidateIndex;
          if (ci.sp[candidateIndex] == index) {
            if (!changed) {
              let lc = newci.sp;
              newci.sp.push(index);
            } else {
              let lc = lastNewci.sp;
              lc.push(index);
            }
          }
        }
      }
      newci.to = ci.to;
      if (curIsLeft) {
        resultLeft.push(newci);
        updateAABB(newci, tsrd.pos);
      } else {
        resultRight.push(newci);
        updateAABB(newci, tsrd.pos);
      }
    }
  }
  return [resultLeft, resultRight];
}

function checkSpUnion(result: CurveInfo, tsrd: TSRD) {
  if (!result.sp || result.sp.length == 0) return;
  if (result.sp.length == 1) {
    if (canUnion(result.from, result.sp[0], result.to, tsrd)) {
      result.sp = [];
    }
  } else if (result.sp.length > 1) {
    let shiftFlag = false,
      popFlag = false;
    if (canUnion(result.from, result.sp[0], result.sp[1], tsrd)) {
      shiftFlag = true;
    }
    if (
      canUnion(
        result.sp[result.sp.length - 2],
        result.sp[result.sp.length - 1],
        result.to,
        tsrd
      )
    ) {
      popFlag = true;
    }
    if (shiftFlag) {
      result.sp.shift();
    }
    if (popFlag) {
      result.sp.pop();
    }
  }
}

function canUnion(ai: number, bi: number, ci: number, tsrd: TSRD) {
  const cosLimit = Math.cos((kdparam.deg / 180) * Math.PI);
  const a = tsrd.pos[ai];
  const b = tsrd.pos[bi];
  const c = tsrd.pos[ci];
  const dirAB = pointNormalize(pointSub(b, a));
  const dirBC = pointNormalize(pointSub(c, b));
  const cosValue = pointDot(dirAB, dirBC);
  return isNaN(cosValue) || cosValue >= cosLimit;
}

/**
 * traversal cost + backtrack cost
 * @param {*} l number of segments on the left
 * @param {*} r number of segments on the right
 * @param {*} n number of all segments
 * @param {*} p left volume / root volume
 * @param {*} x
 * @param {*} y
 * @param {*} factor
 * @returns
 */
function computeCost(l: number, r: number, n: number, p: number, x: number, y: number, factor?: number) {
  const leftRatio = n / (l + 1e-10);
  let leftV;
  if (leftRatio <= 1) {
    return Infinity;
  }
  leftV = Math.log(n) / Math.log(leftRatio);

  const rightRatio = n / (r + 1e-10);
  let rightV;
  if (rightRatio <= 1) {
    return Infinity;
  }

  if (p == 0 || p == 1) {
    return Infinity;
  }
  rightV = Math.log(n) / Math.log(rightRatio);

  // const wL = computeW(n, x / p, y / p);
  // const wR = computeW(n, x / (1 - p), y / (1 - p));
  const cost1 = p * l + (1 - p) * r; // traverssal cost - tranverse
  const cost2 = (leftV + rightV) * 0.5; // backtrack cost
  return cost1 + cost2 * kdparam.b;
}

// function computeW(n, x, y) {
//   const a = 53.20996717; // 2.04518789f;
//   const b = 55.29978444; // 2.73675685f;
//   const c = 197.2404396; // 23.68092824f;
//   const d = 1.06480181; // 7.8658251f;
//   // const float e = 0.02091861f;
//   const result = ((1 - a / (b + x)) * (1 - a / (b + y)) * c) / (n + d); // +e;
//   return Math.min(1, result);
// }

function connectNode(father: CCHInternalNode, node: CCHLeafNode | CCHInternalNode, isLeft: boolean) {
  if (isLeft) {
    father.left = node;
  } else {
    father.right = node;
  }
}

// function generateSeg(from, to, tsrd) {
//   let si;
//   const segID = segs.length;
// }


//#region helpers about prepare data
function initializeTSRD(lines: Point2D[][]): TSRD {
  const totalPoints = lines.reduce((p, v) => p + v.length, 0);
  const maxPoints = lines.reduce((p, v) => Math.max(p, v.length), 0);
  const lineIndexType = lines.length > 65535 ? Uint32Array : Uint16Array;
  const pointIndexType = totalPoints > 65535 ? Uint32Array : Uint16Array;
  const sizeType =
    maxPoints > 65535
      ? Uint32Array
      : maxPoints > 127
        ? Uint16Array
        : Uint8Array;
  // const tsrd: TSRD = {
  //   pos: new Array(totalPoints),
  //   cuv: new Float32Array(totalPoints),
  //   offsets: new pointIndexType(lines.length),
  //   sizes: new sizeType(lines.length),
  //   fastID: new lineIndexType(totalPoints),
  //   lineID: [],
  //   segIndex: [],
  // };
  let pointer = 0;
  const offsets = new pointIndexType(lines.length);
  const sizes = new sizeType(lines.length);
  const pos = new Array(totalPoints);
  const fastID = new lineIndexType(totalPoints);
  const cuv = new Float32Array(totalPoints);
  lines.forEach((line, i) => {
    offsets[i] = pointer;
    sizes[i] = line.length;
    line.forEach((point, j) => {
      pos[pointer] = { ...point, z: 0 };
      fastID[pointer] = i;
      if (j <= 0 || j >= line.length - 1) {
        cuv[pointer] = 0;
      } else {
        cuv[pointer] = computeCurvature(line[j - 1], point, line[j + 1]);
      }
      pointer++;
    });
  });
  return {
    pos: pos,
    cuv: cuv,
    offsets: offsets,
    sizes: sizes,
    fastID: fastID,
    lineID: [],
    segIndex: [],
  };;
}

/**
 * rdp, ignore the z dimension
 * @param tsrd 
 * @param precision 
 */
function rdp(tsrd: TSRD, precision: number): void {
  tsrd.sizes.forEach((size, i) => {
    const beginIndex = tsrd.offsets[i];
    const endIndex = size + beginIndex - 1;
    splitIntoSegmentsByMaximumDistance(
      beginIndex,
      endIndex,
      precision,
      i,
      tsrd
    );
  });
}

function computeSlope(tsrd: TSRD) {
  //#region 3.1 compute length of each line segment before rdp
  const length = new Float32Array(tsrd.pos.length); // length of each line segement before rdp.
  tsrd.sizes.forEach((size, i) => {
    const beginIndex = tsrd.offsets[i];
    const endIndex = size + beginIndex - 1;
    for (let j = beginIndex; j < endIndex; j++) {
      const distance = pointDist(tsrd.pos[j], tsrd.pos[j + 1]);
      length[j] = distance;
    }
    length[endIndex] = 0;
  });
  //#endregion

  //#region 3.2 compute slope
  tsrd.sizes.forEach((size, i) => {
    const beginIndex = tsrd.offsets[i];
    const endIndex = size + beginIndex - 1;
    // for (let j = beginIndex + 1; j < endIndex; j++) { // not calculate the first and the last
    for (let j = beginIndex; j < endIndex; j++) { // not calculate the first and the last
      // const avgLength = (length[j] + length[j - 1]) / 2;
      // weights[j] = tsrd.cuv[j] * avgLength;
      const right = pointSub(tsrd.pos[j + 1], tsrd.pos[j]);
      //const left = pointSub(tsrd.pos[j], tsrd.pos[j - 1]);
      // tsrd.pos[j].z =
      // // 左右斜率的加权平均
      //   (length[j] * (right.y / right.x) +
      //     length[j - 1] * (left.y / left.x)) /
      //   (length[j] + length[j - 1]);
      // if (j === beginIndex + 1) {
      //   tsrd.pos[beginIndex].z = left.y / left.x;
      // }
      // if (j === endIndex - 1) {
      tsrd.pos[j].z = right.y / right.x;
      // }
    }
    tsrd.pos[endIndex].z = Infinity;
  });
  //#endregion
}

function computeCurveInfos(tsrd: TSRD): CurveInfo[] {
  const allci: CurveInfo[] = [];
  let curSegIndex = 0;

  tsrd.sizes.forEach((size, i) => {
    const beginIndex = tsrd.offsets[i];
    const endIndex = size + beginIndex;
    const ci: CurveInfo = {
      aabb: { a: { x: 0, y: 0, z: 0 }, b: { x: 0, y: 0, z: 0 } }, // aabb
      from: beginIndex, // from point index
      to: endIndex - 1, // to point index
      sp: [], // split points
    };
    allci.push(ci);
    updateAABB(ci, tsrd.pos);
    let lastIndex = -1;
    while (curSegIndex < tsrd.segIndex.length) {
      const cs = tsrd.segIndex[curSegIndex];
      // if the segment is ahead of the current line, continue to find the first segment.
      if (tsrd.fastID[cs[0]] < i) {
        ++curSegIndex;
        continue;
      } else if (tsrd.fastID[cs[0]] > i) {
        // if the segment is behind the current line, stop.
        --curSegIndex;
        break;
      }
      if (lastIndex !== cs[0]) {
        ci.sp.push(cs[0]);
      }
      ci.sp.push(cs[1]);
      lastIndex = cs[1];
      ++curSegIndex;
    }
  });
  return allci;
}
//#endregion helpers about prepare data



function lefIndexInBox<Datum extends Point2D | Point3D = Point3D>(data: Datum[], key: keyof Datum, leftValue: Datum[keyof Datum], high = data.length - 1) {
  // const low = 0;
  // high = Math.min(high, data.length - 1);
  const low = 0;
  high = data.length - 1;
  if (high - low <= 0) return -1;
  const insertIndex = sortedIndex<Datum, keyof Datum>(data, key, leftValue, low, high);;
  return insertIndex;
}

function rightIndexInBox<Datum extends Point2D | Point3D = Point3D>(data: Datum[], key: keyof Datum, rightValue: Datum[keyof Datum], low = 0) {
  // low = Math.max(0, low);
  // const high = data.length - 1;
  low = 0;
  const high = data.length - 1;
  if (high - low <= 0) return -1;
  const insertIndex = sortedIndex<Datum, keyof Datum>(data, key, (rightValue as number + Number.MIN_VALUE) as Datum[keyof Datum], low, high);
  return insertIndex - 1;
  // if (insertIndex >= data.length) {
  //   return insertIndex - 1;
  // } else if (data[insertIndex][key] === rightValue) {
  //   for (let i = insertIndex; i < data.length; ++i) {
  //     if (data[insertIndex][key] > rightValue) {
  //       return i - 1;
  //     }
  //   }
  //   return data.length - 1;
  // }
  // return Math.max(0, insertIndex - 1);
}


/**
 * The base implementation of `sortedIndexBy` and `sortedLastIndexBy`
 * which invokes `iteratee` for `value` and each element of `array` to compute
 * their sort ranking. The iteratee is invoked with one argument (value).
 * 空时，返回0，
 * 否则，返回
 * @returns {number} Returns the index at which `value` should be inserted into `array`.
 */
function sortedIndex<O extends Object, K extends keyof O>(array: O[], key: K, targetValue: O[K], low: number, high: number): number {
  high++;
  // return sortedIndexBy<O>(array, {[key]: targetValue} as unknown as O, (o: any) => o[key]);
  if (high === low) {
    return 0
  }
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const computed = array[mid][key];
    if (computed < targetValue) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return high;
}


function computePercentageAndUpdateMinMax(minMaxMaps: Map<number, MinMaxSet>, lines: Point2D[][], lo: [number, number], hi: [number, number], offsets?: TSRD["offsets"] | null): Map<number, number> {
  const percentages = new Map<number, number>();
  console.time("fuzzy range2");
  for (const [lineID, pointIDSet] of minMaxMaps) {
    const line = lines[lineID];
    if (!line) continue;
    const l = lefIndexInBox(line, "x", lo[0], pointIDSet.min);
    const r = rightIndexInBox(line, "x", hi[0], pointIDSet.max);
    const offset = offsets ? offsets[lineID] : 0;
    pointIDSet.min = l + offset
    pointIDSet.max = r + offset;
    const totalNum = r - l + 1;
    if (totalNum <= 0) continue;
    const pointIDs = [...pointIDSet.set];
    const percentageScore = pointIDs.length / totalNum;
    percentages.set(lineID, percentageScore);
  }
  return percentages
}