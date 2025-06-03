import React from "react";
import styles from '../../css/selectpages/ThemeCard.module.css';

const ThemeCard = ({ title, imageUrl, onClick, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${isSelected ? styles.buttonSelected : ''}`}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${title} 테마 선택`}
    >
      <img
        src={imageUrl}
        alt={`${title} 테마 이미지`}
        className={styles.image}
      />
      <span className={styles.title}>
        {title}
      </span>
    </button>
  );
};

export default ThemeCard;
