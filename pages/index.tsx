import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import Canvas from '../components/Canvas'
import ControlPanel from '../components/ControlPanel'
import "antd/dist/antd.css";
import DataPanel from '../components/DataPanel'

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
        <div>
          <DataPanel/>
        </div>
        <div className={styles["canvas"]}>
          <Canvas/>
        </div>
        <div className={styles["control-panel"]}>
          <ControlPanel/>
        </div>
      </main>
    </div>
  )
}
