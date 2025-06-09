"use client";
import React from "react";
import WritePageContent from "./WritePage";
import styles from "../../css/writepages/ModalWritePage.module.css";

function WritePageModal({ isOpen, onClose, onPostCreated }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>게시글 작성</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </header>
        <WritePageContent 
          isOpen={isOpen} 
          onClose={onClose} 
          onPostCreated={onPostCreated}
        />
      </div>
    </div>
  );
}

export default WritePageModal; 