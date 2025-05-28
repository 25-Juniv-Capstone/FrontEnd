import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('id');

    if (token && userId) {
      // 토큰과 사용자 ID를 로컬 스토리지에 저장
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      
      // 커스텀 "login" 이벤트를 발생시켜 Header 컴포넌트에 알림
      window.dispatchEvent(new Event('login'));

      window.location.href = '/';
    } else {
      alert('로그인 실패');
      window.location.href = '/';
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      로그인 처리 중...
    </div>
  );
}

export default KakaoCallbackPage; 