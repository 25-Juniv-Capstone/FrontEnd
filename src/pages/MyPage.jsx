import React, { useEffect, useState } from 'react';
import '../css/MyPage.css';
import UserEditModal from './UserEditModal';
import communityStyles from '../css/communitypages/CommunityPage.module.css';

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [showEditModal, setShowEditModal] = useState(false);

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
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까?')) return;
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
        <button className="edit-button" onClick={() => setShowEditModal(true)}>회원정보수정</button>
        <button className="edit-button" style={{ color: 'red', marginLeft: '10px' }} onClick={handleUnlink}>회원탈퇴</button>
      </header>

      <nav className="tab-menu">
        <span
          className={activeTab === 'my' ? 'active' : ''}
          onClick={() => setActiveTab('my')}
        >내 여행</span>
        <span
          className={activeTab === 'like' ? 'active' : ''}
          onClick={() => setActiveTab('like')}
        >내가 좋아요한 여행</span>
      </nav>

      {/* 게시물 */}
      {activeTab === 'my' && (
        <div className={communityStyles.cardSection}>
          <div className={communityStyles.cardGrid}>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>제주도 여행</div>
                <div className={communityStyles.cardLocal}>제주</div>
                <div className={communityStyles.cardAuthor}>나의 여행</div>
              </div>
            </div>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>서울 여행</div>
                <div className={communityStyles.cardLocal}>서울</div>
                <div className={communityStyles.cardAuthor}>나의 여행</div>
              </div>
            </div>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>부산 여행</div>
                <div className={communityStyles.cardLocal}>부산</div>
                <div className={communityStyles.cardAuthor}>나의 여행</div>
              </div>
            </div>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>수원 여행</div>
                <div className={communityStyles.cardLocal}>수원</div>
                <div className={communityStyles.cardAuthor}>나의 여행</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'like' && (
        <div className={communityStyles.cardSection}>
          <div className={communityStyles.cardGrid}>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>제주도 여행</div>
                <div className={communityStyles.cardLocal}>제주</div>
                <div className={communityStyles.cardAuthor}>좋아요한 여행</div>
              </div>
            </div>
            <div className={communityStyles.card}>
              <div className={communityStyles.cardImage} style={{backgroundImage: "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center'}} />
              <div className={communityStyles.cardBody}>
                <div className={communityStyles.cardTitle}>서울 여행</div>
                <div className={communityStyles.cardLocal}>서울</div>
                <div className={communityStyles.cardAuthor}>좋아요한 여행</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달 */}
      <UserEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} userInfo={userInfo} setUserInfo={setUserInfo} />
    </div>
  );
}

export default MyPage;

