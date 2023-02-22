import React, { useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { observer } from "mobx-react-lite";
import { style } from "d3";
import LineLayer from "../../../components/LineLayer";
import { ScreenPoint } from "../../../helpers/data";
import queryStore from "../../../stores/QueryStore";
import dataStore from "../../../stores/DataStore";
import canvasStore from "../../../stores/CanvasStore";
import { Select } from "antd";

type ScoreViewProps = {
  title: string;
  score: number;

  id: string,
  className?: string;
  // opacity: number,
  width: number;
  height: number;
  data: { [id: string]: { x: number, y: number }[] };
  colorScale: (id: number) => [number, number, number],
}

const ScoreView: React.FC<ScoreViewProps> = ({ title, score, id, data, width, height, colorScale }) => {
  const opacity = 1;
  return <div className={styles["score-view"]} key={id}>
    <div className={styles["header"]}>
      <div className={styles["title"]}>{title}</div>
      <div className={styles["score"]}>{score.toFixed(2)}</div>
    </div>
    <div className={styles["line-div"]}>
      <LineLayer id={id} opacity={opacity} width={width} height={height} screenWidth={width} screenHeight={height} data={data} colorScale={colorScale} />
    </div>
  </div>
}


const ScoreViews: React.FC<{}> = observer(() => {
  // const { isComputing } = dataStore;
  // const isComputing = true;
  // const scores = [1, 1, 1];
  const { scores } = queryStore;
  const { width, height, aggregatedScreenData: screenData, aggregatedData } = dataStore;
  const { linesColorScale } = canvasStore;
  const scoreWidth = 172;
  const scoreHeight = 86;
  const options = [{
    value: 'ascending',
    label: 'Ascending'
  }, {
    value: 'descending',
    label: 'Descending'
  }];

  const [sortOption, setSortOption] = useState<"ascending" | "descending">("ascending");

  const resultDatas = useMemo(() => {
    const resultDatas: { 
      id: number,
      name: string,
      score: number,
      data: ScreenPoint[] }[] = [];
    const lines = Object.keys(scores);
    for (const id of lines) {
      const resultData = {
        id: +id,
        name: aggregatedData ? aggregatedData[+id].groupby: id,
        score: scores[+id],
        data: screenData[id].map(point => ({
          x: point.x / width * scoreWidth,
          y: point.y / height * scoreHeight
        })),
      }
      // console.log(resultData.name);
      // console.log(id, aggregatedData??[+id], 1);
      resultDatas.push(resultData);
    }
    return resultDatas;
  }, [scores]);
  const sortedDatas = useMemo(() => {
    const sortFunc = sortOption === "ascending"
    ? (a:any, b:any) => b.score - a.score
    : (a:any, b:any) => a.score - b.score;
    return resultDatas.sort(sortFunc);
  }, [resultDatas, sortOption]);

  const changeSortOption = useCallback<(value: "ascending" | "descending") =>  void>((value) => {
    setSortOption(value);
  }, []);

        // console.log("scores", scores);
  return (
    <div className={styles["main-container"]}>
      <div className={styles["view-header"]}>
        <div className={styles["view-header-title"]}>Selected Lines</div>
        <Select value={sortOption} options={options} onChange={changeSortOption}/>
      </div>
      <div className={styles["view-body"]}>
      {
        sortedDatas.map((lineData, i) => {
          const {id, data, score, name} = lineData;
          return <ScoreView key={id} id={"" + id} score={score} title={`${name}`} data={{[id]: data}} width={scoreWidth} height={scoreHeight} colorScale={linesColorScale} />
        })
      }
      </div>
    </div>
  );
});

export default React.memo(ScoreViews);
