import React, { useEffect, useState } from 'react';
import '../css/MyPage.css';

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleUnlink = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) throw new Error('로그인이 필요합니다.');
      const response = await fetch(`http://localhost:8080/api/auth/kakao/unlink?userId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('회원탈퇴 실패');
      // 탈퇴 후 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="my-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-container">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="my-container">
      <header className="my-header">
        <div 
          className="profile-image" 
          style={{ 
            backgroundImage: userInfo?.picUrl ? `url(${userInfo.picUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} 
        />
        <h2 className="profile-name">{userInfo?.nickname || '사용자'}</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>{userInfo?.email}</p>
        <button className="edit-button">회원정보수정</button>
        <button className="edit-button" style={{ color: 'red', marginLeft: '10px' }} onClick={handleUnlink}>회원탈퇴</button>
      </header>

      <nav className="tab-menu">
        <span className="active">내 여행</span>
        <span>내가 좋아요한 여행</span>
      </nav>

{/* 게시물 */}
      <section className="best-destinations">
        <div className="card-container">

    <div className="destination-card jeju">
      <div className="overlay">
        <h3>JEJU<br /><span>제주도</span></h3>
      </div>
    </div>

    <div className="destination-card seoul">
      <div className="overlay">
        <h3>SEOUL<br /><span>서울</span></h3>
      </div>
    </div>

    <div className="destination-card busan">
      <div className="overlay">
        <h3>BUSAN<br /><span>부산</span></h3>
      </div>
    </div>

    <div className="destination-card suwon">
      <div className="overlay">
        <h3>SUWON<br /><span>수원</span></h3>
      </div>
    </div>
    
  </div>
</section>

    </div>
  );
}

export default MyPage;
