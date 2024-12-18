import React, { useMemo, useCallback } from "react";
import styles from "./index.module.scss";
import LineLayer from "../../../components/LineLayer";
import dataStore from "../../../stores/DataStore";
import canvasStore from "../../../stores/CanvasStore";
import queryStore from "../../../stores/QueryStore";
import QueryLayer, { InstrumentDidMount } from "../../../components/QueryLayer";
import AxesLayer from "../../../components/AxesLayer";
import { observer } from "mobx-react";
import { ScreenData, ScreenPoint } from "../../../helpers/data";
import DensityLayer from "../../../components/DensityLayer";
import { CCHKDTree } from "../../../helpers/query";

export const screenWidth = 1000;
export const screenHeight = 500;
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
  const { width, height, timeAttrName, valueAttrName, timeScale: xScale, valueScale: yScale, aggregatedScreenData: screenData} = dataStore;
  const { layerInfos, linesColorScale } = canvasStore;
  const { queryMode, results } = queryStore;

  const uiControllerDidMount = useCallback<InstrumentDidMount>((controller) => {
    queryStore.uiController = controller;
  }, []);

   /* compute scale based on screen */
   const { xScaleScreen, yScaleScreen } = useMemo(() => ({
    xScaleScreen: xScale === null ? null : (xScale.copy().domain(xScale.domain()) as any).range([0, layerStyle.width]),
    yScaleScreen: yScale === null ? null : (yScale.copy().range([layerStyle.height, 0]) as any),
  }), [xScale, yScale])

  const resultData = useMemo(() => {
    const resultData: {[id: number]: ScreenPoint[]} = {};
    for(const id of results){
      resultData[id] = screenData[id];
    }
    return resultData;
  }, [screenData, results]);

  return (<div className={styles["container"]}
    id="container"
    style={containerStyle}>
    {
      dataStore.selectedDatasetName?
        <>
          <div className={styles["axis"]}>
            <AxesLayer width={screenWidth} height={screenHeight} margin={screenMargin} xScale={xScaleScreen} yScale={yScaleScreen} fieldX={timeAttrName} fieldY={valueAttrName} />
          </div>
          {/* <div className={styles["layers-container"]} style={{ position: "absolute", top: layerStyle.top, left: layerStyle.left }} ref={layersContainerRef}> */}
          <div className={styles["canvas"]}>
          {layerInfos.map(layerInfo => (
            layerInfo.id === "raw_line" ?
              <></>
              // (<LineLayer key={layerInfo.id} className={styles["layer"]} id={layerInfo.id} opacity={layerInfo.opacity} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={screenData}  colorScale={linesColorScale}/>)
              : layerInfo.id === "raw_density" ?
              (<DensityLayer key={layerInfo.id} id={layerInfo.id}  className={styles["layer"]} cchKdTree={dataStore.CCHKDTree instanceof CCHKDTree? dataStore.CCHKDTree : null} opacity={layerInfo.opacity} colorScale={layerInfo.colorScale} screenWidth={screenWidth} screenHeight={screenHeight}/>)
              : layerInfo.id === "selected_line" ?
              (<LineLayer key={layerInfo.id} id={layerInfo.id}  className={styles["layer"]} opacity={layerInfo.opacity} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={resultData} colorScale={linesColorScale} />)
              // :layerInfo.id==="selected_density" ?
              // (<DensityLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} kdTree={kdTree}/>)
              // : layerInfo.id==="rep_line"?
              // (<LineLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={intersectionResults} xScale={xScale} yScale={yScale}/>)
              : <></>
          ))}
        </div>
          {/* </div> */}
          <div className={styles["query"]}>
            <QueryLayer queryMode={queryMode} uiControllerDidMount={uiControllerDidMount} />
          </div>
        </> : <></>
    }
  </div>)
})

export default React.memo(MainView);
