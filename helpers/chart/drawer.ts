import * as d3 from "d3"

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
  console.log(options);
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
}

export {};