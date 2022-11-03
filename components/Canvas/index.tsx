import { memo, FC, useLayoutEffect, createRef, useRef, useEffect } from 'react';
import { appendUIController } from '../../lib/ui-controller';
import { QueryComponent } from '../../lib/ui-controller/appendUIController';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';

const screenWidth = 1000;
const screenHeight = 500;
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


const Canvas: FC<{}> = observer(() => {
  const uiContainerRef = useRef<HTMLCanvasElement>(null);
    const queryMode = queryStore.queryMode;
    useLayoutEffect(() => {
      const uiContainer = uiContainerRef.current;
      if (uiContainer === null) return;
      // if (kdTree === null) return;
      const {setQueryMode, instrument, container } = appendUIController(uiContainer, layerStyle.width, layerStyle.height, queryMode, 
        (queriers: QueryComponent[]) => {
          console.log(queriers);
          // console.warn("dispatch deleteQuerier.....", queriers);
          // dispatch(setQueriers(queriers))
        });
      queryStore.instrument = instrument;
      queryStore.container = container;
      // dispatch(setSetQueryMode(setQueryMode));
      // dispatch(setDeleteQuerier(deleteQuerier));
      // dispatch(setReRenderAll(reRenderAll));
    }, []);

  return (<canvas ref={uiContainerRef}></canvas>);
});

export default memo(Canvas);