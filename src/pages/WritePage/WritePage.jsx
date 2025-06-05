"use client";
import React, { useState, useEffect } from "react";
// 기존 styles 임포트는 모달 전용 CSS로 변경하거나, 내부 section에 그대로 사용할 수 있습니다.
// import styles from "../../css/writepages/InputDesign.module.css"; 
import modalStyles from "../../css/writepages/ModalWritePage.module.css"; // 모달 전용 CSS (새로 생성)
import PostCreationHeader from "./PostCreationHeader";
import FormContent from "./FormContent";
import ActionButtons from "./ActionButtons";
import axiosInstance from "../../utils/axiosConfig";

function WritePageContent({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState("wheelchair");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자의 여행 코스 목록 가져오기
  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('로그인이 필요합니다.');
          return;
        }
        const response = await axiosInstance.get(`/courses/user/${userId}`);
        console.log('Fetched user courses:', response.data); // 코스 목록 데이터 구조 확인
        setUserCourses(response.data);
      } catch (err) {
        console.error('Error fetching user courses:', err);
        setError('여행 코스 목록을 불러오는데 실패했습니다.');
      }
    };

    if (isOpen) {
      fetchUserCourses();
    }
  }, [isOpen]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (!selectedCourse || !selectedCourse.courseId) {
      alert('여행 코스를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // userId 가져오기 및 검증
      const storedUserId = localStorage.getItem('userId');
      console.log('Stored userId:', storedUserId);
      
      if (!storedUserId) {
        throw new Error('로그인이 필요합니다.');
      }

      // userId에서 공백 제거 및 문자열로 변환
      const userId = String(storedUserId).trim();

      // 디버깅을 위한 로그 추가
      console.log('Selected Course object:', selectedCourse);
      console.log('Course ID type:', typeof selectedCourse.courseId);
      console.log('Course ID value:', selectedCourse.courseId);
      console.log('Course Image URL:', selectedCourse.courseImageUrl);

      // courseId를 확실히 숫자로 변환
      const courseId = Number(selectedCourse.courseId);
      if (isNaN(courseId)) {
        throw new Error('유효하지 않은 코스 ID입니다.');
      }

      const postData = {
        userId: userId,
        courseId: courseId,
        title: title.trim(),
        content: content.trim(),
        courseImageUrl: selectedCourse.imageUrl, // imageUrl을 courseImageUrl로 매핑
        disabilityType: selectedType,
        region: selectedCourse.region
      };

      // 전송되는 데이터 확인
      console.log('Sending post data:', postData);

      const response = await axiosInstance.post('/post', postData);
      console.log('Post created successfully:', response.data);
      alert('게시글이 성공적으로 작성되었습니다.');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      
      if (error.message === '로그인이 필요합니다.') {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
      } else if (error.message === '유효하지 않은 코스 ID입니다.') {
        alert('코스 선택에 문제가 있습니다. 다시 시도해주세요.');
      } else if (error.response?.status === 403) {
        console.error('403 Forbidden - User ID mismatch');
        console.error('Stored userId:', localStorage.getItem('userId'));
        alert('권한이 없습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      } else {
        alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.formContainer}>
      <form onSubmit={handleSubmitForm}>
        {/* 제목 입력 */}
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.formLabel}>제목</label>
          <input
            type="text"
            className={modalStyles.formInput}
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 여행 코스 선택 */}
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.formLabel}>연관 여행 코스 선택</label>
          <select
            className={modalStyles.formInput}
            value={selectedCourse ? selectedCourse.courseId : ''}
            onChange={(e) => {
              const courseId = parseInt(e.target.value);
              if (isNaN(courseId)) {
                setSelectedCourse(null);
                return;
              }
              const course = userCourses.find(c => c.courseId === courseId);
              console.log('Selected course object:', course); // 디버깅용
              if (course) {
                console.log('Course image URL:', course.courseImageUrl); // 이미지 URL 로깅
                if (!course.courseImageUrl) {
                  console.warn('Selected course has no image URL');
                }
              }
              setSelectedCourse(course);
            }}
            disabled={loading}
          >
            <option value="">여행 코스를 선택해주세요</option>
            {userCourses.map(course => (
              <option key={course.courseId} value={course.courseId}>
                {course.title} ({course.region})
              </option>
            ))}
          </select>
        </div>

        {/* 장애 유형 선택 */}
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.formLabel}>장애 유형</label>
          <select
            className={modalStyles.formInput}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={loading}
          >
            <option value="wheelchair">휠체어 이용자</option>
            <option value="visual">시각 장애인</option>
            <option value="hearing">청각 장애인</option>
          </select>
        </div>

        {/* 내용 입력 */}
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.formLabel}>내용</label>
          <textarea
            className={`${modalStyles.formInput} ${modalStyles.formTextarea}`}
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 에러 메시지 표시 */}
        {error && (
          <div className={modalStyles.errorMessage}>
            {error}
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className={modalStyles.buttonGroup}>
          <button
            type="button"
            className={`${modalStyles.button} ${modalStyles.cancelButton}`}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className={`${modalStyles.button} ${modalStyles.submitButton}`}
            disabled={loading}
          >
            {loading ? '작성 중...' : '작성하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WritePageContent;
