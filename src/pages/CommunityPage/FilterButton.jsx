import React from "react";
import styles from "../../css/communitypages/FilterButton.module.css"; // CSS 모듈 import 경로 수정

function FilterButton({ label, isActive, onClick }) {
  // CSS 모듈의 클래스 이름을 사용하여 className을 동적으로 설정
  const buttonClassName = `
    ${styles.buttonBase}
    ${isActive ? styles.active : styles.inactive}
  `;

  return (
    <div className={styles.filterButtonContainer}>
      <button
        onClick={onClick}
        className={buttonClassName}
      >
        {label}
      </button>
    </div>
  );
}

export default FilterButton;
