import React from "react";
import styles from "./index.module.scss";
import { observer } from "mobx-react-lite";
import { style } from "d3";
import LineLayer from "../../components/LineLayer";

type ScoreViewProps = {
  title: string;
  score: number;

  id: string,
  className?: string;
  opacity: number,
  width: number;
  height: number;
  data: {[id: string]: { x: number, y: number}[]};
  colorScale: (id: number) => [number, number, number],
}

const ScoreView: React.FC<ScoreViewProps> = ({title, score, id, opacity, width, height, data, colorScale}) => {
  return <div className={styles["score-view"]} key={id}>
    <div className={styles["header"]}>
      <div className={styles["title"]}>{title}</div>
      <div className={styles["score"]}>{score}</div>
    </div>
    <div className={styles["line-div"]}>
       (<LineLayer id={id} opacity={opacity} width={width} height={height} screenWidth={width} screenHeight={height} data={data} colorScale={colorScale} />)
    </div>
  </div>
}


const ScoreViews: React.FC<{}> = observer(() => {
  // const { isComputing } = dataStore;
  // const isComputing = true;
  // const scores = [1, 1, 1];
  return (
    <div className={styles["main-container"]}>
    </div>
  );
});

export default React.memo(ScoreViews);
