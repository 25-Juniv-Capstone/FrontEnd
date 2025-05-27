"use client";
import React, { useState, useRef } from "react";
import styles from "../../css/writepages/InputDesign.module.css";

function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      // 여기에 실제 파일 업로드 로직을 추가할 수 있습니다.
      // 예: const formData = new FormData();
      // formData.append("image", file);
      // fetch("/api/upload", { method: "POST", body: formData });
      console.log("Selected file:", file.name);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={selectedFile ? styles.imageUploadGroupContainer : styles.initialImageUploadContainer}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*" // 이미지 파일만 선택 가능하도록 설정 (선택 사항)
      />
      {selectedFile ? (
        // 이미지가 선택된 경우: 버튼과 파일 이름
        <>
          <button className={styles.imageUploadBox} onClick={handleButtonClick}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/1321cf5f607b1b899c2f226232b4ecc18780d806?placeholderIfAbsent=true"
              alt="Upload image"
              className={styles.uploadIcon}
            />
          </button>
          <p style={{ marginLeft: '10px' }}>선택된 파일: {selectedFile}</p>
        </>
      ) : (
        // 이미지가 선택되지 않은 경우: 위치가 조정된 버튼
        <div style={{ position: 'relative', left: '-20px' }}>
          <button className={styles.imageUploadBox} onClick={handleButtonClick}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/1321cf5f607b1b899c2f226232b4ecc18780d806?placeholderIfAbsent=true"
              alt="Upload image"
              className={styles.uploadIcon}
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
