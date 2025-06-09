import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginRequiredModal.css";

const LoginRequiredModal = ({ open, onClose }) => {

  const handleLogin = async () => {
    try {
      // 현재 페이지 URL을 state 파라미터로 전달
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = `http://localhost:8080/api/auth/kakao/login?state=${encodeURIComponent(currentUrl)}`;
      // 백엔드 서버의 카카오 로그인 엔드포인트로 이동
      window.location.href = loginUrl;
    } catch (error) {
      alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  if (!open) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <div className="login-modal-title">
          로그인 뒤 이용 가능합니다
        </div>
        <div className="login-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button
            className="login-btn"
            onClick={handleLogin}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal; 