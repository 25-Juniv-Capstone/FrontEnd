// src/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() { 
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // 토큰 상태 관리
  useEffect(() => {
    const updateToken = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    };
    
    window.addEventListener('storage', updateToken);
    window.addEventListener('login', updateToken);
    
    // 초기 토큰 상태 설정
    updateToken();
    
    return () => {
      window.removeEventListener('storage', updateToken);
      window.removeEventListener('login', updateToken);
    };
  }, []);

  const handleLogin = async () => {
    try {
      // 직접 카카오 로그인 URL로 이동
      window.location.href = 'http://localhost:8080/api/auth/kakao/login';
    } catch (error) {
      alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <header style={{
      width: '100%',
      height: '80px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0068DF' }}>Barrier Crash</div>
      </Link>
      <nav style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#555' }}>
        <Link to="/community" style={{ textDecoration: 'none', color: '#555' }}>
          <span style={{ cursor: 'pointer' }}>커뮤니티</span>
        </Link>
        {token ? (
          <>
            <Link to="/mypage" style={{ textDecoration: 'none', color: '#555' }}>
              <span style={{ cursor: 'pointer' }}>마이페이지</span>
            </Link>
            <span 
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={handleLogout}
            >
              로그아웃
            </span>
          </>
        ) : (
          <span 
            style={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleLogin}
          >
            로그인
          </span>
        )}
      </nav>
    </header>
  );
}

export default Header;
