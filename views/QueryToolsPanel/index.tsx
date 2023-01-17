import { memo, FC, useRef, useCallback } from 'react';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';
import { Button } from 'antd';
import dataStore from '../../stores/DataStore';
import styles from "./index.module.scss"


const QueryToolsPanel: FC<{}> = observer(() => {
  const queryMode = queryStore.queryMode;
  const setTimeboxQueryMode = useCallback(() => {
    queryStore.setQueryMode("timebox");
  }, []);
  const setAngularQueryMode = useCallback(() => {
    queryStore.setQueryMode("angular");
  }, []);

  return (<div className={styles["queryTools"]}>
    <Button className={styles["button"]} disabled={!dataStore.selectedDatasetName } type={queryMode === "timebox" ? "primary" : "default"} onClick={setTimeboxQueryMode}>timebox</Button>
    <Button className={styles["button"]} disabled={!dataStore.selectedDatasetName } type={queryMode === "angular" ? "primary" : "default"} onClick={setAngularQueryMode}>angular</Button>
    <Button className={styles["button"]} disabled={ true } type={queryMode === "sketch" ? "primary" : "default"} >sketch</Button>
  </div>);
});

export default memo(QueryToolsPanel);