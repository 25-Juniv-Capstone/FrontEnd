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
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaComment, FaMapMarkerAlt, FaClock, FaWheelchair, FaInfoCircle, FaTrash, FaUser } from 'react-icons/fa';
import { getCourseDetail, toggleLike, getComments, createComment, deleteComment } from '../api/courseApi';

// 목데이터
const MOCK_COURSE_DATA = {
  courseId: "1",
  user: {
    userId: "user123",
    userName: "여행자1",
    profileImage: "https://example.com/profile.jpg"
  },
  title: "서울 3일 코스 - 휠체어 이용자를 위한 무장애 여행",
  keywords: "서울, 휠체어, 무장애, 관광",
  courseImageUrl: "https://example.com/course-image.jpg",
  startDate: "2024-03-01",
  endDate: "2024-03-03",
  region: "서울",
  durationDays: 3,
  isRecommended: true,
  createdAt: "2024-02-20T10:00:00Z",
  publicYn: true,
  likeCount: 5,
  isLiked: false,
  days: [
    {
      dayNumber: 1,
      itineraryItems: [
        {
          time: "10:00",
          placeName: "경복궁",
          placeType: "관광지",
          description: "조선왕조 제일의 법궁",
          details: "서울 종로구 사직로 161",
          latitude: 37.5796,
          longitude: 126.9770,
          distance: "0km",
          travelTime: "0분",
          accessibilityFeatures: {
            "휠체어 진입로": "있음",
            "엘리베이터": "있음",
            "장애인 화장실": "있음",
            "점자 안내": "없음",
            "수어 안내": "없음"
          }
        },
        {
          time: "14:00",
          placeName: "인사동",
          placeType: "관광지/상점",
          description: "전통 문화의 거리",
          details: "서울 종로구 인사동길 44",
          latitude: 37.5737,
          longitude: 126.9820,
          distance: "0.8km",
          travelTime: "12분",
          accessibilityFeatures: {
            "휠체어 진입로": "있음",
            "엘리베이터": "일부 있음",
            "장애인 화장실": "있음",
            "점자 안내": "없음",
            "수어 안내": "없음"
          }
        }
      ]
    },
    {
      dayNumber: 2,
      itineraryItems: [
        {
          time: "11:00",
          placeName: "남산타워",
          placeType: "관광지",
          description: "서울의 상징",
          details: "서울 용산구 남산공원길 105",
          latitude: 37.5512,
          longitude: 126.9882,
          distance: "0km",
          travelTime: "0분",
          accessibilityFeatures: {
            "휠체어 진입로": "있음",
            "엘리베이터": "있음",
            "장애인 화장실": "있음",
            "점자 안내": "있음",
            "수어 안내": "있음"
          }
        }
      ]
    }
  ]
};

// 목데이터 댓글
const MOCK_COMMENTS = [
  {
    commentId: "1",
    userId: "user456",
    userName: "여행자2",
    userProfileImage: null,
    content: "정말 유용한 코스네요! 휠체어 이용자분들께 추천드립니다.",
    createdAt: "2024-02-21T15:30:00Z",
    isAuthor: false
  },
  {
    commentId: "2",
    userId: "user789",
    userName: "여행자3",
    userProfileImage: "https://example.com/profile2.jpg",
    content: "경복궁의 무장애 시설이 정말 잘 되어있어요. 편하게 관람할 수 있었습니다.",
    createdAt: "2024-02-22T09:15:00Z",
    isAuthor: false
  }
];

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ open: false, type: '', place: null });
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

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const data = await getComments(courseId);
      setComments(data);
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
    }
  };

  // 코스 데이터 가져오기 (목데이터 사용)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 백엔드 서버가 준비되면 아래 주석을 해제하고 목데이터 부분을 제거하세요
        // const [courseData, commentsData] = await Promise.all([
        //   getCourseDetail(courseId),
        //   getComments(courseId)
        // ]);
        // setCourseData(courseData);
        // setLikeCount(courseData.likeCount || 0);
        // setIsLiked(courseData.isLiked || false);
        // setComments(commentsData);

        // 목데이터 사용
        setCourseData(MOCK_COURSE_DATA);
        setLikeCount(MOCK_COURSE_DATA.likeCount);
        setIsLiked(MOCK_COURSE_DATA.isLiked);
        setComments(MOCK_COMMENTS);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        // 백엔드 서버가 없을 때는 에러 메시지를 표시하지 않음
        // alert('데이터를 불러오는데 실패했습니다.');
        // navigate('/community');
      }
    };

    fetchData();
  }, [courseId, navigate]);

  // 구글 지도 초기화
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || !courseData) {
      console.log('지도 초기화 조건 미충족:', {
        isGoogleMapsLoaded,
        hasMapRef: !!mapRef.current,
        hasCourseData: !!courseData
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
      updateMapMarkersAndRoute();

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
  }, [isGoogleMapsLoaded, courseData, selectedDay]);

  // mapCenter나 mapZoom이 변경될 때 지도 업데이트
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(mapCenter);
      mapInstance.current.setZoom(mapZoom);
    }
  }, [mapCenter, mapZoom]);

  // 마커와 경로 업데이트
  const updateMapMarkersAndRoute = () => {
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

    const currentDay = courseData?.days?.find(day => day.dayNumber === selectedDay);
    if (!currentDay || !currentDay.itineraryItems || currentDay.itineraryItems.length === 0) {
      console.log('일정 데이터가 없음:', currentDay);
      return;
    }

    const places = currentDay.itineraryItems;
    console.log('장소 목록:', places);
    const pathCoordinates = [];

    // 마커 생성
    places.forEach((place, index) => {
      if (!place.latitude || !place.longitude) {
        console.error('위치 정보가 없는 장소:', place);
        return;
      }

      console.log(`마커 생성 시도: ${place.placeName} (${place.latitude}, ${place.longitude})`);
      
      try {
        // 장소 타입에 따른 색상 결정
        const color = placeTypeToColor[place.placeType] || "#2196F3";
        
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
          position: { lat: place.latitude, lng: place.longitude },
          map: mapInstance.current,
          icon: icon,
          title: place.placeName
        });

        // infoWindow
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="min-width:180px">
              <h3 style="margin:0 0 4px 0;font-size:1.1rem;color:#1976d2;">${place.placeName}</h3>
              <div style="font-size:0.95rem;color:#555;">${place.description || ""}</div>
              <div style="font-size:0.9rem;color:#888;margin-top:4px;">${place.time ? `⏰ ${place.time}` : ""}</div>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
        pathCoordinates.push({ lat: place.latitude, lng: place.longitude });
      } catch (error) {
        console.error(`마커 생성 실패 (${place.placeName}):`, error);
      }
    });

    // 선(Polyline)으로 연결
    if (pathCoordinates.length >= 2) {
      pathLine.current = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      pathLine.current.setMap(mapInstance.current);
    }

    // 지도 범위 조정
    try {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        if (place.latitude && place.longitude) {
          bounds.extend(new window.google.maps.LatLng(place.latitude, place.longitude));
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

  // 전역 함수 등록 (마커 인포윈도우의 버튼 클릭 이벤트용)
  useEffect(() => {
    window.showPlaceDetails = (placeName) => {
      const place = courseData?.days
        ?.find(day => day.dayNumber === selectedDay)
        ?.itineraryItems
        ?.find(item => item.placeName === placeName);
      
      if (place) {
        setModalInfo({ open: true, type: 'info', place });
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      }
    };

    window.showAccessibilityInfo = (placeName) => {
      const place = courseData?.days
        ?.find(day => day.dayNumber === selectedDay)
        ?.itineraryItems
        ?.find(item => item.placeName === placeName);
      
      if (place) {
        setModalInfo({ open: true, type: 'accessibility', place });
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      }
    };

    return () => {
      delete window.showPlaceDetails;
      delete window.showAccessibilityInfo;
    };
  }, [courseData, selectedDay]);

  // 좋아요 처리 (목데이터)
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // 백엔드 서버가 준비되면 아래 주석을 해제하세요
    // try {
    //   await toggleLike(courseId);
    // } catch (error) {
    //   console.error('좋아요 처리 실패:', error);
    //   // 실패 시 상태 되돌리기
    //   setIsLiked(!isLiked);
    //   setLikeCount(prev => !isLiked ? prev - 1 : prev + 1);
    // }
  };

  // 댓글 작성 (목데이터)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommentLoading(true);
    try {
      // 백엔드 서버가 준비되면 아래 주석을 해제하고 목데이터 부분을 제거하세요
      // const result = await createComment(courseId, newComment.trim());
      // setComments(prev => [result, ...prev]);

      // 목데이터 사용
      const newCommentData = {
        commentId: Date.now().toString(),
        userId: "currentUser",
        userName: "현재 사용자",
        userProfileImage: null,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        isAuthor: true
      };
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  // 댓글 삭제 (목데이터)
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      // 백엔드 서버가 준비되면 아래 주석을 해제하세요
      // await deleteComment(courseId, commentId);
      setComments(prev => prev.filter(comment => comment.commentId !== commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  // 여행 기간 표시 문자열 생성
  const getDateDisplay = () => {
    const startDate = courseData?.startDate;
    const endDate = courseData?.endDate;
    
    if (!startDate || !endDate) return "날짜 정보 없음";
    
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const currentDay = courseData?.days?.find(day => day.dayNumber === selectedDay);
  const totalDays = courseData?.durationDays || 1;

  return (
    <div className="course-detail-container">
      {/* 상단 헤더 섹션 */}
      <div className="course-header">
        <div className="header-content">
          <div className="course-title-section">
            <h1>{courseData?.title}</h1>
            <div className="course-meta">
              <span className="region">
                <FaMapMarkerAlt /> {courseData?.region}
              </span>
              <span className="date">
                <FaClock /> {getDateDisplay()}
              </span>
            </div>
          </div>
          <div className="course-actions">
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{likeCount}</span>
            </button>
            <button 
              className="comment-button"
              onClick={() => setIsCommentOpen(!isCommentOpen)}
            >
              <FaComment />
              <span>댓글</span>
            </button>
          </div>
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
            {currentDay?.itineraryItems.map((place, index) => (
              <div key={index} className="itinerary-card">
                <div className="itinerary-header">
                  <div className="place-number">{index + 1}</div>
                  <div className="place-time">{place.time}</div>
                </div>
                <div className="place-info">
                  <h3>{place.placeName}</h3>
                  <p className="place-type">{place.placeType}</p>
                  <p className="place-description">{place.description}</p>
                  {place.distance !== "0km" && (
                    <div className="travel-info">
                      <FaClock /> 이동: {place.distance} ({place.travelTime})
                    </div>
                  )}
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
      {isCommentOpen && (
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
                  {comment.isAuthor && (
                    <button
                      className="delete-comment"
                      onClick={() => handleCommentDelete(comment.commentId)}
                    >
                      <FaTrash />
                    </button>
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
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalInfo.type === 'info' ? '장소 상세 정보' : '무장애 시설 정보'}
              </h2>
              <button 
                className="close-button"
                onClick={() => setModalInfo({ open: false, type: '', place: null })}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modalInfo.type === 'info' ? (
                <div className="place-details">
                  <h3>{modalInfo.place.placeName}</h3>
                  <div className="detail-item">
                    <strong>주소:</strong> {modalInfo.place.details}
                  </div>
                  <div className="detail-item">
                    <strong>설명:</strong> {modalInfo.place.description}
                  </div>
                  <div className="detail-item">
                    <strong>장소 유형:</strong> {modalInfo.place.placeType}
                  </div>
                </div>
              ) : (
                <div className="accessibility-details">
                  <h3>무장애 시설 현황</h3>
                  <div className="accessibility-grid">
                    {Object.entries(modalInfo.place.accessibilityFeatures || {}).map(([key, value]) => (
                      <div key={key} className="accessibility-item">
                        <span className="feature-name">{key}</span>
                        <span className={`feature-value ${value === '있음' ? 'available' : 'unavailable'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailPage; 