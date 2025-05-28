import React, { useState } from "react";
import styles from '../../css/selectpages/UserTypeSelection.module.css';

const UserTypeSelection = ({ onSelect }) => {
  const userTypes = [
    { id: "wheelchair", label: "휠체어 이용자" },
    { id: "visuallyImpaired", label: "시각 장애인" },
    { id: "elderly", label: "노약자" },
  ];

  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleSelect = (id) => {
    setSelectedTypes((prevSelectedTypes) => {
      let newSelection;
      if (prevSelectedTypes.includes(id)) {
        newSelection = prevSelectedTypes.filter((typeId) => typeId !== id);
      } else {
        newSelection = [...prevSelectedTypes, id];
      }
      onSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        🌿 맞춤 여행을 위해, 동반자 유형을 선택 해주세요.
      </h2>
      {userTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => handleSelect(type.id)}
          className={` ${styles.button} ${
            selectedTypes.includes(type.id)
              ? styles.buttonSelected
              : styles.buttonDefault
          }`}
          aria-pressed={selectedTypes.includes(type.id)}
        >
          {type.label}
        </button>
      ))}
    </section>
  );
};

export default UserTypeSelection;