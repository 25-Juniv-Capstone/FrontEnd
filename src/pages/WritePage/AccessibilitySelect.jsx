"use client";
import React, { useState } from "react";
import styles from "../../css/writepages/InputDesign.module.css";
import WritePageModal from "../WritePage/WritePageModal";

function AccessibilitySelect() {
  const [selectedOption, setSelectedOption] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    "휠체어 이용자",
    "시각 장애인",
    "청각 장애인"
  ];

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.categorySelectContainer}>
      <div className={styles.selectFieldGroup}>
        <label htmlFor="accessibility-type" className={styles.selectLabel}>
          무장애 유형을 선택해주세요
        </label>
        <div
          className={styles.categorySelect}
          onClick={() => setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby="accessibility-type"
        >
          <div className={styles.selectValueDisplay}>
            {selectedOption || "선택하기"}
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/b0ad665f0f18475290e89af0ba74a512a814b721?placeholderIfAbsent=true"
            alt="Dropdown arrow"
            className={styles.selectDropdownIcon}
          />
          {isOpen && (
            <ul
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid var(--sds-color-border-default-default)',
                borderRadius: 'var(--sds-size-radius-200)',
                zIndex: 10,
                marginTop: '4px',
                padding: '8px 0',
                listStyle: 'none'
              }}
            >
              {options.map((option) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={selectedOption === option}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: selectedOption === option ? '#f0f0f0' : 'transparent'
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessibilitySelect;
