import axiosInstance from '../utils/axiosConfig';

// 기존 API 함수들...

// 코스 상세 정보 조회
export const getCourseDetail = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('코스 상세 정보 조회 실패:', error);
    throw error;
  }
};

// 좋아요 토글
export const toggleLike = async (courseId) => {
  try {
    const response = await axiosInstance.post(`/courses/${courseId}/like`);
    return response.data;
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    throw error;
  }
};

// 댓글 목록 조회
export const getComments = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/courses/${courseId}/comments`);
    return response.data;
  } catch (error) {
    console.error('댓글 목록 조회 실패:', error);
    throw error;
  }
};

// 댓글 작성
export const createComment = async (courseId, content) => {
  try {
    const response = await axiosInstance.post(`/courses/${courseId}/comments`, { content });
    return response.data;
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (courseId, commentId) => {
  try {
    const response = await axiosInstance.delete(`/courses/${courseId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    throw error;
  }
};

// 코스 삭제
export const deleteCourse = async (courseId) => {
  try {
    const response = await axiosInstance.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('코스 삭제 실패:', error);
    throw error;
  }
}; 