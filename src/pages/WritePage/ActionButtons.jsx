"use client";
import React from "react";
import styles from "../../css/writepages/InputDesign.module.css";

// 부모로부터 받을 함수들을 props로 정의
function ActionButtons({ onCancel, onSubmit }) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // 부모로부터 받은 onCancel 함수 호출
    } else {
      console.log("Cancel clicked, but no onCancel handler provided");
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(); // 부모로부터 받은 onSubmit 함수 호출
    } else {
      console.log("Submit clicked, but no onSubmit handler provided");
    }
  };

  return (
    <footer className={styles.actionButtonsContainer}>
      <button onClick={handleCancel} className={styles.actionButtonSecondary}>
        취소
      </button>
      <button onClick={handleSubmit} className={styles.actionButtonPrimary}>
        올리기
      </button>
    </footer>
  );
}

export default ActionButtons;
