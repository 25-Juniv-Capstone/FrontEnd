import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PostPage.module.css';
import { placeTypeToEmoji } from '../../constants/placeTypes';
import axiosInstance from '../../utils/axiosConfig';
// import { FaHeart, FaRegHeart, FaShareSquare, FaCommentDots } from 'react-icons/fa'; // 아이콘 예시 (react-icons 설치 필요)

// mockPostData는 이제 사용하지 않거나, API 호출 실패 시 fallback으로 사용할 수 있습니다.
// const mockPostData = { ... }; 

const PostPage = () => {
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCourseSaved, setIsCourseSaved] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPostData(data); // API에서 받은 데이터로 상태 설정
        setLikes(data.likesCount || 0); // API 응답에 맞게 수정 (예: data.likesCount)
        setComments(data.comments || []); // API 응답에 맞게 수정
        setIsLiked(data.isLikedByUser || false); // API 응답에 맞게 수정 (사용자가 이미 좋아요를 눌렀는지 여부)
        if (data.days && data.days.length > 0) {
          setSelectedDay(data.days[0].day); // 첫번째 날짜를 기본 선택
        }
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError(err.message);
        // API 호출 실패 시 mockPostData를 사용하려면 아래 주석 해제
        // import mockPostDataInside from './mockPostData'; // 별도 파일로 분리된 mockData
        // setPostData(mockPostDataInside);
        // setLikes(mockPostDataInside.initialLikes);
        // setComments(mockPostDataInside.comments);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleLike = async () => {
    // 로그인 여부 확인 로직 추가 필요
    // const isLoggedIn = checkUserLoginStatus(); // 예시
    // if (!isLoggedIn) {
    //   alert("로그인이 필요합니다.");
    //   // 로그인 페이지로 리다이렉트 또는 로그인 모달 표시
    //   return;
    // }
    try {
      // --- 실제 API 엔드포인트로 수정해주세요 ---
      const response = await fetch(`/api/posts/${postId}/like`, { 
        method: isLiked ? 'DELETE' : 'POST',
        // headers: { 'Authorization': `Bearer ${userToken}` } // 인증 토큰 추가
      });
      if (!response.ok) {
        throw new Error('좋아요 처리 실패');
      }
      // const result = await response.json(); // 필요시 응답 데이터 사용
      setIsLiked(!isLiked);
      setLikes(prevLikes => isLiked ? prevLikes - 1 : prevLikes + 1);
    } catch (err) {
      console.error("Error updating like status:", err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("게시글 URL이 복사되었습니다!");
      })
      .catch(err => {
        console.error("URL 복사 실패:", err);
        alert("URL 복사에 실패했습니다.");
      });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // 로그인 여부 확인 로직 추가 필요

    try {
      // --- 실제 API 엔드포인트로 수정해주세요 ---
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${userToken}` // 인증 토큰 추가
        },
        body: JSON.stringify({ content: newComment })
      });
      if (!response.ok) {
        throw new Error('댓글 작성 실패');
      }
      const addedComment = await response.json(); // 서버에서 새로 추가된 댓글 객체를 반환한다고 가정
      setComments(prevComments => [...prevComments, addedComment]);
      setNewComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // 코스 저장 핸들러
  const handleSaveCourse = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/kakao/login';
      return;
    }
    if (!postData || !postData.courseId) {
      alert('코스 정보가 없습니다.');
      return;
    }
    try {
      const saveData = {
        userId,
        courseId: postData.courseId,
        title: postData.title,
        imageUrl: postData.courseImageUrl, // postData에 courseImageUrl이 있다면
        region: postData.region,
      };
      await axiosInstance.post(`/user/${userId}/saved-courses`, saveData);
      setIsCourseSaved(true);
      alert('마이페이지에 저장되었습니다.');
    } catch (err) {
      if (err.response?.status === 409) {
        alert('이미 저장된 코스입니다.');
        setIsCourseSaved(true);
      } else {
        alert('코스 저장에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>게시글을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>오류가 발생했습니다: {error} <br/> 관리자에게 문의하거나 잠시 후 다시 시도해주세요.</div>;
  }
  
  if (!postData) {
    return <div className={styles.errorContainer}>게시글 정보를 찾을 수 없습니다.</div>;
  }

  // postData가 로드된 후 currentDayItinerary 계산
  const currentDayItinerary = postData.days && postData.days.find(d => d.day === selectedDay)?.itinerary || [];

  // 렌더링 부분에 버튼 추가 (내가 작성한 글이 아니고, 로그인 상태일 때만 노출)
  const authorId = postData?.userId;
  const currentUserId = localStorage.getItem('userId');

  return (
    <div className={styles.postPageContainer}>
      <header className={styles.postHeader}>
        <h1>{postData.title}</h1>
        <div className={styles.postMeta}>
          {/* API 응답에 따라 author 객체가 올 수도 있음 (예: postData.author.name) */}
          <span>작성자: {typeof postData.author === 'string' ? postData.author : postData.author?.name || '정보 없음'}</span>
          <span>작성일: {postData.createdAt ? new Date(postData.createdAt).toLocaleDateString() : '날짜 정보 없음'}</span>
        </div>
      </header>

      {postData.days && postData.days.length > 0 && (
        <div className={styles.dayButtonsContainer}>
          {postData.days.map(dayData => (
            <button
              key={dayData.day}
              className={`${styles.dayButton} ${selectedDay === dayData.day ? styles.activeDay : ''}`}
              onClick={() => handleDayChange(dayData.day)}
            >
              {dayData.day}일차
            </button>
          ))}
        </div>
      )}

      <main className={styles.mainContent}>
        <section className={styles.courseDetailsSection}>
          <h2>{selectedDay}일차 여행 코스</h2>
          {currentDayItinerary.length > 0 ? (
            <ul className={styles.itineraryList}>
              {currentDayItinerary.map((item, index) => (
                <li key={item.id || index} className={styles.itineraryItem}> {/* itinerary 항목에 id가 있다면 사용 */}
                  <div className={styles.timeAndType}>
                    <span className={styles.time}>{item.time}</span>
                    <span className={styles.placeType}>{placeTypeToEmoji[item.place_type] || placeTypeToEmoji["기타"]} {item.place_type}</span>
                  </div>
                  <h3 className={styles.placeName}>{item.place_name}</h3>
                  <p className={styles.description}>{item.description}</p>
                  {item.accessibility_features && Object.keys(item.accessibility_features).length > 0 && (
                    <div className={styles.accessibilityInfo}>
                      <strong>무장애 정보:</strong>
                      <ul>
                        {Object.entries(item.accessibility_features).map(([key, value]) => (
                          // key값에 대한 설명이 필요하면 변환 로직 추가
                          <li key={key}>{`${key.replace(/_/g, ' ').replace(/^wheelchair accessible /i, '')}: ${value}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>해당 일차의 여행 정보가 없습니다.</p>
          )}
        </section>

        <div className={styles.centerDivider}></div>

        <aside className={styles.sidebar}>
          {postData.memo && (
            <div className={styles.memoSection}>
              <h3>메모</h3>
              <p>{postData.memo}</p>
            </div>
          )}
          {postData.keywords && postData.keywords.length > 0 && (
            <div className={styles.keywordsSection}>
              <h3>키워드</h3>
              <div className={styles.keywords}>
                {postData.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className={styles.postFooter}>
        <div className={styles.actionsContainer}>
          <button onClick={handleLike} className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}>
            {/* <FaHeart /> 또는 <FaRegHeart /> */}
            {isLiked ? '❤️' : '🤍'} 좋아요 {likes}
          </button>
          <button onClick={handleShare} className={styles.actionButton}>
            {/* <FaShareSquare /> */}
            🔗 공유하기
          </button>
          {currentUserId && authorId && currentUserId !== String(authorId) && (
            <button
              className={styles.saveCourseButton}
              onClick={handleSaveCourse}
              disabled={isCourseSaved}
            >
              {isCourseSaved ? '이미 저장됨' : '코스 저장'}
            </button>
          )}
        </div>

        <div className={styles.commentsSection}>
          <h3>댓글 ({comments.length})</h3>
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요... (로그인 후 작성 가능)"
              rows="3"
              // disabled={!isUserLoggedIn} // 로그인 상태에 따라 비활성화
            />
            <button type="submit" /*disabled={!isUserLoggedIn}*/>댓글 작성</button>
          </form>
          <ul className={styles.commentList}>
            {comments.map(comment => (
              <li key={comment.id} className={styles.commentItem}>
                <p><strong>{comment.author?.name || comment.author || '익명'}</strong> 
                   <span className={styles.commentDate}>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span></p>
                <p>{comment.content}</p>
              </li>
            ))}
            {comments.length === 0 && <p className={styles.noComments}>아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>}
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default PostPage; 