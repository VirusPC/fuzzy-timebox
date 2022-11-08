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
        <div className={styles["data-panel"]}>
          <DataPanel />
        </div>
        <div className={styles["h-concat"]}>
          <div className={styles['query-tools-panel']}>
            <QueryToolsPanel />
          </div>
          <div className={styles["main-view"]}>
            <MainView />
          </div>
        </div>
        <div>
          <Editor/>
        </div>
      </main>
    </div>
  )
}
