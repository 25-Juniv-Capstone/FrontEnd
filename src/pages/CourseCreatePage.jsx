/**
 * 무장애 여행 코스 생성/편집 페이지
 * 
 * 주요 기능:
 * 1. 여행 코스 정보 표시 (지역, 날짜, 일차별 일정)
 * 2. 장소 관리 (순서 변경, 삭제)
 * 3. 구글 지도 연동 및 경로 표시
 * 4. 무장애 시설 정보 표시
 */

// 필수 라이브러리 import
import React, { useEffect, useState, useRef } from "react";
import "../css/CourseCreatePage.css"; // 스타일 import
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // 드래그앤드롭 라이브러리
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosConfig';

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

// 장소 타입별 이모지 매핑 - UI에 표시될 아이콘 정의
const placeTypeToEmoji = {
  "한식당": "🍴 식당",
  "식당": "🍴 식당",
  "카페": "☕ 카페",
  "공원": "🏞️ 공원",
  "박물관": "🏛️ 박물관",
  "호텔": "🏨 숙소",
  "숙박": "🏨 숙소",
  "백화점": "🏬 쇼핑",
  "공연예술 극장": "🎭 공연장",
  "관광지": "🗺️ 관광지",
  "문화재/박물관": "🏛️ 박물관",
  "공연장/행사장": "🎭 공연장",
  "관광지/상점": "🗺️ 관광지",
  "기타": "📍 기타"
};

// 테스트용 데이터
const mockCourseData = {
  recommended_courses: [
    {
      course_name: "코스 1: 온 가족을 위한 무장애 맛집 & 바다 여행",
      days: [
        {
          day: 1,
          itinerary: [
            {
              time: "오전 9:00",
              place_name: "나막집",
              place_type: "한식당",
              description: "미쉐린 가이드 선정된 곰탕 맛집",
              coordinates: {
                latitude: 35.1342484706,
                longitude: 129.1125849531
              },
              accessibility_features: {
                wheelchair_accessible_parking: "장애인 주차장 있음 (3면)",
                wheelchair_accessible_restroom: "장애인 화장실 있음"
              }
            },
            {
              time: "오전 11:00",
              place_name: "국립해양박물관",
              place_type: "박물관",
              description: "해양 전시물을 체험할 수 있는 박물관",
              coordinates: {
                latitude: 35.0785402199,
                longitude: 129.0803198368
              },
              accessibility_features: {
                wheelchair_accessible_parking: "장애인 주차장 있음",
                wheelchair_accessible_restroom: "장애인 화장실 있음"
              }
            }
          ]
        },
        {
          day: 2,
          itinerary: [
            {
              time: "오전 9:00",
              place_name: "해운대 해수욕장",
              place_type: "관광지",
              description: "무장애 산책로가 있는 해변",
              coordinates: {
                latitude: 35.1586,
                longitude: 129.1603
              },
              accessibility_features: {
                wheelchair_accessible_path: "무장애 산책로 있음",
                wheelchair_accessible_restroom: "장애인 화장실 있음"
              }
            }
          ]
        },
        {
          day: 3,
          itinerary: [
            {
              time: "오전 9:00",
              place_name: "부산시립박물관",
              place_type: "박물관",
              description: "부산의 역사를 알 수 있는 박물관",
              coordinates: {
                latitude: 35.1531,
                longitude: 129.1183
              },
              accessibility_features: {
                wheelchair_accessible_parking: "장애인 주차장 있음",
                wheelchair_accessible_restroom: "장애인 화장실 있음"
              }
            }
          ]
        }
      ]
    }
  ],
  metadata: {
    region: "부산",
    duration: 3,
    keywords: "무장애, 바다, 가족동반",
    generated_at: "2024-04-02T00:00:48.628817",
    start_date: "2024-04-15",
    end_date: "2024-04-17"
  }
};

// 번호가 크게 보이는 SVG 마커 아이콘 생성 함수
function getNumberedMarkerIcon(number, placeType) {
  const color = placeTypeToColor[placeType] || "#2196F3"; // 기본값을 파란색으로 변경
  return {
    url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
      <svg width="38" height="38" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="17" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="19" y="25" text-anchor="middle" font-size="18" font-family="Arial" font-weight="bold" fill="white">${number}</text>
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(38, 38),
    labelOrigin: new window.google.maps.Point(19, 19)
  };
}

function CourseCreatePage() {
  const location = useLocation();
  const mustVisitPlaces = location.state?.mustVisitPlaces || [];
  const regionFromState = location.state?.region || "사용자 선택";
  const startDate = location.state?.startDate || null;
  const endDate = location.state?.endDate || null;
  const backendCourseData = location.state?.courseData || null;
  const navigate = useNavigate();
  
  console.log('CoursePage received data:', JSON.stringify({
    mustVisitPlaces,
    regionFromState,
    startDate,
    endDate,
    backendCourseData
  }, null, 2));

  // 상태 관리
  const [courseData, setCourseData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [placesByDay, setPlacesByDay] = useState({});
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [region, setRegion] = useState(regionFromState);
  const [dates, setDates] = useState({ startDate, endDate });
  const [isSaving, setIsSaving] = useState(false);  // 저장 상태 추가
  const [openInfoType, setOpenInfoType] = useState({}); // { [place.id]: 'info' | 'accessibility' }
  const [modalInfo, setModalInfo] = useState({ open: false, type: '', place: null });

  // 여행 일수 계산
  const getDateDiff = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.round((e - s) / (1000*60*60*24)) + 1);
  };

  // 초기 데이터 설정
  useEffect(() => {
    if (backendCourseData) {
      // 날짜 정보가 없는 경우 location.state에서 가져온 날짜 사용
      const metadata = {
        ...backendCourseData.metadata,
        start_date: backendCourseData.metadata?.start_date || startDate,
        end_date: backendCourseData.metadata?.end_date || endDate,
        region: backendCourseData.metadata?.region || regionFromState,
        duration: backendCourseData.metadata?.duration || getDateDiff(startDate, endDate)
      };

      const processedData = {
        ...backendCourseData,
        metadata: metadata
      };

      if (processedData.recommended_courses?.[0]?.days) {
        const course = processedData.recommended_courses[0];
        const processedPlaces = {};
        
        course.days.forEach(dayData => {
          if (!dayData.itinerary) return;
          
          processedPlaces[dayData.day] = dayData.itinerary.map((item, index) => {
            // accessibility_features 안전하게 처리
            let accessibilityFeatures = {};
            
            if (item.accessibility_info) {
              // 문자열인 경우 파싱
              if (typeof item.accessibility_info === 'string') {
                try {
                  item.accessibility_info.split(', ').forEach(info => {
                    const [key, value] = info.split(': ');
                    if (key && value) {
                      accessibilityFeatures[key.trim()] = value.trim();
                    }
                  });
                } catch (e) {
                  console.warn('accessibility_info 파싱 실패:', item.accessibility_info);
                }
              }
            } else if (item.accessibility_features) {
              // 객체인 경우 안전하게 복사하고 중첩 객체 평면화
              if (typeof item.accessibility_features === 'object' && item.accessibility_features !== null) {
                // 중첩된 객체들을 평면화하는 함수
                const flattenObject = (obj, prefix = '') => {
                  const flattened = {};
                  
                  Object.entries(obj).forEach(([key, value]) => {
                    // null, undefined, 빈 값들을 미리 필터링
                    if (value === null || 
                        value === undefined || 
                        value === '' || 
                        value === 'null' ||
                        value === 'undefined' ||
                        (typeof value === 'string' && value.trim() === '')) {
                      return; // 이 항목은 건너뛰기
                    }
                    
                    const newKey = prefix ? `${prefix}_${key}` : key;
                    
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                      // 중첩된 객체인 경우 재귀적으로 평면화
                      Object.assign(flattened, flattenObject(value, newKey));
                    } else if (Array.isArray(value)) {
                      // 배열인 경우 빈 배열이 아닐 때만 추가
                      if (value.length > 0) {
                        flattened[newKey] = value.join(', ');
                      }
                    } else {
                      // 일반 값인 경우 그대로 저장
                      flattened[newKey] = value;
                    }
                  });
                  
                  return flattened;
                };
                
                accessibilityFeatures = flattenObject(item.accessibility_features);
              }
            }
            
            return {
              id: `${dayData.day}-${index}`,
              time: item.time || '오전 09:00',
              place_name: item.name || item.place_name || '장소명 없음',
              place_type: item.type || item.place_type || '기타',
              description: item.address || item.description || '',
              lat: item.coordinates?.latitude || item.lat || 0,
              lng: item.coordinates?.longitude || item.lng || 0,
              accessibility_features: accessibilityFeatures,
              rating: item.rating || 0,
              reviews: item.reviews || 0,
              operating_hours: item.operating_hours || {}
            };
          });
        });
        
        setCourseData(processedData);
        setPlacesByDay(processedPlaces);
        setSelectedDay(1);
      } else {
        // 코스 데이터가 없더라도 날짜 정보는 저장
        setCourseData(processedData);
      }
    }
  }, [backendCourseData, startDate, endDate, regionFromState]);

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('Current course state:', JSON.stringify({
      courseData,
      selectedDay,
      placesByDay,
      currentDayPlaces: placesByDay[selectedDay]
    }, null, 2));
  }, [courseData, selectedDay, placesByDay]);

  // 지도 관련 설정
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const pathLine = useRef(null);

  // 지도 초기화 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (window.google && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36.5, lng: 127.8 },
        zoom: 12,
      });
    }
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // mapCenter가 바뀔 때 setCenter만 (지도 생성 후에만)
  const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.8 });
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  // placesByDay가 바뀔 때 첫 장소로 center 이동
  useEffect(() => {
    const currentPlaces = placesByDay[selectedDay] || [];
    if (currentPlaces.length > 0 && currentPlaces[0].lat && currentPlaces[0].lng) {
      setMapCenter({ lat: currentPlaces[0].lat, lng: currentPlaces[0].lng });
    }
  }, [placesByDay, selectedDay]);

  // 지도에 마커(핀) + 선(Polyline) + infoWindow 표시
  useEffect(() => {
    if (!mapInstance.current) return;

    // 기존 마커/선 제거
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    if (pathLine.current) {
      pathLine.current.setMap(null);
      pathLine.current = null;
    }

    const currentPlaces = placesByDay[selectedDay] || [];
    const pathCoordinates = [];

    currentPlaces.forEach((place, idx) => {
      if (!place.lat || !place.lng) return;
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        icon: getNumberedMarkerIcon(idx + 1, place.place_type),
        title: place.place_name,
      });

      // infoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width:180px">
            <h3 style="margin:0 0 4px 0;font-size:1.1rem;color:#1976d2;">${place.place_name}</h3>
            <div style="font-size:0.95rem;color:#555;">${place.description || place.address || ""}</div>
            <div style="font-size:0.9rem;color:#888;margin-top:4px;">${place.time ? `⏰ ${place.time}` : ""}</div>
          </div>
        `
      });
      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
      pathCoordinates.push({ lat: place.lat, lng: place.lng });
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
  }, [selectedDay, placesByDay]);

  // 드래그 앤 드롭으로 장소 순서 변경
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(placesByDay[selectedDay]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlacesByDay({ ...placesByDay, [selectedDay]: items });
  };

  // 장소 삭제 처리
  const handleDelete = (placeId) => {
    const updatedPlaces = placesByDay[selectedDay].filter(
      (place) => place.id !== placeId
    );
    setPlacesByDay({
      ...placesByDay,
      [selectedDay]: updatedPlaces,
    });
  };

  // 시간 문자열을 HH:MM 형식으로 변환
  const formatTimeString = (timeStr) => {
    try {
      console.log("입력된 시간 문자열:", timeStr);
      const [period, time] = timeStr.split(" ");
      console.log("파싱된 시간:", time);
      return time || "09:00";
    } catch (error) {
      console.error("시간 형식 변환 오류:", error);
      return "09:00";
    }
  };

  // 시간 변경 처리
  const handleTimeChange = (placeId, newTime) => {
    try {
      console.log("새로 입력된 시간:", newTime);
      const hours = parseInt(newTime.split(":")[0]);
      const period = hours >= 12 ? "오후" : "오전";
      const formattedTime = `${period} ${newTime}`;
      console.log("저장될 시간:", formattedTime);

      const updatedPlaces = placesByDay[selectedDay].map(place => {
        if (place.id === placeId) {
          return { ...place, time: formattedTime };
        }
        return place;
      });
      
      setPlacesByDay({
        ...placesByDay,
        [selectedDay]: updatedPlaces,
      });
    } catch (error) {
      console.error("시간 변경 오류:", error);
    }
  };

  // 새 장소 추가 처리
  const handleAddPlace = (newPlace) => {
    const currentPlaces = placesByDay[selectedDay] || [];
    const nextId = `${selectedDay}-${currentPlaces.length}`;
    
    setPlacesByDay({
      ...placesByDay,
      [selectedDay]: [...currentPlaces, { ...newPlace, id: nextId }],
    });
  };

  // 날짜 포맷팅 - YYYY.MM.DD 형식으로 변환
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // 여행 기간 표시 문자열 생성
  const getDateDisplay = () => {
    const startDate = courseData?.metadata?.start_date;
    const endDate = courseData?.metadata?.end_date;
    
    if (!startDate || !endDate) return "날짜 정보 없음";
    
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  // 날짜 수정 처리
  const handleDateChange = (startDate, endDate) => {
    setCourseData({
      ...courseData,
      metadata: {
        ...courseData.metadata,
        start_date: startDate,
        end_date: endDate
      }
    });
    setIsDateModalOpen(false);
  };

  // courseData가 없더라도 지도는 항상 렌더링
  const currentDayPlaces = placesByDay[selectedDay] || [];
  const totalDays = courseData?.recommended_courses?.[0]?.days?.length || 1;

  // 시간 문자열을 분 단위로 변환하는 함수 추가
  const convertTimeToMinutes = (timeStr) => {
    try {
      const [period, time] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = (period === '오후' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
      return totalMinutes;
    } catch (error) {
      console.error('시간 변환 오류:', error);
      return 540; // 기본값: 오전 9시
    }
  };

  // 거리 문자열을 숫자(km)로 변환하는 함수 추가
  const convertDistanceToNumber = (distanceStr) => {
    try {
      if (distanceStr.endsWith('m')) {
        return parseFloat(distanceStr) / 1000;
      }
      return parseFloat(distanceStr);
    } catch (error) {
      console.error('거리 변환 오류:', error);
      return 0;
    }
  };

  // 이동 시간 문자열을 분 단위로 변환하는 함수 추가
  const convertDurationToMinutes = (durationStr) => {
    try {
      const match = durationStr.match(/(\d+)분/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      console.error('이동 시간 변환 오류:', error);
      return 0;
    }
  };

  // 코스 저장 함수 수정
  const handleSaveCourse = async () => {
    if (!region) {
      alert('지역을 선택해주세요.');
      return;
    }

    if (!courseData?.metadata?.start_date || !courseData?.metadata?.end_date) {
      alert('여행 기간을 선택해주세요.');
      return;
    }

    // 백엔드 DTO와 DB 스키마에 맞게 데이터 변환
    const courseToSave = {
      title: courseData?.recommended_courses?.[0]?.course_name || `${region} 여행 코스`,
      courseImageUrl: courseData?.recommended_courses?.[0]?.course_image_url || null,  // course_image_url 추가
      region: region,
      startDate: courseData.metadata.start_date,  // YYYY-MM-DD 형식
      endDate: courseData.metadata.end_date,      // YYYY-MM-DD 형식
      durationDays: courseData.metadata.duration || Object.keys(placesByDay).length,
      keywords: courseData?.metadata?.keywords || courseData?.recommended_courses?.[0]?.keywords || '',  // metadata의 keywords 사용
      days: Object.entries(placesByDay).map(([day, places]) => ({
        dayNumber: parseInt(day),
        itinerary: places.map(place => {
          // coordinates 객체가 없는 경우 lat, lng 직접 사용
          const latitude = place.coordinates?.lat || place.lat;
          const longitude = place.coordinates?.lng || place.lng;

          if (!latitude || !longitude) {
            console.error('장소 좌표가 없습니다:', place);
            return null;
          }

          // 시간 형식 변환 (HH:mm -> HH:mm)
          const time = place.time ? place.time.split(' ')[1] || place.time : '09:00';

          // travel_from_previous 정보 가져오기
          const travelInfo = place.travel_from_previous || place.travelInfo || {};

          return {
            time: time,  // VARCHAR(20)
            placeName: place.place_name,  // VARCHAR(255)
            placeType: place.place_type || '기타',  // VARCHAR(50)
            description: place.description || '',  // TEXT
            details: place.details || '',  // TEXT - details 필드 추가
            coordinates: {
              latitude: parseFloat(latitude),  // DECIMAL(10,8)
              longitude: parseFloat(longitude)  // DECIMAL(11,8)
            },
            accessibilityFeatures: Object.entries(place.accessibility_features || {})
              .reduce((acc, [key, value]) => {
                if (value && value !== 'null' && value !== 'undefined' && String(value).trim() !== '') {
                  acc[key] = String(value);  // TEXT로 저장될 값
                }
                return acc;
              }, {}),
            travelFromPrevious: {
              distance: travelInfo.distance || '',  // VARCHAR(50) - travel_from_previous에서 가져옴
              travelTime: travelInfo.travel_time || travelInfo.duration || ''  // VARCHAR(50) - travel_from_previous에서 가져옴
            }
          };
        }).filter(Boolean)  // null 값 제거
      }))
    };

    console.log('Saving course with data:', courseToSave);
    console.log('Start date:', courseToSave.startDate);
    console.log('End date:', courseToSave.endDate);
    console.log('Course image URL:', courseToSave.courseImageUrl);  // 로깅 추가
    console.log('Keywords:', courseToSave.keywords);  // 로깅 추가

    try {
      const response = await axiosInstance.post('/courses', courseToSave);
      console.log('Course saved successfully:', response.data);
      alert('코스가 성공적으로 저장되었습니다.');
      navigate('/mypage');
    } catch (error) {
      console.error('Error saving course:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
        alert(`코스 저장 중 오류가 발생했습니다: ${error.response.data.message || error.response.data}`);
      } else {
        alert('코스 저장 중 오류가 발생했습니다.');
      }
    }
  };

  // 두 지점 간의 거리를 계산하는 함수 (Haversine 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  // 이동 시간을 계산하는 함수 (도보 기준)
  const calculateTravelTime = (lat1, lon1, lat2, lon2) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    if (distance === "시작 지점") return "0분";
    
    // 도보 평균 속도 4km/h 기준
    const distanceInKm = parseFloat(distance);
    const timeInHours = distanceInKm / 4;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    return `약 ${timeInMinutes}분 (도보)`;
  };

  return (
    <div className="course-page">
      <div className="course-main">
        <div className="course-sidebar">
          <h2>{region}</h2>
          <div className="date-section" onClick={() => setIsDateModalOpen(true)}>
            <p className="date">{getDateDisplay && getDateDisplay()}</p>
            <span className="edit-icon">✏️</span>
          </div>

          <div className="day-buttons">
            {Array.from({ length: totalDays }, (_, i) => (
              <button
                key={i + 1}
                className={selectedDay === i + 1 ? "active" : ""}
                onClick={() => setSelectedDay(i + 1)}
              >
                {i + 1}일차
              </button>
            ))}
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="places">
              {(provided) => (
                <div
                  className="course-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {currentDayPlaces.map((place, index) => (
                    <Draggable key={place.id} draggableId={place.id} index={index}>
                      {(provided) => (
                        <div
                          className="course-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="left">
                            <div 
                              className="circle-number" 
                              style={{ backgroundColor: placeTypeToColor[place.place_type] || "#2196F3" }}
                            >
                              {index + 1}
                            </div>
                            <div className="time">{place.time || '--:--'}</div>
                            <div className="title">{place.place_name}</div>
                            <div className="place-type">
                              {placeTypeToEmoji[place.place_type] || "📍 기타"}
                            </div>
                            {/* 버튼만 남김 */}
                            <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                              <button
                                className="info-btn"
                                onClick={() => setModalInfo({ open: true, type: 'info', place })}
                              >장소 정보</button>
                              <button
                                className="access-btn"
                                onClick={() => setModalInfo({ open: true, type: 'accessibility', place })}
                              >무장애 정보</button>
                            </div>
                          </div>
                          <div className="right">
                            <div className="action-buttons">
                              <button onClick={() => handleDelete(place.id)}>🗑️</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* 하단 버튼 영역 */}
          <div className="footer-buttons">
            <button 
              onClick={handleSaveCourse}
              disabled={isSaving}
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                width: '100%',
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              {isSaving ? '저장 중...' : '코스 저장하기'}
            </button>
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              style={{
                backgroundColor: '#34A853',
                color: 'white',
                border: 'none',
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              + 장소 추가
            </button>
          </div>
        </div>
        {/* 오른쪽 패널 - 구글 지도 */}
        <div className="map-area">
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          {!courseData && (
            <div style={{textAlign:'center',marginTop:'3rem'}}>여행지가 없습니다. Select 페이지에서 여행지를 선택해 주세요.</div>
          )}
        </div>
      </div>
      {/* 장소 검색 모달, 날짜 수정 모달 등 기존 코드 복구 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPlaceSelect={handleAddPlace}
        region={region}
        mapInstance={mapInstance.current}
      />
      <DateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onDateChange={handleDateChange}
        startDate={courseData?.metadata?.start_date}
        endDate={courseData?.metadata?.end_date}
      />
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
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>{modalInfo.place.place_name}</div>
                  <div style={{ color: '#444', fontSize: '0.98rem', marginBottom: '4px' }}>{modalInfo.place.description}</div>
                </>
              )}
              {modalInfo.type === 'accessibility' && (
                <div className="accessibility-info">
                  {Object.keys(modalInfo.place.accessibility_features || {}).length === 0 && (
                    <div style={{ color: '#888', fontSize: '0.95rem' }}>무장애 정보가 없습니다.</div>
                  )}
                  {Object.entries(modalInfo.place.accessibility_features || {})
                    .filter(([key, value]) => value && value !== 'null' && value !== 'undefined' && String(value).trim() !== '')
                    .map(([key, value]) => {
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
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 장소 검색 모달 컴포넌트
 * Google Places API를 사용하여 장소를 검색하고 선택할 수 있는 모달
 */
const SearchModal = ({ isOpen, onClose, onPlaceSelect, region, mapInstance }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const placesService = useRef(null);

  // Places 서비스 초기화
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && mapInstance) {
      placesService.current = new window.google.maps.places.PlacesService(mapInstance);
    }
  }, [mapInstance]);

  // 검색 함수
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    if (!placesService.current) {
      console.error("Places 서비스가 초기화되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    const request = {
      query: `${region} ${searchQuery}`,
      fields: ['name', 'geometry', 'types', 'formatted_address']
    };

    placesService.current.textSearch(request, (results, status) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const places = results.map(place => ({
          id: place.place_id,
          place_name: place.name,
          place_type: getPlaceType(place.types),
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          description: place.formatted_address,
          accessibility_features: {
            wheelchair_accessible_parking: "정보 없음",
            wheelchair_accessible_restroom: "정보 없음"
          }
        }));
        setSearchResults(places);
      } else {
        console.error("검색 실패:", status);
        setSearchResults([]);
      }
    });
  };

  // 장소 타입 변환
  const getPlaceType = (types) => {
    if (types.includes('restaurant')) return "한식당";
    if (types.includes('cafe')) return "카페";
    if (types.includes('park')) return "공원";
    if (types.includes('museum')) return "박물관";
    if (types.includes('lodging')) return "호텔";
    if (types.includes('shopping_mall')) return "백화점";
    if (types.includes('tourist_attraction')) return "관광지";
    return "기타";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="search-modal">
        <div className="modal-header">
          <h3>{region} 무장애 여행지 검색</h3>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${region}의 무장애 여행지를 검색해보세요`}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>

        <div className="search-results">
          {searchResults.map((place) => (
            <div
              key={place.id}
              className="search-result-item"
              onClick={() => {
                onPlaceSelect({
                  ...place,
                  time: "09:00",
                });
                onClose();
              }}
            >
              <div>
                <div className="place-name">{place.place_name}</div>
                <div className="place-address">{place.description}</div>
              </div>
              <div className="place-type">{placeTypeToEmoji[place.place_type] || "📍 기타"}</div>
            </div>
          ))}
          {searchResults.length === 0 && searchQuery && !isLoading && (
            <div className="no-results">검색 결과가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 날짜 수정 모달 컴포넌트
 */
const DateModal = ({ isOpen, onClose, onDateChange, startDate, endDate }) => {
  const [newStartDate, setNewStartDate] = useState(startDate);
  const [newEndDate, setNewEndDate] = useState(endDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    onDateChange(newStartDate, newEndDate);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="date-modal">
        <div className="modal-header">
          <h3>여행 날짜 수정</h3>
          <button onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="date-form">
          <div className="date-input-group">
            <label>시작일</label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="date-input-group">
            <label>종료일</label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={newStartDate}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseCreatePage;
