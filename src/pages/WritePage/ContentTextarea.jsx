"use client";
import React, { useState } from "react";
import styles from "../../css/writepages/InputDesign.module.css";

function ContentTextarea() {
  const [content, setContent] = useState("");

  return (
    <div className={styles.contentInputContainer}>
      <div className={styles.textareaFieldGroup}>
        <label htmlFor="post-content" className={styles.textareaLabel}>
          여행의 한 줄을 입력해주세요
        </label>
        <div className={styles.contentTextarea}>
          <textarea
            id="post-content"
            className={styles.textareaValueDisplay}
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/e7030f78278d7c5e1f552a2fc04e70b5790a8dfc?placeholderIfAbsent=true"
            alt="Resize handle"
            className={styles.textareaResizeIcon}
          />
        </div>
      </div>
    </div>
  );
}

export default ContentTextarea;
