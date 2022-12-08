import React, { useMemo, useCallback } from "react";
import styles from "./index.module.scss";
import LineLayer from "../../components/LineLayer";
import dataStore from "../../stores/DataStore";
import canvasStore from "../../stores/CanvasStore";
import queryStore from "../../stores/QueryStore";
import QueryLayer, { InstrumentDidMount } from "../../components/QueryLayer";
import AxesLayer from "../../components/AxesLayer";
import { observer } from "mobx-react";

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
  console.log("mainview render");

  const { width, height, timeAttrName, valueAttrName, timeScale: xScale, valueScale: yScale, aggregatedPlainData: aggregatedData } = dataStore;
  const { layerInfos } = canvasStore;
  const { queryMode } = queryStore;

  const uiControllerDidMount = useCallback<InstrumentDidMount>((controller) => {
    queryStore.uiController = controller;
  }, []);

    // console.log({xScale, yScale});
    // console.log({xScale: xScale?.domain(), yScale: yScale?.domain()});
    // console.log({xScale: xScale?.range(), yScale: yScale?.range()});
    // console.log({xScale: xScale?.copy, yScale: yScale?.copy});
   /* compute scale based on screen */
   const { xScaleScreen, yScaleScreen } = useMemo(() => ({
    xScaleScreen: xScale === null ? null : (xScale.copy().domain(xScale.domain()) as any).range([0, layerStyle.width]),
    yScaleScreen: yScale === null ? null : (yScale.copy().range([layerStyle.height, 0]) as any),
  }), [xScale, yScale])


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
    {
      dataStore.selectedDatasetName && dataStore.status === "idle"?
        <>
          <div className={styles["axis"]}>
            <AxesLayer data={aggregatedData} width={screenWidth} height={screenHeight} margin={screenMargin} xScale={xScaleScreen} yScale={yScaleScreen} fieldX={timeAttrName} fieldY={valueAttrName} />
          </div>
          {/* <div className={styles["layers-container"]} style={{ position: "absolute", top: layerStyle.top, left: layerStyle.left }} ref={layersContainerRef}> */}
          <div className={styles["canvas"]}>
          {layerInfos.map(layerInfo => (
            layerInfo.id === "raw_line" ?
              (<LineLayer key={layerInfo.id} className={styles["layer"]} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={aggregatedData} xScale={xScale} yScale={yScale}/>)
              // : layerInfo.id === "raw_density" ?
              // (<DensityLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} kdTree={kdTree} />)
              : layerInfo.id === "selected_line" ?
              (<LineLayer key={layerInfo.id} layerInfo={layerInfo} width={width} height={height} screenWidth={screenWidth} screenHeight={screenHeight} data={queryStore.results} xScale={xScale} yScale={yScale} />)
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
