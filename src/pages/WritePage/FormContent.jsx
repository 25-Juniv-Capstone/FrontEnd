"use client";
import React from "react";
import styles from "../../css/writepages/InputDesign.module.css";
import ImageUploader from "./ImageUploader";
import TitleInput from "./TitleInput";
import ContentTextarea from "./ContentTextarea";
import AccessibilitySelect from "./AccessibilitySelect";

function FormContent() {
  return (
    <main className={styles.modalContent}>
      <ImageUploader />
      <TitleInput />
      <ContentTextarea />
      <AccessibilitySelect />
    </main>
  );
}

export default FormContent;
