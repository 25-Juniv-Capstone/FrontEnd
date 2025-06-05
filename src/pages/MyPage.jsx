import React, { useEffect, useState } from 'react';
import '../css/MyPage.css';
import UserEditModal from './UserEditModal';
import communityStyles from '../css/communitypages/CommunityPage.module.css';
import axiosInstance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [showEditModal, setShowEditModal] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('현재 userId:', userId);
      console.log('현재 token:', token);
      
      if (!userId || !token) {
        throw new Error('로그인이 필요합니다.');
      }

      const userResponse = await fetch(`http://localhost:8080/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      const userData = await userResponse.json();
      setUserInfo(userData);

      console.log('코스 목록 요청 시작...');
      try {
        const coursesResponse = await axiosInstance.get(`/courses/user/${userId}`);
        console.log('코스 목록 응답:', coursesResponse);
        if (coursesResponse.data) {
          console.log('가져온 코스 데이터:', coursesResponse.data);
          setMyCourses(coursesResponse.data);
        } else {
          console.log('코스 데이터가 없습니다.');
          setMyCourses([]);
        }
      } catch (courseError) {
        console.error('코스 목록 가져오기 실패:', courseError);
        console.error('에러 상세:', courseError.response?.data);
        setMyCourses([]);
      }
    } catch (err) {
      console.error('전체 데이터 가져오기 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
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
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const renderCourseCards = (courses) => {
    if (!courses || courses.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          {activeTab === 'my' ? '저장된 여행 코스가 없습니다.' : '좋아요한 여행 코스가 없습니다.'}
        </div>
      );
    }

    return (
      <div className={communityStyles.cardGrid}>
        {courses.map((course) => (
          <div 
            key={course.courseId} 
            className={communityStyles.card}
            onClick={() => handleCourseClick(course.courseId)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className={communityStyles.cardImage} 
              style={{
                backgroundImage: course.imageUrl 
                  ? `url(${course.imageUrl})` 
                  : "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
            <div className={communityStyles.cardBody}>
              <div className={communityStyles.cardTitle}>{course.title}</div>
              <div className={communityStyles.cardLocal}>{course.region}</div>
              <div className={communityStyles.cardAuthor}>
                {activeTab === 'my' ? '나의 여행' : '좋아요한 여행'}
              </div>
              <div className={communityStyles.cardDate}>
                {new Date(course.startDate).toLocaleDateString()} ~ {new Date(course.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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

      {activeTab === 'my' && (
        <div className={communityStyles.cardSection}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
          ) : (
            renderCourseCards(myCourses)
          )}
        </div>
      )}
      {activeTab === 'like' && (
        <div className={communityStyles.cardSection}>
          {renderCourseCards([])}
        </div>
      )}

      <UserEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} userInfo={userInfo} setUserInfo={setUserInfo} />
    </div>
  );
}

export default MyPage;

