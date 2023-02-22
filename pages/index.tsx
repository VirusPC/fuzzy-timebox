import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import QueryLayer from '../components/QueryLayer'
import QueryToolsPanel from '../views/QueryToolsPanel'
import "antd/dist/antd.css";
import DataPanel from '../views/DataPanel'
import LineLayer from '../components/LineLayer'
import MainView from '../views/MainView'
import classNames from 'classnames'
import Editor from '../views/Editor'
import TitleView from '../views/TitleView'
import SpinView from '../views/SpinView'
import ScoreView from '../views/ScoreView'
import ControlPanel from '../views/ControlPanel'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fuzzy Timebox</title>
        <meta name="description" content="fuzzy timebox" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className={classNames(styles["main"], styles["v-concat"])}>
        {/* <canvas className={styles.canvas}></canvas> */}
        <div className={classNames( styles["h-concat"], styles["top-views"] )}>
          <TitleView />
          <div className={styles["data-panel"]}>
            <DataPanel />
          </div>
        </div>
        <div className={classNames(styles["h-concat"], styles["middle-views"])}>
          <div className={styles["score-view"]}>
            <ControlPanel/>
          </div>
          <div className={styles["main-view"]}>
            <MainView />
          </div>
          <div className={styles["v-concat"]}>
            <div className={styles['query-tools-panel']}>
              <QueryToolsPanel />
            </div>
            <div className={styles["editor"]}>
              <Editor />
            </div>
          </div>
        </div>
        <div className={classNames(styles["bottom-views"])}>
          <ScoreView/>
        </div>
        <div className={styles["spin-view"]}>
          <SpinView/>
        </div>
      </main>
    </div>
  )
}
