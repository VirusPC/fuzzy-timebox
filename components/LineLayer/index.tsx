import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";
import * as d3 from "d3";
import { getRandomColor } from "../../helpers/color";
import { LineLayerInfo } from "../layer";
import { drawLines } from "../../helpers/chart/drawer";

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

const LineLayer: React.FC<Props> = ({ layerInfo, width, height, screenWidth, screenHeight, data, xScale, yScale, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (xScale === null || yScale === null) return;
        const canvasElem = canvasRef.current;
        if (canvasElem === null) return;
        const ctx = canvasElem.getContext("2d");
        if (ctx === null) return;
        const clearup = drawLines(ctx, width, height, data, xScale, yScale, layerInfo.colormap);
        return clearup;
    });
    return (<canvas id={layerInfo.id} className={className} width={width} height={height} style={{ width: screenWidth, height: screenHeight }} ref={canvasRef}></canvas>);
}

export default React.memo(LineLayer);