import { memo, FC, useRef, useCallback } from 'react';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';
import { Button } from 'antd';


const QueryToolsPanel: FC<{}> = observer(() => {
  const uiContainerRef = useRef<HTMLCanvasElement>(null);
  const queryMode = queryStore.queryMode;
  const setTimeboxQueryMode = useCallback(() => {
    queryStore.setQueryMode("timebox");
  }, []);
  const setAngularQueryMode = useCallback(() => {
    queryStore.setQueryMode("angular");
  }, []);

  return (<div>
    <Button type={queryMode === "timebox" ? "primary" : "default"} onClick={setTimeboxQueryMode}>timebox</Button>
    <Button type={queryMode === "angular" ? "primary" : "default"} onClick={setAngularQueryMode}>angular</Button>
  </div>);
});

export default memo(QueryToolsPanel);