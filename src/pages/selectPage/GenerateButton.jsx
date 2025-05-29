import React from "react";
import styles from '../../css/selectpages/GenerateButton.module.css';

const GenerateButton = ({ onClick, disabled, loading }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spacer} />
      <button
        onClick={onClick}
        className={styles.button}
        disabled={disabled || loading}
      >
        {loading ? '생성 중...' : '일정 생성하기'}
      </button>
    </div>
  );
};

export default GenerateButton;
