import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";
import * as d3 from "d3";
import { getRandomColor } from "../../helpers/color";
import { LineLayerInfo } from "../layer";

type Props = {
    layerInfo: LineLayerInfo;
    screenWidth: number;
    screenHeight: number;
    width: number;
    height: number;
    data: { x: any, y: any }[][]
    xScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null;
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null;
    className?: string;
}

// const colorMap = ["aqua", "limegreen", "lightgreen"]
const LineLayer: React.FC<Props> = ({ layerInfo, width, height, screenWidth, screenHeight, data, xScale, yScale, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    console.log(layerInfo, width, height, screenWidth, screenHeight, data, xScale, yScale);
    useEffect(() => {
        if (xScale === null || yScale === null) return;
        console.log("scale");
        const canvasElem = canvasRef.current;
        if (canvasElem === null) return;
        console.log("canvas elem");
        const ctx = canvasElem.getContext("2d");
        if (ctx === null) return;
        console.log("ctx");

        if (data.length > 0) {
            console.log("hello", data[0].map(
                d => [xScale(d.x), yScale(d.y)]
            ));
        }

        ctx.clearRect(0, 0, width, height);
        const lines = data.map(line => line.map(point => [xScale(point.x), yScale(point.y)]))
        lines.forEach((line, i) => {
                ctx.strokeStyle = `rgb(${getRandomColor(layerInfo.colormap).join(",")})`;//colorMap[i % colorMap.length];
                if (line.length <= 0) return;
                ctx.beginPath();
                ctx.moveTo(line[0][0] as number, line[0][1] as number);
                line.forEach(point => {
                    ctx.lineTo(point[0] as number, point[1] as number);
                });
                ctx.stroke();
                // const result = lineGenerator(line)
                // console.log("generated line", result);
            });
    });
    return (<canvas id={layerInfo.id} className={className} width={width} height={height} style={{ width: screenWidth, height: screenHeight }} ref={canvasRef}></canvas>);
}

export default React.memo(LineLayer);