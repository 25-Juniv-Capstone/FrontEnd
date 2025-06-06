import React from 'react';
import '../css/LoadingSpinner.css';
import { useLoadingAnimation } from '../hooks/useLoadingAnimation';

const LoadingSpinner = ({ message = "코스를 생성하고 있습니다...", region = "기타" }) => {
  const { progress, dots, currentTip } = useLoadingAnimation(region);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        style={{
          textAlign: 'center',
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '320px',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 100000
        }}
      >
        <div 
          style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}
        />
        <div 
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f3f3f3',
            borderRadius: '4px',
            margin: '20px 0',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3498db, #2ecc71)',
              borderRadius: '4px',
              width: `${progress}%`,
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </div>
        <p 
          style={{
            color: '#333',
            fontSize: '1.2rem',
            fontWeight: '500',
            margin: '0 0 20px 0',
            fontFamily: "'Ownglyph_corncorn-Rg', 'Pretendard', sans-serif"
          }}
        >
          {message}{dots}
        </p>
        <div 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '20px',
            border: '1px solid #e9ecef',
            height: '140px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💡</span>
            <span 
              style={{
                color: '#2c3e50',
                fontSize: '1.1rem',
                fontWeight: '600',
                fontFamily: "'Ownglyph_corncorn-Rg', 'Pretendard', sans-serif"
              }}
            >
              {region} 여행 정보
            </span>
          </div>
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <p 
              style={{
                color: '#495057',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                margin: 0,
                padding: '0 10px',
                animation: 'fadeIn 0.8s ease-in-out',
                textAlign: 'center',
                fontFamily: "'Ownglyph_corncorn-Rg', 'Pretendard', sans-serif"
              }}
            >
              {currentTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 