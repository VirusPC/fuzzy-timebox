import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LineLayerInfo } from "../layer";
import { drawLines } from "../../helpers/chart/drawer";

type Props = {
    // layerInfo: LineLayerInfo;
    id: string,
    opacity: number,
    screenWidth: number;
    screenHeight: number;
    width: number;
    height: number;
    data: {[id: string]: { x: number, y: number}[]};
    colorScale: (id: number) => [number, number, number],
    className?: string;
}

const LineLayer: React.FC<Props> = ({ id, opacity, width, height, screenWidth, screenHeight, data, colorScale, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // if (xScale === null || yScale === null) return;
        const canvasElem = canvasRef.current;
        if (canvasElem === null) return;
        const ctx = canvasElem.getContext("2d");
        if (ctx === null) return;
        drawLines(ctx, width, height, data, colorScale, opacity);
    });

    return (<canvas id={id} className={className} width={width} height={height} style={{ width: screenWidth, height: screenHeight }} ref={canvasRef}></canvas>);
}

export default React.memo(LineLayer);