import { memo, FC, useLayoutEffect, createRef, useRef, useEffect, useCallback } from 'react';
import { appendUIController } from '../../lib/ui-controller';
import { QueryComponent } from '../../lib/ui-controller/appendUIController';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';


const ControlPanel: FC<{}> = observer(() => {
  const uiContainerRef = useRef<HTMLCanvasElement>(null);
  const queryMode = queryStore.queryMode;
  const setTimeboxQueryMode = useCallback(() => {
    queryStore.setQueryMode("timebox");
  }, []);
  const setAngularQueryMode = useCallback(() => {
    queryStore.setQueryMode("angular");
  }, []);

  return (<div>
    <button onClick={setTimeboxQueryMode}>timebox</button>
    <button onClick={setAngularQueryMode}>angular</button>
  </div>);
});

export default memo(ControlPanel);