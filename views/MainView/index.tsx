import React, { useState, useRef, useMemo, useLayoutEffect, useEffect, useCallback } from "react";
import styles from "./index.module.scss";
import { drawAxes } from "../../helpers/chart";
import * as d3 from "d3";
import LineLayer from "../../components/LineLayer";
import dataStore from "../../stores/DataStore";
import canvasStore from "../../stores/CanvasStore";
import queryStore from "../../stores/QueryStore";
import QueryLayer, { InstrumentDidMount } from "../../components/QueryLayer";
import AxesLayer from "../../components/AxesLayer";
import { aggregateData } from "../../helpers/data";
import { observer } from "mobx-react";

const screenWidth = 1000;
const screenHeight = 500;
const screenMargin = { top: 50, right: 50, bottom: 70, left: 100 };
const containerStyle = {
  width: screenWidth + screenMargin.left + screenMargin.right,
  height: screenHeight + screenMargin.top + screenMargin.bottom
}
const layerStyle = {
  top: screenMargin.top,
  left: screenMargin.left,
  width: screenWidth,
  height: screenHeight
}

const MainView: React.FC<{}> = observer((props) => {
  console.log("mainview render");
  const uiContainerRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { width, height, timeAttrName, valueAttrName, timeScale: xScale, valueScale: yScale, aggregatedData2: aggregatedData } = dataStore;
  const { layerInfos } = canvasStore;
  const { queryMode } = queryStore;

  const instrumentDidMount = useCallback<InstrumentDidMount>((instrument, container) => {
    queryStore.instrument = instrument;
    queryStore.container = container;
  }, []);
  // const brushDomain = useAppSelector(selectBrushDomain);
  // const {instrument, container} = queryStore.instrument;


  // /* compute scale based on screen */
  // const { xScaleScreen, yScaleScreen } = useMemo(() => ({
  //   xScaleScreen: xScale === null ? null : (xScale.copy().domain(brushDomain) as any).range([0, layerStyle.width]),
  //   yScaleScreen: yScale === null ? null : yScale.copy().range([layerStyle.height, 0]),
  // }), [xScale, yScale])


  // /* Draw Axis */
  // useEffect(() => {
  //   if (xScaleScreen === null || yScaleScreen === null) return;
  //   if (svgRef.current === null) return;
  //   svgRef.current.innerHTML = "";
  //   drawAxes(
  //     svgRef.current,
  //     xScaleScreen as d3.AxisScale<d3.NumberValue>, yScaleScreen as unknown as  d3.AxisScale<d3.NumberValue>,
  //     screenWidth, screenHeight, screenMargin,
  //     { fieldX: timeAttrName, fieldY: valueAttrName, titleSize: "16px" }
  //   );
  // }, [xScaleScreen, yScaleScreen, timeAttrName, valueAttrName])


  /* ui controller */
  // useLayoutEffect(() => {
  //   const uiContainer = uiContainerRef.current;
  //   if (uiContainer === null) return;
  //   if (kdTree === null) return;
  //   const {setQueryMode, deleteQuerier, reRenderAll} = appendUIController(uiContainer, layerStyle.width, layerStyle.height, "timebox", 
  //     (queriers: QueryComponent[]) => {
  //       // console.warn("dispatch deleteQuerier.....", queriers);
  //       dispatch(setQueriers(queriers))
  //     });
  //   dispatch(setSetQueryMode(setQueryMode));
  //   dispatch(setDeleteQuerier(deleteQuerier));
  //   dispatch(setReRenderAll(reRenderAll));
  // }, [kdTree]);


  return (<div className={styles["container"]}
    id="container"
    style={containerStyle}>
    <div className={styles["layer"]}>
      <AxesLayer />
    </div>
    {/* <div className={styles["layers-container"]} style={{ position: "absolute", top: layerStyle.top, left: layerStyle.left }} ref={layersContainerRef}> */}
      {layerInfos.map(layerInfo => (
        layerInfo.id === "raw_line" ?
          // <></>
          (<LineLayer key={layerInfo.id} className={styles["layer"]} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={aggregatedData} xScale={xScale} yScale={yScale}/>)
          // : layerInfo.id === "raw_density" ?
            // (<DensityLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} kdTree={kdTree} />)
            // : layerInfo.id === "selected_line" ?
              // (<LineLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={intersectionResults} xScale={xScale?.copy().domain(brushDomain) as any} yScale={yScale} />)
              // :layerInfo.id==="selected_density" ?
              // (<DensityLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} kdTree={kdTree}/>)
              // : layerInfo.id==="rep_line"?
              // (<LineLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={intersectionResults} xScale={xScale} yScale={yScale}/>)
              : <></>
      ))}
    {/* </div> */}
    <div className={styles["layer"]}>
      <QueryLayer queryMode={queryMode} instrumentDidMount={instrumentDidMount} />
    </div>
  </div>)
})

export default React.memo(MainView);