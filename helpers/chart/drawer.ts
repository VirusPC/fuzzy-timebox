import * as d3 from "d3"
// import { Colormap, getRandomColor } from "../color";

export function drawLines(ctx: CanvasRenderingContext2D, width: number, height: number,
  data: {[id: number]: { x: number, y: number}[]},
  // xScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number>,
  // yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
  // colormap: Colormap,
  colorScale: (id: number) => [number, number, number],
  opacity: number = 1
) {
  ctx.clearRect(0, 0, width, height);
  // let notLineNum = 0;


  // const lines = data.map((line, i) => {
  //   if(!line) {
  //     notLineNum ++;
  //     return [];
  //   }
  //   return line.map(point => [xScale(point.x), yScale(point.y)])
  // });
  // if(notLineNum) {
  //   console.log("!line num", notLineNum, data.length);
  // }
  Object.keys(data).forEach((i) => {
    const line = data[+i];
    ctx.strokeStyle = `rgba(${[...colorScale(+i), opacity].join(",")})`;//colorMap[i % colorMap.length];
    if (line.length <= 0) return;
    ctx.beginPath();
    // ctx.moveTo(xScale(line[0].x) as number, yScale(line[0].y) as number);
    ctx.moveTo(line[0].x, line[0].y);
    line.forEach(point => {
      // ctx.lineTo(xScale(point.x) as number, yScale(point.y) as number);
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  });
  const clearup = () => ctx.clearRect(0, 0, width, height);
  return clearup;
}

export function drawAxes(
  root: SVGSVGElement,
  xScale: d3.AxisScale<d3.NumberValue>,//d3.ScaleLinear<number, number, never> | d3.ScaleTime<Date, number, never>,
  yScale: d3.AxisScale<d3.NumberValue>,//d3.ScaleLinear<number, number, never> | d3.ScaleBand<string>,
  width: number,
  height: number,
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number
  },
  options: {
    fieldX?: string,
    fieldY?: string,
    titleSize?: number | string
  }
) {
  const defaultTitleSize = "12px";
  const container = d3.select(root);
  const xAxis = d3.axisBottom(xScale as d3.ScaleLinear<number, number, never>);
  const yAxis = d3.axisLeft(yScale as d3.ScaleLinear<number, number, never>);
  const xGroup = container.append("g").attr("transform", `translate(${margin.left}, ${margin.top + height})`)
  const yGroup = container.append("g").attr("transform", `translate(${margin.left - 1}, ${margin.top})`)
  xGroup.call(xAxis)
  if (options.fieldX !== void 0) {
    xGroup
      .append("text")
      .text(options.fieldX)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", options.titleSize ?? defaultTitleSize)
      .attr("font-weight", "bold")
      .attr("x", width / 2)
      .attr("y", 32);
  }
  yGroup.call(yAxis)
  if (options.fieldY !== void 0) {
    yGroup.append("g")
      .attr(
        "transform",
        `translate(${-margin.left / 2 - 10}, ${height / 2})`
      )
      .append("text")
      .text(options.fieldY)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", options.titleSize ?? defaultTitleSize)
      .attr("font-weight", "bold")
      .style("writing-mode", "tb")
      .attr("transform", "rotate(180)");
  }
  const clearup = () => {
    container.selectAll("*").remove();
  };
  return clearup;
}

export { };