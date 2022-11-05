import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";

type AxesLayerProps = {
}

const AxesLayer: React.FC<AxesLayerProps> = ({  }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    return (<svg id="axis-container" className={styles["axes"]}  ref={svgRef}></svg>)
}

export default React.memo(AxesLayer);