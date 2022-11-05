import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import QueryLayer from '../components/QueryLayer'
import ControlPanel from '../views/ControlPanel'
import "antd/dist/antd.css";
import DataPanel from '../views/DataPanel'
import LineLayer from '../components/LineLayer'
import MainView from '../views/MainView'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fuzzy Timebox</title>
        <meta name="description" content="fuzzy timebox" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className={styles["main"]}>
        {/* <canvas className={styles.canvas}></canvas> */}
        <div className={styles["data-panel"]}>
          <DataPanel/>
        </div>
        <div className={styles["main-view"]}>
          <MainView/>
        </div>
        <div className={styles["control-panel"]}>
          <ControlPanel/>
        </div>
      </main>
    </div>
  )
}
