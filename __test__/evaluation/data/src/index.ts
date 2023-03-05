import * as  d3 from "d3";
import myData from "../data/100-1000.json"


const main = d3.select("main");
console.log(main.node());
const svg = d3.select("main").append("svg");
svg.attr("width", 1000).attr("height", 1000).attr("viewBox", "0 0 1000 1000");
const g = svg.append("g");

const data = (myData as { x: number, y: number }[][]).filter((d, i) => i===0);
// const data = (myData as { x: number, y: number }[][]).map(d => d.map(dd => [dd.x, dd.y]));


// .x((d) => x(d.date))
// .y((d) => scaleY(d.k));
const scaleX = d3.scaleLinear().domain([0, 100]).range([0, 1000]);
const scaleY = d3.scaleLinear().domain([0, 100]).range([0, 1000]);
const line = d3
  .line<{ x: number, y: number }>()
  .x(d => scaleX(d.x))
  .y(d => scaleY(d.y))

// g.append("g")
//   .call(d3.axisLeft(scaleY))
//   .call((g) =>
//     g
//       .selectAll(".tick line")
//       .clone()
//       .attr("stroke-opacity", 0.1)
//       .attr("x2", globalThis.WIDTH)
//   );

g.append("g")
  .style("font", "bold 10px sans-serif")
  .selectAll("g")
  .data(data)
  .join("g")
  .attr("stroke", (d) => "black")
  .attr("stroke-width", 0.1)
  // .datum((d) => d[1])
  .append("path")
  .attr("fill", "none")
  .attr("stroke-width", 1.5)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("d", line);
