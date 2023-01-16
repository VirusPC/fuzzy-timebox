import React from "react";
import styles from "./index.module.scss";
import { Spin } from "antd";
import dataStore from "../../stores/DataStore";
import { observer } from "mobx-react-lite";


const SpinView: React.FC<{}> = observer(() => {
  const { isComputing } = dataStore;
  console.log("isComputing", isComputing);
  // const isComputing = true;
  return (
    <>
      {isComputing ? <div className={styles["spin-container"]}>
        <Spin size="large" tip="computing..." />
      </div> : <></>}
    </>
  );
});

export default React.memo(SpinView);
