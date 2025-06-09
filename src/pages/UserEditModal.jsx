import React, { useState } from 'react';
import styles from '../css/writepages/ModalWritePage.module.css';

function UserEditModal({ isOpen, onClose, userInfo, setUserInfo }) {
  const [nickname, setNickname] = useState(userInfo?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname })
      });
      if (!response.ok) throw new Error('회원정보 수정 실패');
      const updated = await response.json();
      setUserInfo(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>회원정보 수정</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </header>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>닉네임</label>
            <input
              className={styles.formInput}
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <input
              className={styles.formInput}
              type="email"
              value={userInfo?.email || ''}
              readOnly
              disabled
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={saving}>취소</button>
            <button type="submit" className={styles.submitButton} disabled={saving}>저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal; 