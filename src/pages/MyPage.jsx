import React, { useEffect, useState } from 'react';
import '../css/MyPage.css';
import UserEditModal from './UserEditModal';
import communityStyles from '../css/communitypages/CommunityPage.module.css';
import axiosInstance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { MdDeleteOutline } from 'react-icons/md';
import { deleteCourse } from '../api/courseApi';

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [showEditModal, setShowEditModal] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [likeCourses, setLikeCourses] = useState([]);
  const [likeTabLoading, setLikeTabLoading] = useState(false);
  const [likeCoursesLoaded, setLikeCoursesLoaded] = useState(false);
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

      // 사용자 정보와 내 코스 목록을 병렬로 요청
      console.log('사용자 정보와 코스 목록 병렬 요청 시작...');
      const [userResponse, coursesResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        axiosInstance.get(`/courses/user/${userId}`)
      ]);

      if (!userResponse.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      const userData = await userResponse.json();
      setUserInfo(userData);

      console.log('코스 목록 응답:', coursesResponse);
      if (coursesResponse.data) {
        console.log('가져온 코스 데이터:', coursesResponse.data);
        setMyCourses(coursesResponse.data);
      } else {
        console.log('코스 데이터가 없습니다.');
        setMyCourses([]);
      }

      // 좋아요한 게시글은 초기 로딩 시에는 로드하지 않음 (탭 클릭 시 로드)
      setLikeCourses([]);
      
    } catch (err) {
      console.error('전체 데이터 가져오기 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeCourses = async () => {
    // 이미 로드된 경우 캐시된 데이터 사용
    if (likeCoursesLoaded && likeCourses.length > 0) {
      return;
    }
    
    setLikeTabLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const likeResponse = await axiosInstance.get(`/posts/liked/${userId}`);
      setLikeCourses(likeResponse.data || []);
      setLikeCoursesLoaded(true); // 로드 완료 표시
    } catch (likeError) {
      console.error('좋아요한 게시글 목록 가져오기 실패:', likeError);
      console.error('에러 상세:', likeError.response?.data);
      setLikeCourses([]);
    } finally {
      setLikeTabLoading(false);
    }
  };

  // 백그라운드에서 좋아요한 게시글 사전 로딩
  const preloadLikeCourses = async () => {
    if (likeCoursesLoaded) return; // 이미 로드된 경우 스킵
    
    try {
      const userId = localStorage.getItem('userId');
      const likeResponse = await axiosInstance.get(`/posts/liked/${userId}`);
      setLikeCourses(likeResponse.data || []);
      setLikeCoursesLoaded(true);
    } catch (error) {
      console.error('백그라운드 좋아요 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'like') {
      fetchLikeCourses();
    }
  }, [activeTab]);

  // 초기 로딩 완료 후 백그라운드에서 좋아요한 게시글 사전 로딩
  useEffect(() => {
    if (!loading && !likeCoursesLoaded) {
      // 약간의 지연 후 백그라운드에서 로딩 (사용자 경험 개선)
      const timer = setTimeout(() => {
        preloadLikeCourses();
      }, 1000); // 1초 후 백그라운드 로딩
      
      return () => clearTimeout(timer);
    }
  }, [loading, likeCoursesLoaded]);

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

  const handleCourseClick = (courseId, postId = null) => {
    if (postId) {
      navigate(`/courses/${courseId}`, {
        state: {
          from: 'community',
          postTitle: likeCourses.find(post => post.postId === postId)?.title,
          postId
        }
      });
    } else {
      navigate(`/courses/${courseId}/edit`);
    }
  };

  // 코스 삭제 핸들러
  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (!window.confirm(`"${courseTitle}" 코스를 정말로 삭제하시겠습니까?\n\n⚠️ 주의: 이 코스와 관련된 모든 데이터(게시글, 댓글, 좋아요 등)가 함께 삭제됩니다.`)) {
      return;
    }
    
    try {
      await deleteCourse(courseId);
      alert('코스가 성공적으로 삭제되었습니다.');
      // 코스 목록 새로고침 및 캐시 초기화
      setLikeCoursesLoaded(false); // 좋아요 캐시 초기화
      fetchUserData();
    } catch (error) {
      console.error('코스 삭제 실패:', error);
      alert('코스 삭제에 실패했습니다.');
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

      {activeTab === 'my' && (
        <div className={communityStyles.cardSection}>
          <div className={communityStyles.cardGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', minHeight: 340 }}>
            {myCourses.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', alignSelf: 'center', color: '#888', fontSize: '1.1rem' }}>
                여행 코스가 없습니다.
              </div>
            ) : (
              myCourses.map((course, idx) => (
                <div 
                  key={course.courseId} 
                  className={communityStyles.card}
                  onClick={() => handleCourseClick(course.courseId)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {/* 삭제 버튼 */}
                  <button
                    className="delete-course-btn"
                    onClick={(e) => handleDeleteCourse(course.courseId, course.title, e)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <MdDeleteOutline size={18} color="#ff4444" />
                  </button>
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
                    <div className={communityStyles.cardTags}>
                      {course.keywords && (
                        <span className={communityStyles.cardTag}>#{course.keywords}</span>
                      )}
                    </div>
                    <div className={communityStyles.cardLocal}>{course.region}</div>
                    <div className={communityStyles.cardAuthor}>
                      {activeTab === 'my' ? '나의 여행' : '좋아요한 여행'}
                    </div>
                    <div className={communityStyles.cardDate}>
                      {new Date(course.startDate).toLocaleDateString()} ~ {new Date(course.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {activeTab === 'like' && (
        <div className={communityStyles.cardSection}>
          {likeTabLoading && !likeCoursesLoaded ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              좋아요한 여행을 불러오는 중...
            </div>
          ) : (
            <div className={communityStyles.cardGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', minHeight: 340 }}>
              {likeCourses.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', alignSelf: 'center', color: '#888', fontSize: '1.1rem' }}>
                  좋아요한 여행 코스가 없습니다.
                </div>
              ) : (
                likeCourses.map((post, idx) => (
                  <div 
                    key={post.postId} 
                    className={communityStyles.card}
                    onClick={() => handleCourseClick(post.courseId, post.postId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className={communityStyles.cardImage} 
                      style={{
                        backgroundImage: post.courseImageUrl 
                          ? `url(${post.courseImageUrl})` 
                          : "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} 
                    />
                    <div className={communityStyles.cardBody}>
                      <div className={communityStyles.cardTitle}>{post.title}</div>
                      <div className={communityStyles.cardTags}>
                        {post.region && (
                          <span className={communityStyles.cardTag}>#{post.region}</span>
                        )}
                        {post.disabilityType && (
                          <span className={communityStyles.cardTag}>#{post.disabilityType === 'wheelchair' ? '휠체어' : post.disabilityType === 'visual' ? '시각장애' : post.disabilityType === 'hearing' ? '청각장애' : post.disabilityType}</span>
                        )}
                        {post.courseTitle && (
                          <span className={communityStyles.cardTag}>#{post.courseTitle}</span>
                        )}
                      </div>
                      <div className={communityStyles.cardLocal}>{post.region}</div>
                      <div className={communityStyles.cardAuthor}>
                        by {post.userName}
                      </div>
                      <div className={communityStyles.cardDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <UserEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} userInfo={userInfo} setUserInfo={setUserInfo} />
    </div>
  );
}

export default MyPage;

