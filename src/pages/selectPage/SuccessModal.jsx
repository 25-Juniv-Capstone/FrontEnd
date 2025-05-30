import React from "react";
import styles from "../../css/selectpages/SuccessModal.module.css";

const SuccessModal = ({ message }) => (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <span className={styles.icon}>🎉</span>
      <div className={styles.text}>{message}</div>
    </div>
  </div>
);

export default SuccessModal; 