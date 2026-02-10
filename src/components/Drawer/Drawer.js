'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Drawer.module.scss'

const EFFECTS = [
  { href: '/effects/stippling', label: 'stippling' },
  { href: '/effects/dots', label: 'dots' },
  { href: '/effects/patterns', label: 'patterns' },
  { href: '/effects/edge', label: 'edge' },
  { href: '/effects/distort', label: 'distort' },
  { href: '/effects/displace', label: 'displace' },
  { href: '/effects/dithering', label: 'dithering' },
  { href: '/effects/bevel', label: 'bevel' },
  { href: '/effects/recolor', label: 'recolor' },
  { href: '/effects/scatter', label: 'scatter' },
  { href: '/effects/cellular-automata', label: 'cellular automata' },
  { href: '/effects/gradients', label: 'gradients' },
  { href: '/effects/crt', label: 'CRT' },
  { href: '/effects/ascii', label: 'ASCII' }
]

export default function Drawer () {
  const pathname = usePathname()

  return (
    <header className={styles.drawer}>
      <nav className={styles.body}>
        <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
          <span className={styles.indicator} />
          <span className={styles.label}>img-fx</span>
        </Link>

        <div className={styles.sectionLabel}>/Effects</div>

        <ul className={styles.list}>
          {EFFECTS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ''}`}
              >
                <span className={styles.indicator} />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <ul className={styles.list}>
            <li>
              <Link href="/about" className={`${styles.link} ${pathname === '/about' ? styles.active : ''}`}>
                <span className={styles.indicator} />
                <span className={styles.label}>about</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
