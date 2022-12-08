import React, { useState, useCallback, useRef } from "react";
import styles from "./index.module.scss";
import { Space, Typography, Select, Input, Button } from "antd";
import dataStore from "../../stores/DataStore";
import { observer } from 'mobx-react';
import axios from "axios";
import Papa from "papaparse";
import { inferAttr } from "../../helpers/data";
import { autorun } from "mobx";

const { Title } = Typography;
const { Option } = Select;

const DataConsole: React.FC<{}> = observer(() => {
  const {width: _width, height: _height, selectedDatasetName: _selectedDatasetName, datasetConfig, headers: _headers, aggregationAttrPos: _aggregationAttrPos, timeAttrPos: _timeAttrPos, valueAttrPos: _valueAttrPos} = dataStore;

  const [datasetName, setDatasetName] = useState(_selectedDatasetName);
  const [aggregationAttrPos, setAggregationAttrPos] = useState(_aggregationAttrPos);
  const [timeAttrPos, setTimeAttrPos] = useState(_timeAttrPos);
  const [valueAttrPos, setValueAttrPos] = useState(_valueAttrPos);
  const [width, setWidth] = useState(_width);
  const [height, setHeight] = useState(_height);

  // use ref rather than state to optimize
  const headersRef = useRef<string[]>();
  const rawDataRef = useRef<RawData>();
  const headers = headersRef.current || [];
  const rawData = rawDataRef.current || [];

  // const [isLoading, setIsLoading] = useState(false);
  const onDataSelectChanged = useCallback((name: string) => {
    const url = datasetConfig.find(c => c.name === name)?.url;
    if(!url) return;
    dataStore.status = "loading";
    axios.get(url).then((response) => {
      const rawData = Papa.parse(response.data, { skipEmptyLines: true }).data as RawData;
      headersRef.current = rawData[0];
      rawDataRef.current = rawData.slice(1);
      const { aggregationAttr, timeAttr, valueAttr } = inferAttr(rawData);
      setAggregationAttrPos(aggregationAttr);
      setTimeAttrPos(timeAttr);
      setValueAttrPos(valueAttr);
      dataStore.status = "idle";
    }, () => {
      dataStore.status = "failed";
    });
    setDatasetName(name);
  }, []);

  const onAggregationAttrChanged = useCallback((pos: string) => setAggregationAttrPos(+pos), []);
  const onTimeAttrChanged = useCallback((pos: string) => setTimeAttrPos(+pos), []);
  const onValueAttrChanged = useCallback((pos: string) => setValueAttrPos(+pos), []);
  const onResolutionWidthChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setWidth(+event.target.value), []);
  const onResolutionHeightChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setHeight(+event.target.value), []);

  const onApply = useCallback(() => {
    autorun(() => {
      dataStore.selectedDatasetName = datasetName;
      dataStore.aggregationAttrPos = aggregationAttrPos;
      dataStore.timeAttrPos = timeAttrPos;
      dataStore.valueAttrPos = valueAttrPos;
      dataStore.width = width;
      dataStore.height = height;

      dataStore.headers = headers;
      dataStore.rawData = rawData;
      dataStore.apply();
    });
  }, [datasetName, aggregationAttrPos, timeAttrPos, valueAttrPos, width, height]);


  return (<div className={styles["console"]}>
    <div className={styles["param-block"]}>
      {/* <Text strong={true} className={styles["title"]}>Dataset:</Text> */}
      <Title level={5} className={styles["title"]}>Dataset:</Title>
      <Select className={styles["select"]} value={datasetName||"Select Dataset"} defaultValue={"Select Dataset"} onChange={onDataSelectChanged}>
        {datasetConfig.map((config) => (<Option key={config.name} value={config.name}>{`${config.name}(${config.size})`}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Aggregation Attribute:</Title>
      <Select className={styles["select"]} disabled={!datasetName || dataStore.status !== "idle"} defaultValue={"Select Dataset"} value={aggregationAttrPos < 0 ? void 0 : headers[aggregationAttrPos]} onChange={ onAggregationAttrChanged}>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Time Attribute:</Title>
      <Select className={styles["select"]} disabled={!datasetName || dataStore.status !== "idle"} defaultValue={"Select Dataset"} value={timeAttrPos < 0? void 0 : headers[timeAttrPos]} onChange={ onTimeAttrChanged }>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      <Title level={5} className={styles["title"]}>Value Attribute:</Title>
      <Select className={styles["select"]} disabled={!datasetName || dataStore.status !== "idle"} defaultValue={"Select Dataset"} value={valueAttrPos < 0? void 0 : headers[valueAttrPos]} onChange={ onValueAttrChanged }>
        {headers.map((attr, i) => (<Option key={attr} value={i}>{attr}</Option>))}
      </Select>
    </div>
    <div className={styles["param-block"]}>
      {/* <Text strong={true} className={styles["title"]}>Initial Resolution:</Text> */}
      <Title level={5} className={styles["title"]}>Resolution:</Title>
      <Space size={"small"}>
        <div className={styles["resolution-input"]}>
          <Input type="number" className={styles["resolution-input"]} disabled={!datasetName || dataStore.status !== "idle"} onChange={onResolutionWidthChanged} value={width}></Input>
        </div>
        x
        <div className={styles["resolution-input"]}>
          <Input type="number" className={styles["resolution-input"]} disabled={!datasetName || dataStore.status !== "idle"} onChange={onResolutionHeightChanged} value={height}></Input>
        </div>
      </Space>
    </div>
    <div className={styles["submit-block"]}>
      <Button className={styles["apply"]} disabled={!datasetName || dataStore.status !== "idle"} type={"primary"} onClick={onApply}>Apply</Button>
    </div>
  </div>)
})

export default React.memo(DataConsole);
