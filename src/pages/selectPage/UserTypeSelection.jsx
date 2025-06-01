import React, { useState } from "react";
import styles from '../../css/selectpages/UserTypeSelection.module.css';

const UserTypeSelection = ({ onSelect }) => {
  const userTypes = [
    { id: "wheelchair", label: "휠체어 이용자" },
    { id: "visuallyImpaired", label: "시각 장애인" },
    { id: "hearingImpaired", label: "청각 장애인" },
  ];

  const [selectedType, setSelectedType] = useState(null);

  const handleSelect = (id) => {
    setSelectedType(id);
    onSelect([id]); // 배열 형태 유지하되 단일 값만 전달
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        🌿 맞춤 여행을 위해, 동반자 유형을 선택 해주세요.
      </h2>
      <div className={styles.buttonGroup}>
        {userTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`${styles.button} ${
              selectedType === type.id
                ? styles.buttonSelected
                : styles.buttonDefault
            }`}
            aria-pressed={selectedType === type.id}
          >
            {type.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default UserTypeSelection;