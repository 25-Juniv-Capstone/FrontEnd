import React from 'react';
import '../css/LoadingSpinner.css';
import { useLoadingAnimation } from '../hooks/useLoadingAnimation';

const LoadingSpinner = ({ message = "코스를 생성하고 있습니다...", region = "기타" }) => {
  const { progress, dots, currentTip } = useLoadingAnimation(region);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="loading-message">{message}{dots}</p>
        <div className="tip-container">
          <div className="tip-header">
            <span className="tip-icon">💡</span>
            <span className="tip-title">{region} 여행 정보</span>
          </div>
          <div className="tip-content-wrapper">
            <p className="tip-content">{currentTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 