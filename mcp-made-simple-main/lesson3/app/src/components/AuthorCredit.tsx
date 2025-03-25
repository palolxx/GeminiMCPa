import styles from './AuthorCredit.module.css';

export function AuthorCredit() {
  return (
    <div className={styles.credit}>
      <div className={styles.wrapper}>
        <span className={styles.text}>MCP Made Simple by</span>
        <a
          href="https://www.x.com/chongdashu"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.author}
        >
          @chongdashu
        </a>
        <a
          href="https://www.youtube.com/playlist?list=PLWUH7ke1DYK_Tnvi9PPy67LCkoeKSKGbe"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.youtube}
        >
          Watch the Tutorial Series
        </a>
      </div>
    </div>
  );
}
