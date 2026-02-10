'use client'

import styles from './page.module.scss'
import Link from 'next/link'

export default function Home () {
  return (
    <main className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>img-fx</h1>
        <p className={styles.subtitle}>Upload an image &rarr; Select and adjust effect &rarr; Export</p>
        <Link href="/effects/stippling" className={styles.cta}>
          Get started <span>&darr;</span>
        </Link>
      </div>
    </main>
  )
}
