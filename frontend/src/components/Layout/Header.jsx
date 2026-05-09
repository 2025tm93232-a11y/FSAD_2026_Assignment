import React from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import styles from './Header.module.css';

export default function Header({ onMenuClick, title, subtitle }) {
  const [online, setOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Menu">
          <Menu size={20} />
        </button>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      <div className={styles.right}>
        <div className={`${styles.status} ${online ? styles.online : styles.offline}`}>
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{online ? 'Connected' : 'Offline'}</span>
        </div>
        <div className={styles.avatar}>PK</div>
      </div>
    </header>
  );
}
