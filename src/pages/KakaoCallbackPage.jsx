import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('id');
    const error = searchParams.get('error');

    if (error) {
      console.error('카카오 로그인 에러:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      // 이전 페이지로 돌아가기
      navigate(-1);
      return;
    }

    if (token && userId) {
      // 토큰과 사용자 ID를 로컬 스토리지에 저장
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      
      // 커스텀 "login" 이벤트를 발생시켜 Header 컴포넌트에 알림
      window.dispatchEvent(new Event('login'));

      // 이전 페이지가 있으면 그 페이지로, 없으면 메인 페이지로
      const redirectPath = searchParams.get('redirect') || '/';
      
      if (redirectPath === '/') {
        // 메인 페이지로 이동할 때는 새로고침
        window.location.href = '/';
      } else {
        // 다른 페이지로 이동할 때는 새로고침 없이 이동
        navigate(redirectPath, { replace: true });
      }
    } else {
      console.error('토큰 또는 사용자 ID가 없습니다.');
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate(-1);
    }
  }, [navigate, searchParams, location]);

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