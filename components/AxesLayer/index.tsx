import React, { useEffect, useRef } from "react";
import { drawAxes } from "../../helpers/chart";
import styles from "./index.module.scss";

type AxesLayerProps = {
    width: number;
    height: number;
    margin: {
        top: number,
        right: number,
        bottom: number,
        left: number
    },
    data: { x: any, y: any }[][]
    xScale: d3.ScaleTime<Date, number> | d3.ScaleLinear<number, number> | null;
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null;
    className?: string;
    fieldX: string,
    fieldY: string,
    titleSize?: number | string
}

const AxesLayer: React.FC<AxesLayerProps> = ({ width, height, margin, xScale, yScale, fieldX, fieldY, titleSize = "16px" }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        console.log("xScale", xScale?.domain(), xScale?.range());
        console.log("yScale", yScale?.domain(), yScale?.range());
        const clearup = drawAxes(svg,
            xScale as d3.AxisScale<d3.NumberValue>, yScale as unknown as d3.AxisScale<d3.NumberValue>,
            width, height, margin, { fieldX, fieldY, titleSize });
        return clearup;
    }, []);
    return (<svg id="axis-container" className={styles["axes"]} width={width + margin.left + margin.right} height={height + margin.left + margin.right} ref={svgRef}></svg>)
}

export default React.memo(AxesLayer);