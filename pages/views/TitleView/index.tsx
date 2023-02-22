import React  from "react";
import styles from "./index.module.scss";
import {  Typography } from "antd";

const { Title } = Typography;

const TitleView: React.FC<{}> = () => {
  return (<div>
    <Title level={2} className={styles["title"]}>
      Fuzzy Timebox
    </Title>
  </div>);
}

export default React.memo(TitleView);
