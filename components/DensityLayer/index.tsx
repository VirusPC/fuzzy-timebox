import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LineLayerInfo } from "../layer";
import { drawLines } from "../../helpers/chart/drawer";
import { CCHKDTree } from "../../helpers/query";

type Props = {
    // layerInfo: LineLayerInfo;
    id: string,
    cchKdTree: CCHKDTree|null,
    opacity: number,
    screenWidth: number;
    screenHeight: number;
    // width: number;
    // height: number;
    // data: {[id: string]: { x: number, y: number}[]};
    colorScale: (id: number) => [number, number, number],
    className?: string;
}

// const DensityLayer: React.FC<Props> = ({ id, opacity, width, height, screenWidth, screenHeight, data, colorScale, className }) => {
const DensityLayer: React.FC<Props> = ({ id, className, opacity,  cchKdTree, colorScale, screenWidth, screenHeight}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // if (xScale === null || yScale === null) return;
        const canvasElem = canvasRef.current;
        if (canvasElem === null) return;
        canvasElem.width = screenWidth;
        canvasElem.height= screenHeight;
        cchKdTree?.render(canvasElem, colorScale);
    });

    return (<canvas id={id} className={className} style={{ opacity: opacity, width: screenWidth, height: screenHeight }} ref={canvasRef}></canvas>);
}

export default React.memo(DensityLayer);