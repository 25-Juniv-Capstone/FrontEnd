import React from "react";
import styles from '../../css/selectpages/SearchListItem.module.css';

const SearchListItem = ({ name, address, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={styles.container}
      role="button"
      tabIndex={0}
    >
      <div className={styles.backgroundLayer} />
      <div className={styles.contentContainer}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            A
          </div>
        </div>
        <div className={styles.textContainer}>
          <div className={styles.name}>
            {name}
          </div>
          <div className={styles.address}>
            {address}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchListItem;