import { memo, FC, useLayoutEffect, createRef, useRef, useEffect } from 'react';
import { appendUIController } from '../../helpers/ui-controller';
import { QueryComponent, QueryInstrumentState, QueryMode } from '../../helpers/ui-controller/appendUIController';
import { observer } from 'mobx-react';
import { Container, Instrument } from '../../lib/interaction';
// import queryStore from '../../stores/QueryStore';

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

export type InstrumentDidMount =  (instrument: Instrument<QueryInstrumentState>, container: Container) => void;

type QueryLayerProps = {
  queryMode: QueryMode;
  instrumentDidMount?: InstrumentDidMount;
}

const QueryLayer: FC<QueryLayerProps> = ({queryMode, instrumentDidMount}) => {
  const uiContainerRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const uiContainer = uiContainerRef.current;
      if (uiContainer === null) return;
      const {instrument, container, clearup } = appendUIController(uiContainer, layerStyle.width, layerStyle.height, queryMode);
      instrumentDidMount && instrumentDidMount(instrument, container);
      return clearup;
    }, []);

  return (<canvas ref={uiContainerRef}></canvas>);
};

export default memo(QueryLayer);