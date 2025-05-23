import React from "react";
import styles from '@/css/selectpages/GenerateButton.module.css';

const GenerateButton = ({ onClick }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spacer} />
      <button
        onClick={onClick}
        className={styles.button}
      >
        생성
      </button>
    </div>
  );
};

export default GenerateButton;
