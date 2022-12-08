import { memo, FC, useRef, useEffect } from 'react';
import { UIController } from '../../helpers/ui-controller';
import { QueryMode } from '../../helpers/ui-controller';

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

export type InstrumentDidMount =  (controller: UIController) => void;

type QueryLayerProps = {
  queryMode: QueryMode;
  uiControllerDidMount?: InstrumentDidMount;
}

const QueryLayer: FC<QueryLayerProps> = ({queryMode, uiControllerDidMount}) => {
  const uiContainerRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const uiContainer = uiContainerRef.current;
      if (uiContainer === null) return;
      const controller = new UIController(uiContainer, layerStyle.width, layerStyle.height, queryMode);
      uiControllerDidMount && uiControllerDidMount(controller);
      return () => controller.clearup();
    }, []);

  return (<canvas ref={uiContainerRef}></canvas>);
};

export default memo(QueryLayer);