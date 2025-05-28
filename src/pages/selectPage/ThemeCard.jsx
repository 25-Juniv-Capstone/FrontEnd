import React from "react";
import styles from '../../css/selectpages/ThemeCard.module.css';

const ThemeCard = ({ title, imageUrl, onClick, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${isSelected ? styles.buttonSelected : ''}`}
    >
      <img
        src={imageUrl}
        alt={`${title} theme`}
        className={styles.image}
      />
      <span className={styles.title}>
        {title}
      </span>
    </button>
  );
};

export default ThemeCard;
