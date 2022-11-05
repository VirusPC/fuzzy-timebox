import React, { useState, useCallback } from "react";
import styles from "./index.module.scss";
import { Space, Typography, Select, Input, Button } from "antd";
import dataStore from "../../stores/DataStore";
import { observer } from 'mobx-react';

const { Title, Text } = Typography;
const { Option } = Select;

// type Props = {
//   handleDatasetChange: (url: string) => void;
// }

const DataConsole: React.FC<{}> = observer(() => {
  const {width: _width, height: _height, datasetConfig, headers, aggregationAttrPos, timeAttrPos, valueAttrPos} = dataStore;

  const [width, setWidth] = useState(_width);
  const [height, setHeight] = useState(_height);

  const onDataSelectChanged = useCallback((name: string) => dataStore.selectedDatasetName = name, []);
  const onAggregationAttrChanged = useCallback((pos: string) => dataStore.aggregationAttrPos = +pos, []);
  const onTimeAttrChanged = useCallback((pos: string) => dataStore.timeAttrPos = +pos, []);
  const onValueAttrChanged = useCallback((pos: string) => dataStore.valueAttrPos= +pos, []);
  const onResolutionWidthChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dataStore.width = +event.target.value, []);
  const onResolutionHeightChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dataStore.height = +event.target.value, []);


  return (<div className={styles["console"]}>
    <div className={styles["param-block"]}>
      {/* <Text strong={true} className={styles["title"]}>Dataset:</Text> */}
      <Title level={5} className={styles["title"]}>Dataset:</Title>
      <Select className={styles["select"]} defaultValue={"Select Dataset"} onChange={onDataSelectChanged}>
        {datasetConfig.map((config) => (<Option key={config.name} value={config.name}>{`${config.name}(${config.size})`}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Aggregation Attribute:</Title>
      <Select className={styles["select"]} defaultValue={"Select Dataset"} value={aggregationAttrPos < 0 ? void 0 : headers[aggregationAttrPos]} onChange={ onAggregationAttrChanged}>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Time Attribute:</Title>
      <Select className={styles["select"]} defaultValue={"Select Dataset"} value={timeAttrPos < 0? void 0 : headers[timeAttrPos]} onChange={ onTimeAttrChanged }>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Value Attribute:</Title>
      <Select className={styles["select"]} defaultValue={"Select Dataset"} value={valueAttrPos < 0? void 0 : headers[valueAttrPos]} onChange={ onValueAttrChanged }>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      {/* <Text strong={true} className={styles["title"]}>Initial Resolution:</Text> */}
      <Title level={5} className={styles["title"]}>Resolution:</Title>
      <Space size={"small"}>
        <div className={styles["resolution-input"]}>
          <Input type="number" className={styles["resolution-input"]} onChange={onResolutionWidthChanged} value={width}></Input>
        </div>
        x
        <div className={styles["resolution-input"]}>
          <Input type="number" className={styles["resolution-input"]} onChange={onResolutionHeightChanged} value={height}></Input>
        </div>
      </Space>
    </div>
    <div className={styles["submit-block"]}>
      <Button className={styles["apply"]} type={"primary"} onClick={(event) => {dataStore.apply()}}>Apply</Button>
    </div>
  </div>)
})

export default React.memo(DataConsole);
