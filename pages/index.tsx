import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import Canvas from '../components/Canvas'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fuzzy Timebox</title>
        <meta name="description" content="fuzzy timebox" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main>
        {/* <canvas className={styles.canvas}></canvas> */}
        <Canvas></Canvas>
      </main>
    </div>
  )
}
