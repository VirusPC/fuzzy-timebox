import React, { useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
// import { observer } from "mobx-react-lite";
// import { style } from "d3";
import LineLayer from "../../../components/LineLayer";
import { Select, Typography, Slider, Switch, Row, Col, InputNumber } from "antd";
import classNames from "classnames";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import canvasStore from "../../../stores/CanvasStore";
import { LayerInfo } from "../../../components/layer";
import LayerInfoController from "./LayerInfoController";
// import { ScreenPoint } from "../../helpers/data";
// import queryStore from "../../stores/QueryStore";
// import dataStore from "../../stores/DataStore";
// import canvasStore from "../../stores/CanvasStore";
// import { Select } from "antd";

const { Title } = Typography;
const { Option } = Select;

type ControlPanelProps = {
  // title: string;
  // score: number;

  // id: string,
  // className?: string;
  // // opacity: number,
  // width: number;
  // height: number;
  // data: { [id: string]: { x: number, y: number }[] };
  // colorScale: (id: number) => [number, number, number],
}

const ControlPanel: React.FC<ControlPanelProps> = ({ }) => {
  /* representative lines parameters */
  const [lineCount, setLineCount] = useState(3);
  const [diverse, setDiverse] = useState(0.1);
  const [distanceWeight, setDistanceWeight] = useState(1);
  const [widthWeight, setWidthWeight] = useState(1);
  const { layerInfos, linesColorScale } = canvasStore;

  //   // a little function to help us with reordering the result
  // const reorderLayerInfos =  useCallback((list: LayerInfo[], startIndex: number, endIndex: number) => {
  //   const result = Array.from(list);
  //   const [removed] = result.splice(startIndex, 1);
  //   result.splice(endIndex, 0, removed);
  //   return result;
  // }, []);

  // const grid = 8;
  // const getItemStyle = (isDragging: boolean, draggableStyle: any) => {
  //   return {
  //   // some basic styles to make the items look a bit nicer
  //   userSelect: "none",
  //   padding: grid * 2,
  //   margin: `0 0 ${grid}px 0`,

  //   // change background colour if dragging
  //   background: isDragging ? "lightgreen" : "grey",

  //   // styles we need to apply on draggables
  //   ...draggableStyle
  // } as unknown  as React.CSSProperties
  // };

  // const getListStyle = useCallback((isDraggingOver: boolean) => ({
  //   background: isDraggingOver ? "lightblue" : "lightgrey",
  //   padding: grid,
  //   width: 300
  // }), []);

  // const onChange = useCallback((value: number | null) => {
  //   if (value === null || isNaN(value)) {
  //     return;
  //   }
  //   console.log(value);
  //   setInputValue(value);
  // }, []);
  return <div className={styles["control-panel"]}>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Representative Line Parameters:</Title>
      <div className={classNames(styles["sub-param-block"], styles["full-width"])}>
        <div className={styles["sub-title"]}>
          line count:
        </div>
        <div className={styles["slider-number-input"]}>
          <Slider
            className={styles["slider"]}
            min={1}
            max={20}
            // onChange={onChange}
            // value={typeof inputValue === 'number' ? inputValue : 0}
            value={lineCount}
          />
          <InputNumber
            min={1}
            max={20}
            className={styles["small-input2"]}
            value={lineCount}
          // onChange={onChange}
          />
        </div>

      </div>
      <div className={classNames(styles["sub-param-block"], styles["full-width"])}>
        <div className={styles["sub-title"]}>
          diverse:
        </div>
        <div className={styles["slider-number-input"]}>
          <Slider
            className={styles["slider"]}
            min={0}
            max={1}
            value={diverse}
          />
          <InputNumber
            min={0}
            max={1}
            className={styles["small-input2"]}
            value={diverse}
          />
        </div>
      </div>
      <div className={classNames(styles["sub-param-block"], styles["full-width"])}>
        <div className={styles["sub-title"]}>
          distance weight:
        </div>
        <div className={styles["slider-number-input"]}>
          <Slider
            className={styles["slider"]}
            min={0}
            max={1}
            value={distanceWeight}
          />
          <InputNumber
            min={0}
            max={1}
            className={styles["small-input2"]}
            value={distanceWeight}
          />
        </div>
      </div>
      <div className={classNames(styles["sub-param-block"], styles["full-width"])}>
        <div className={styles["sub-title"]}>
          width weight:
        </div>
        <div className={styles["slider-number-input"]}>
          <Slider
            className={styles["slider"]}
            min={0}
            max={1}
            value={widthWeight}
          />
          <InputNumber
            min={0}
            max={1}
            className={styles["small-input2"]}
            value={widthWeight}
          />
        </div>
      </div>
      {/* <div className={styles["param-block"]}>
        <Slider defaultValue={3}/>
      </div> */}
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Layers:</Title>
      <div className={styles["layer-list"]}>
        {layerInfos.map((layerInfo) => {
          return <LayerInfoController key={layerInfo.id} layerInfo={layerInfo} />
        })}
      </div>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Show Value of Cursor:</Title>
      <Switch size="default" checked={true} />
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Reverse y-axis:</Title>
      <Switch size="default" checked={false} />
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Normalize density:</Title>
      <Switch size="default" checked={true} />
    </div>
    {/* <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Enlarge Axis Font Size:</Title>
      <Switch size="default" checked={false} />
    </div> */}
  </div>
}




export default React.memo(ControlPanel);

