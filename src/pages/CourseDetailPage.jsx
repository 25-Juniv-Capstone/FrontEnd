/**
 * 커뮤니티 게시글의 여행 코스 상세 페이지
 * 
 * 주요 기능:
 * 1. 여행 코스 정보 표시 (지역, 날짜, 일차별 일정)
 * 2. 구글 지도 연동 및 경로 표시
 * 3. 무장애 시설 정보 표시
 * 4. 좋아요 및 댓글 기능
 */

import React, { useEffect, useState, useRef } from "react";
import "../css/CourseDetailPage.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart, FaComment, FaMapMarkerAlt, FaClock, FaWheelchair, FaInfoCircle, FaUser, FaTrash, FaHashtag, FaRegStickyNote } from 'react-icons/fa';
import { MdDeleteOutline, MdContentCopy } from 'react-icons/md';
import { TbPencilMinus } from 'react-icons/tb';
import { getCourseDetail, toggleLike, getComments, createComment, deleteComment } from '../api/courseApi';
import axiosInstance from '../utils/axiosConfig';
import LoginRequiredModal from './LoginRequiredModal';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ open: false, type: '', place: null });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const commentInputRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울 시청
  const [mapZoom, setMapZoom] = useState(11); // 12에서 11로 변경
  const [selectedPlace, setSelectedPlace] = useState(null);
  const infoWindowRef = useRef(null);
  const pathLine = useRef(null);

  // 구글 지도 API 로드 확인
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // 진입 경로 구분: 커뮤니티에서 오면 댓글/좋아요 보이게, 마이페이지면 숨김
  const isCommunity = true; // 항상 커뮤니티 모드로 설정
  const postTitle = location.state?.postTitle;
  const postId = location.state?.postId; // 게시글 ID 추가

  const [isCourseSaved, setIsCourseSaved] = useState(false);
  const [post, setPost] = useState(null);

  const currentUserId = localStorage.getItem('userId');
  const authorId = post?.userId;

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // 조회수 증가 중복 방지를 위한 state
  const [viewCountIncreased, setViewCountIncreased] = useState(false);

  // 로그인 후에도 게시글 정보 유지를 위한 localStorage 처리
  useEffect(() => {
    // location.state에서 게시글 정보가 있으면 localStorage에 저장
    if (location.state?.postTitle && location.state?.postId) {
      localStorage.setItem('courseDetailPostTitle', location.state.postTitle);
      localStorage.setItem('courseDetailPostId', location.state.postId);
    }
  }, [location.state]);

  // localStorage에서 게시글 정보 복원
  const [restoredPostTitle, setRestoredPostTitle] = useState(null);
  const [restoredPostId, setRestoredPostId] = useState(null);

  useEffect(() => {
    // location.state가 없으면 localStorage에서 복원 시도
    if (!location.state?.postTitle && !location.state?.postId) {
      const savedPostTitle = localStorage.getItem('courseDetailPostTitle');
      const savedPostId = localStorage.getItem('courseDetailPostId');
      
      if (savedPostTitle && savedPostId) {
        setRestoredPostTitle(savedPostTitle);
        setRestoredPostId(savedPostId);
        console.log('localStorage에서 게시글 정보 복원:', savedPostTitle, savedPostId);
      }
    }
  }, [location.state]);

  // 실제 사용할 게시글 정보 (location.state 우선, 없으면 localStorage에서 복원한 값)
  const actualPostTitle = postTitle || restoredPostTitle;
  const actualPostId = postId || restoredPostId;

  // 페이지를 떠날 때 localStorage 정리
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 localStorage에서 게시글 정보 삭제
      localStorage.removeItem('courseDetailPostTitle');
      localStorage.removeItem('courseDetailPostId');
    };
  }, []);

  useEffect(() => {
    // 구글 지도 API 로드 확인
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        console.log('코스 상세 정보 요청 시작 - 코스 ID:', courseId);
        const response = await axiosInstance.get(`/courses/${courseId}`);
        console.log('=== 코스 상세 정보 응답 ===');
        console.log('코스명:', response.data.course_name);
        console.log('이미지 URL:', response.data.course_image_url);
        console.log('지역:', response.data.region);
        console.log('시작일:', response.data.start_date);
        console.log('종료일:', response.data.end_date);
        console.log('일차 수:', response.data.days.length);
        response.data.days.forEach(day => {
          console.log(`=== 일차 ${day.day} ===`);
          day.itinerary.forEach(item => {
            console.log('장소:', item.place_name);
            console.log('시간:', item.time);
            console.log('거리:', item.travel_from_previous.distance);
            console.log('이동시간:', item.travel_from_previous.travel_time);
            console.log('위치:', item.coordinates);
            console.log('무장애 시설:', item.accessibility_features);
            console.log('---');
          });
        });
        console.log('=== 응답 데이터 끝 ===');
        setCourseDetail(response.data);
      } catch (err) {
        console.error('코스 상세 정보 가져오기 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // 게시글 정보 받아오기
  useEffect(() => {
    const fetchPost = async () => {
      if (!actualPostId) return;
      
      try {
        console.log('게시글 정보 요청 - postId:', actualPostId, 'currentUserId:', currentUserId);
        const response = await axiosInstance.get(`/posts/${actualPostId}`);
        console.log('게시글 정보 응답 전체:', response.data);
        console.log('응답 데이터 키들:', Object.keys(response.data));
        console.log('isLiked 상태:', response.data.isLiked);
        console.log('likeCount:', response.data.likeCount);
        
        // isLiked가 없을 경우 기본값 설정
        const isLikedValue = response.data.isLiked !== undefined ? response.data.isLiked : false;
        const likeCountValue = response.data.likeCount || 0;
        
        console.log('설정할 isLiked 값:', isLikedValue);
        console.log('설정할 likeCount 값:', likeCountValue);
        
        setPost(response.data);
        setIsLiked(isLikedValue);
        setLikeCount(likeCountValue);
        
        // isLiked가 undefined이고 로그인된 사용자가 있다면, 좋아요 상태를 별도로 확인
        if (response.data.isLiked === undefined && currentUserId) {
          console.log('좋아요 상태를 별도로 확인합니다.');
          try {
            const likeResponse = await axiosInstance.get(`/posts/liked/${currentUserId}`);
            console.log('사용자 좋아요 목록:', likeResponse.data);
            const isUserLiked = likeResponse.data.some(likedPost => likedPost.postId === parseInt(actualPostId));
            console.log('현재 게시글 좋아요 여부:', isUserLiked);
            setIsLiked(isUserLiked);
          } catch (likeError) {
            console.error('좋아요 상태 확인 실패:', likeError);
          }
        }
      } catch (e) {
        console.error('게시글 정보 불러오기 실패:', e);
      }
    };
    fetchPost();
  }, [actualPostId, currentUserId]);

  // 조회수 증가 (별도 useEffect로 분리)
  useEffect(() => {
    const increaseViewCount = async () => {
      if (!actualPostId || viewCountIncreased) return;
      
      try {
        await axiosInstance.post(`/posts/${actualPostId}/view`);
        setViewCountIncreased(true);
      } catch (viewError) {
        console.error('조회수 증가 실패:', viewError);
      }
    };
    
    increaseViewCount();
  }, [actualPostId, viewCountIncreased]);

  // 댓글 목록 받아오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!actualPostId) return;
      try {
        const response = await axiosInstance.get(`/comments/post/${actualPostId}`);
        setComments(response.data);
      } catch (e) {
        console.error('댓글 목록 불러오기 실패:', e);
      }
    };
    fetchComments();
  }, [actualPostId]);

  // 구글 지도 초기화
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || !courseDetail) {
      console.log('지도 초기화 조건 미충족:', {
        isGoogleMapsLoaded,
        hasMapRef: !!mapRef.current,
        hasCourseData: !!courseDetail
      });
      return;
    }

    console.log('지도 초기화 시작');
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 11, // 12에서 11로 변경
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        gestureHandling: 'greedy', // 마우스 휠로 확대/축소 가능
        draggable: true, // 드래그 가능
        zoomControl: true, // 줌 컨트롤 표시
        mapTypeControl: true, // 지도 타입 컨트롤 표시
        streetViewControl: true, // 스트리트뷰 컨트롤 표시
        fullscreenControl: true // 전체화면 컨트롤 표시
      });

      console.log('지도 생성 성공');
      mapInstance.current = map;

      // 지도 이벤트 리스너
      map.addListener('dragend', () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.lat(), lng: center.lng() });
        console.log('지도 이동:', { lat: center.lat(), lng: center.lng() });
      });

      map.addListener('zoom_changed', () => {
        const zoom = map.getZoom();
        setMapZoom(zoom);
        console.log('지도 줌 변경:', zoom);
      });

      // 기존 마커와 경로 업데이트
      updateMapMarkersAndRoute(selectedDay);

    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error);
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
      if (directionsServiceRef.current) {
        directionsServiceRef.current = null;
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current = null;
      }
    };
  }, [isGoogleMapsLoaded, courseDetail, selectedDay]);

  // selectedDay가 바뀔 때마다 지도 마커와 경로를 갱신
  useEffect(() => {
    if (isGoogleMapsLoaded && mapInstance.current && courseDetail) {
      updateMapMarkersAndRoute(selectedDay);
    }
  }, [selectedDay]);

  // 마커와 경로 업데이트
  const updateMapMarkersAndRoute = (dayNumber) => {
    console.log('마커와 경로 업데이트 시작');
    if (!mapInstance.current) {
      console.error('지도 인스턴스가 없음');
      return;
    }

    // 기존 마커와 경로 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (pathLine.current) {
      pathLine.current.setMap(null);
      pathLine.current = null;
    }

    const currentDay = courseDetail?.days?.find(day => day.day === dayNumber);
    if (!currentDay || !currentDay.itinerary || currentDay.itinerary.length === 0) {
      console.log('일정 데이터가 없음:', currentDay);
      return;
    }

    const places = currentDay.itinerary;
    console.log('장소 목록:', places);
    const pathCoordinates = [];

    // 마커 생성
    places.forEach((place, index) => {
      if (!place.coordinates?.latitude || !place.coordinates?.longitude) {
        console.error('위치 정보가 없는 장소:', place);
        return;
      }

      console.log(`마커 생성 시도: ${place.place_name} (${place.coordinates.latitude}, ${place.coordinates.longitude})`);
      
      try {
        // 장소 타입에 따른 색상 결정
        const color = placeTypeToColor[place.place_type] || "#2196F3";
        
        // SVG 마커 아이콘 생성
        const icon = {
          url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
            <svg width="38" height="38" xmlns="http://www.w3.org/2000/svg">
              <circle cx="19" cy="19" r="17" fill="${color}" stroke="white" stroke-width="3"/>
              <text x="19" y="25" text-anchor="middle" font-size="18" font-family="Arial" font-weight="bold" fill="white">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(38, 38),
          labelOrigin: new window.google.maps.Point(19, 19)
        };

        const marker = new window.google.maps.Marker({
          position: { lat: place.coordinates.latitude, lng: place.coordinates.longitude },
          map: mapInstance.current,
          icon: icon,
          title: place.place_name
        });

        // infoWindow
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="min-width:180px">
              <h3 style="margin:0 0 4px 0;font-size:1.1rem;color:#1976d2;">${place.place_name}</h3>
              <div style="font-size:0.95rem;color:#555;">${place.description || ""}</div>
              <div style="font-size:0.9rem;color:#888;margin-top:4px;">${place.time ? `⏰ ${place.time}` : ""}</div>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
        pathCoordinates.push({ lat: place.coordinates.latitude, lng: place.coordinates.longitude });
      } catch (error) {
        console.error(`마커 생성 실패 (${place.place_name}):`, error);
      }
    });

    // 선(Polyline)으로 연결
    // if (pathCoordinates.length >= 2) {
    //   pathLine.current = new window.google.maps.Polyline({
    //     path: pathCoordinates,
    //     geodesic: true,
    //     strokeColor: "#4285F4",
    //     strokeOpacity: 1.0,
    //     strokeWeight: 3,
    //   });
    //   pathLine.current.setMap(mapInstance.current);
    // }

    // 지도 범위 조정
    try {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        if (place.coordinates?.latitude && place.coordinates?.longitude) {
          bounds.extend(new window.google.maps.LatLng(place.coordinates.latitude, place.coordinates.longitude));
        }
      });
      mapInstance.current.fitBounds(bounds, { padding: 50 });
      console.log('지도 범위 조정 완료');
    } catch (error) {
      console.error('지도 범위 조정 실패:', error);
    }
  };

  // 장소 타입별 색상 매핑
  const placeTypeToColor = {
    "한식당": "#FFC107", // 노란색 - 식당/카페
    "식당": "#FFC107",   // 노란색 - 식당/카페
    "카페": "#FFC107",   // 노란색 - 식당/카페
    "공원": "#2196F3",   // 파란색 - 기타
    "박물관": "#2196F3", // 파란색 - 기타
    "호텔": "#4CAF50",   // 초록색 - 숙소
    "숙박": "#4CAF50",   // 초록색 - 숙소
    "백화점": "#2196F3", // 파란색 - 기타
    "공연예술 극장": "#2196F3", // 파란색 - 기타
    "관광지": "#2196F3", // 파란색 - 기타
    "문화재/박물관": "#2196F3", // 파란색 - 기타
    "공연장/행사장": "#2196F3", // 파란색 - 기타
    "관광지/상점": "#2196F3", // 파란색 - 기타
    "기타": "#2196F3"    // 파란색 - 기타
  };

  // 좋아요 처리
  const handleLike = async () => {
    if (!actualPostId) return;
    
    // 로그인 체크
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      console.log('좋아요 요청 시작 - postId:', actualPostId, 'userId:', currentUserId);
      const response = await axiosInstance.post(`/posts/${actualPostId}/like`, {
        userId: currentUserId,
      });
      
      console.log('좋아요 응답:', response.data);
      
      // API 응답에 따라 상태 업데이트
      if (response.data) {
        // 응답이 객체인 경우 (isLiked, likeCount 포함)
        if (typeof response.data === 'object' && response.data.isLiked !== undefined) {
          console.log('좋아요 상태 업데이트 (객체):', response.data.isLiked, response.data.likeCount);
          setIsLiked(response.data.isLiked);
          setLikeCount(response.data.likeCount);
        } 
        // 응답이 문자열인 경우 ("liked" 또는 "unliked")
        else if (typeof response.data === 'string') {
          const isLikedNow = response.data === 'liked';
          console.log('좋아요 상태 업데이트 (문자열):', isLikedNow, response.data);
          setIsLiked(isLikedNow);
          setLikeCount(prev => prev + (isLikedNow ? 1 : -1));
        }
        // 응답이 boolean인 경우
        else if (typeof response.data === 'boolean') {
          console.log('좋아요 상태 업데이트 (boolean):', response.data);
          setIsLiked(response.data);
          setLikeCount(prev => prev + (response.data ? 1 : -1));
        }
        // 기타 응답 형태
        else {
          console.log('알 수 없는 응답 형태, 상태를 토글합니다:', response.data);
          setIsLiked(prev => !prev);
          setLikeCount(prev => prev + (isLiked ? -1 : 1));
        }
      } else {
        // 응답이 없을 경우 현재 상태를 토글
        console.log('API 응답이 없어서 상태를 토글합니다.');
        setIsLiked(prev => !prev);
        setLikeCount(prev => prev + (isLiked ? -1 : 1));
      }
      
      // 좋아요 처리 후 게시글 정보를 다시 가져와서 최신 상태 반영
      setTimeout(async () => {
        try {
          const refreshResponse = await axiosInstance.get(`/posts/${actualPostId}`);
          console.log('좋아요 후 게시글 정보 새로고침:', refreshResponse.data);
          if (refreshResponse.data.isLiked !== undefined) {
            setIsLiked(refreshResponse.data.isLiked);
            setLikeCount(refreshResponse.data.likeCount || 0);
          }
        } catch (refreshError) {
          console.error('게시글 정보 새로고침 실패:', refreshError);
        }
      }, 100);
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      console.error('에러 상세:', error.response?.data);
      
      // 에러가 발생해도 사용자 경험을 위해 상태를 토글
      console.log('에러 발생으로 인한 상태 토글');
      setIsLiked(prev => !prev);
      setLikeCount(prev => prev + (isLiked ? -1 : 1));
      
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // 로그인 체크
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }
    
    setIsCommentLoading(true);
    try {
      const result = await axiosInstance.post('/comments', {
        postId: actualPostId,
        userId: currentUserId,
        content: newComment.trim(),
      });
      setComments(prev => [result.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment.commentId !== commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 수정 (prompt 사용 예시)
  const handleCommentEdit = async (commentId, oldContent) => {
    const newContent = window.prompt('댓글을 수정하세요', oldContent);
    if (!newContent || newContent.trim() === oldContent) return;
    try {
      const response = await axiosInstance.put(`/comments/${commentId}`, {
        userId: currentUserId,
        content: newContent.trim(),
      });
      setComments(prev => prev.map(comment =>
        comment.commentId === commentId ? { ...comment, content: response.data.content } : comment
      ));
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 여행 기간 표시 문자열 생성
  const getDateDisplay = () => {
    const startDate = courseDetail?.startDate || courseDetail?.start_date;
    const endDate = courseDetail?.endDate || courseDetail?.end_date;
    
    if (!startDate || !endDate) return "날짜 정보 없음";
    
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
  const totalDays = courseDetail?.days?.length || 1;

  // 게시글 저장 핸들러
  const handleSaveCourse = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/kakao/login';
      return;
    }
    if (!post || !post.courseId) {
      alert('코스 정보가 없습니다.');
      return;
    }
    try {
      const saveData = {
        userId,
        courseId: post.courseId,
        title: post.title || post.course_name,
        imageUrl: post.courseImageUrl || post.course_image_url,
        region: post.region,
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

  // 수정 버튼 클릭 시 이동
  const handleEditCourse = () => {
    if (!post || !post.courseId) return;
    window.location.href = `/course-edit/${post.courseId}`;
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    if (!actualPostId) return;
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await axiosInstance.delete(`/posts/${actualPostId}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">에러: {error}</div>;
  }

  if (!courseDetail) {
    return <div className="error">코스 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="course-detail-container">
      {/* 상단 헤더 섹션 */}
      <div className="course-header">
        <div className="header-content">
          <div className="course-title-section">
            <div className="course-title">
              <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {isCommunity ? actualPostTitle : courseDetail?.course_name}
                {isCommunity && post?.content && (
                  <button
                    onClick={() => setIsContentModalOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 6, display: 'inline-flex', alignItems: 'center' }}
                    title="게시글 내용 보기"
                  >
                    <FaRegStickyNote style={{ fontSize: '1.2em', color: '#1976d2' }} />
                  </button>
                )}
              </h1>
            </div>
            <div className="course-meta">
              <div className="meta-row">
                <span className="region">
                  <FaMapMarkerAlt /> {courseDetail?.region}
                </span>
                <span className="date">
                  <FaClock /> {getDateDisplay()}
                </span>
                {courseDetail?.keywords && (
                  <span className="disability-type" style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '1rem', color: '#666' }}>
                    {courseDetail.keywords.split(',').map((kw, idx) => (
                      <span key={idx} style={{ marginRight: 4 }}>#{kw.trim()}</span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* 오른쪽: 좋아요/저장/수정 버튼 */}
          {isCommunity && (
            <div className="course-actions">
              <button 
                className={`like-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={!isCommunity}
              >
                {console.log('좋아요 버튼 렌더링 - isLiked:', isLiked, 'likeCount:', likeCount)}
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span>{likeCount || 0}</span>
              </button>
              {/* 내 userId와 post.userId가 같으면 수정, 다르면 게시글 저장 */}
              {String(currentUserId) === String(authorId) ? (
                <>
                  <button
                    className="delete-course-button"
                    onClick={handleDeletePost}
                    style={{ marginLeft: 8, background: 'none', color: 'inherit', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  >
                    <MdDeleteOutline size={18} />
                  </button>
                </>
              ) : null}
              <button
                className="copy-link-button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('링크가 복사되었습니다!');
                }}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '1.1rem', padding: '4px' }}
              >
                <MdContentCopy size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="course-content">
        {/* 왼쪽 사이드바 */}
        <div className="course-sidebar">
          {/* 일차 선택 탭 */}
          <div className="day-tabs">
            {Array.from({ length: totalDays }, (_, i) => (
              <button
                key={i + 1}
                className={`day-tab ${selectedDay === i + 1 ? 'active' : ''}`}
                onClick={() => setSelectedDay(i + 1)}
              >
                {i + 1}일차
              </button>
            ))}
          </div>

          {/* 일정 목록 */}
          <div className="itinerary-list">
            {currentDay?.itinerary?.map((place, index) => (
              <div key={index} className="itinerary-card">
                <div className="place-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h3>{`${index + 1}. ${place.place_name}`}</h3>
                  </div>
                  <p className="place-type">{place.place_type}</p>
                  <p className="place-description">{place.description}</p>
                </div>
                <div className="place-actions">
                  <button
                    className="info-button"
                    onClick={() => setModalInfo({ open: true, type: 'info', place })}
                  >
                    <FaInfoCircle /> 상세정보
                  </button>
                  <button
                    className="access-button"
                    onClick={() => setModalInfo({ open: true, type: 'accessibility', place })}
                  >
                    <FaWheelchair /> 무장애 정보
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="map-container">
          <div ref={mapRef} className="google-map" />
        </div>
      </div>

      {/* 댓글 섹션 */}
      {isCommunity && (
        <div className="comments-section">
          <div className="comments-header">
            <h3>댓글 {comments.length}개</h3>
          </div>

          {/* 댓글 작성 폼 */}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              disabled={isCommentLoading}
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isCommentLoading}
              className={!newComment.trim() || isCommentLoading ? 'disabled' : ''}
            >
              {isCommentLoading ? '작성 중...' : '댓글 작성'}
            </button>
          </form>

          {/* 댓글 목록 */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.commentId} className="comment-item">
                <div className="comment-header">
                  <div className="comment-user">
                    {comment.userProfileImage ? (
                      <img 
                        src={comment.userProfileImage} 
                        alt={comment.userName} 
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <FaUser />
                      </div>
                    )}
                    <div className="user-info">
                      <span className="user-name">{comment.userName}</span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                  {String(comment.userId) === String(currentUserId) && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="edit-comment"
                        onClick={() => handleCommentEdit(comment.commentId, comment.content)}
                      >
                        <TbPencilMinus />
                      </button>
                      <button
                        className="delete-comment"
                        onClick={() => handleCommentDelete(comment.commentId)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <div className="comment-content">
                  {comment.content}
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="no-comments">
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 장소 정보 모달 */}
      {modalInfo.open && (
        <div className="modal-overlay">
          <div className="info-modal">
            <div className="modal-header">
              <h3>{modalInfo.type === 'info' ? '장소 정보' : '무장애 정보'}</h3>
              <button onClick={() => setModalInfo({ open: false, type: '', place: null })}>✕</button>
            </div>
            <div className="modal-content">
              {modalInfo.type === 'info' && (
                <>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>{modalInfo.place.place_name || modalInfo.place.placeName}</div>
                  <div style={{ color: '#444', fontSize: '0.98rem', marginBottom: '4px' }}>{modalInfo.place.description}</div>
                </>
              )}
              {modalInfo.type === 'accessibility' && (
                <div className="accessibility-info">
                  {(() => {
                    const keyMapping = {
                      'parking': '주차장',
                      'public_transport': '대중교통 접근',
                      'restroom': '화장실',
                      'wheelchair_rental': '휠체어 대여',
                      'elevator': '엘리베이터',
                      'exit': '출입구',
                      'braile_block': '점자블록',
                      'braille_promotion': '점자 안내',
                      'human_guide': '안내요원',
                      'audio_guide': '음성안내',
                      'ticket_office': '매표소',
                      'guide_dog': '안내견',
                      'infants_info_baby_spare_chair': '유아용 의자',
                      'infants_info_stroller': '유모차 대여',
                      'infants_info_lactation_room': '수유실',
                      'infants_info_etc': '유아 편의시설',
                      'visual_impairment_info_guide_dog': '시각장애인 안내견',
                      'visual_impairment_info_human_guide': '시각장애인 안내',
                      'visual_impairment_info_braille_promotion': '시각장애인 점자안내',
                      'facilities_room': '장애인 객실',
                      'facilities_etc': '기타 편의시설'
                    };
                    return Object.entries(modalInfo.place.accessibilityFeatures || modalInfo.place.accessibility_features || {})
                      .filter(([, value]) => value && value !== 'null' && value !== 'undefined' && String(value).trim() !== '')
                      .map(([key, value]) => {
                        let displayValue = value;
                        if (typeof value === 'object' && value !== null) {
                          if (Array.isArray(value)) {
                            displayValue = value.join(', ');
                          } else {
                            displayValue = Object.keys(value).join(', ') || JSON.stringify(value);
                          }
                        } else if (typeof value !== 'string' && typeof value !== 'number') {
                          displayValue = String(value);
                        }
                        const displayKey = keyMapping[key] || key.replace(/_/g, ' ');
                        return (
                          <div key={key} className="accessibility-item">
                            • {displayKey}: {displayValue}
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 게시글 내용 모달 */}
      {isContentModalOpen && (
        <div className="modal-overlay">
          <div className="info-modal">
            <div className="modal-header">
              <h3>작성자의 한줄</h3>
              <button onClick={() => setIsContentModalOpen(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div style={{ whiteSpace: 'pre-line', color: '#333', fontSize: '1rem' }}>{post?.content}</div>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}

export default CourseDetailPage; 