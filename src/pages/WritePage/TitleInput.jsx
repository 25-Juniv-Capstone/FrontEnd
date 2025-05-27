"use client";
import React, { useState } from "react";
import styles from "../../css/writepages/InputDesign.module.css";

function TitleInput() {
  const [title, setTitle] = useState("");

  return (
    <div className={styles.titleInputContainer}>
      <div className={styles.inputFieldGroup}>
        <label htmlFor="post-title" className={styles.inputLabel}>
          제목
        </label>
        <input
          id="post-title"
          type="text"
          className={styles.textInput}
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );
}

export default TitleInput;
