import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginRequiredModal.css";

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize?..."; // 실제 카카오 인증 URL로 교체

const LoginRequiredModal = ({ open, onClose }) => {


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
            onClick={() => {
              window.location.href = KAKAO_AUTH_URL;
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal; 