import React from 'react';
import '../css/ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, destination }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{destination} 지역으로 여행을 떠나시겠어요?</h2>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={() => onConfirm(destination)}>
            예
          </button>
          <button className="cancel-button" onClick={onClose}>
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal; 