import { memo, FC, useRef, useCallback } from 'react';
import { Input, InputNumber, Select, Slider, Typography } from 'antd';
import styles from "./index.module.scss"
import classNames from 'classnames';
import { DensityLayerInfo, LayerInfo } from '../../components/layer';
import { colorMap2Background } from '../../helpers/color';
import { toJS } from 'mobx';

const { Title } = Typography;
const { Option } = Select;

type LayerInfoControllerProps = {
  key?: string;
  className?: string;
  showColorMap?: boolean;
  layerInfo: LayerInfo;
}

const LayerInfoController: FC<LayerInfoControllerProps> = ({ key, className, layerInfo, showColorMap }) => {
  return (<div key={key} className={classNames(className, styles["layerInfoController"])}>
    <div className={styles["layer-header"]}>
    <span className= {classNames('iconfont icon-ketuozhuai', styles["drag-icon"])}></span>
    <div className={styles["sub-title"]}>
      {layerInfo.name}
    </div>
    </div>

    <div className={styles["layer-params"]}>
      <div className={styles["opacity"]}>
        <span className={classNames("iconfont", styles["eye-icon"], {"icon-005yanjing-1": layerInfo.opacity===0}, {"icon-005yanjing-4": layerInfo.opacity!==0})}></span>
        <Slider
          className={styles["opacity-slider"]}
          min={0}
          max={1}
          value={layerInfo.opacity}
        />
      </div>
      {(layerInfo as DensityLayerInfo).colormap ? <div className={styles["colormap-controller"]}>
        {/* <span className={styles["min-text"]}>1</span> */}
        <InputNumber
          className={styles["small-input1"]}
          value={1}
          disabled
        />
        <div className={styles["colormap-container"]}>
          <span className={styles["color-map"]} id="color-map-overlay" style={{ background: colorMap2Background(toJS((layerInfo as DensityLayerInfo).colormap.value)) }}></span>
          <Select
            id="colormap-select"
            className={styles["colormap-select"]}
            placeholder="Choose colormap"
          // style={{
          //   background: colorMap2Background(toJS((layerInfo as DensityLayerInfo).colormap.value))
          // }}
          // style={}
          >
            <Option value="0">viridis</Option>
            <Option value="1" selected>magma</Option>
            <Option value="2">inferno</Option>
            <Option value="3">plasma</Option>
            <Option value="4">cividis</Option>
            <Option value="5">turbo</Option>
            <Option value="6">bluegreen</Option>
            <Option value="7">bluepurple</Option>
            <Option value="8">goldgreen</Option>
            <Option value="9">goldorange</Option>
            <Option value="10">goldred</Option>
            <Option value="11">greenblue</Option>
            <Option value="12">orangered</Option>
            <Option value="13">purplebluegreen</Option>
            <Option value="14">purpleblue</Option>
            <Option value="15">purplered</Option>
            <Option value="16">redpurple</Option>
            <Option value="17">yellowgreenblue</Option>
            <Option value="18">yellowgreen</Option>
            <Option value="19">yelloworangebrown</Option>
            <Option value="20">yelloworangered</Option>
          </Select>
        </div>
        <InputNumber
          min={0}
          max={1}
          className={styles["small-input2"]}
          value={199}
        />
      </div> : null}

    </div>

  </div >);
};

export default memo(LayerInfoController);