/**
 * 마이페이지에서 코스 수정을 위한 페이지
 * 
 * 주요 기능:
 * 1. 기존 코스 정보 불러오기 (DB에서)
 * 2. 코스 정보 수정 (제목, 지역, 날짜)
 * 3. 일정 수정 (장소 추가/삭제/순서 변경)
 * 4. 구글 지도 연동 및 경로 표시
 * 5. 수정된 코스 저장
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import "../css/CourseCreatePage.css";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axiosInstance from '../utils/axiosConfig';
import { LiaToggleOnSolid, LiaToggleOffSolid } from "react-icons/lia";
import { FaInfoCircle, FaWheelchair, FaPlus, FaSave, FaArrowLeft } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { IoTrashBinOutline } from "react-icons/io5";

// 장소 타입별 색상 매핑
const placeTypeToColor = {
  "한식당": "#FFC107",
  "식당": "#FFC107",
  "카페": "#FFC107",
  "공원": "#2196F3",
  "박물관": "#2196F3",
  "호텔": "#4CAF50",
  "숙박": "#4CAF50",
  "백화점": "#2196F3",
  "공연예술 극장": "#2196F3",
  "관광지": "#2196F3",
  "문화재/박물관": "#2196F3",
  "공연장/행사장": "#2196F3",
  "관광지/상점": "#2196F3",
  "기타": "#2196F3"
};

// 장소 타입별 이모지 매핑
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

// 시간 수정 모달 컴포넌트
const TimeModal = ({ isOpen, onClose, onTimeChange, currentTime, placeName, isNewPlace }) => {
  const [time, setTime] = useState(currentTime);

  useEffect(() => {
    if (isOpen) {
      setTime(currentTime);
    }
  }, [isOpen, currentTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onTimeChange(time);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="time-modal">
        <div className="modal-header">
          <div className="header-content">
            <h3>{isNewPlace ? '장소 방문 시간 설정' : '방문 시간 수정'}</h3>
            <div className="header-subtitle">{placeName}</div>
          </div>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="time-form">
          <div className="time-input-group">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input"
              required
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

// 날짜 수정 모달 컴포넌트
const DateModal = ({ isOpen, onClose, onDateChange, startDate, endDate }) => {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  useEffect(() => {
    if (isOpen) {
      setStart(startDate);
      setEnd(endDate);
    }
  }, [isOpen, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onDateChange(start, end);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="date-modal">
        <div className="modal-header">
          <h3>여행 날짜 수정</h3>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="date-form">
          <div className="date-input-group">
            <label>시작일</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>
          <div className="date-input-group">
            <label>종료일</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              min={start}
              required
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

/**
 * 장소 검색 모달 컴포넌트
 * Google Places API를 사용하여 장소를 검색하고 선택할 수 있는 모달
 */
const SearchModal = ({ isOpen, onClose, onPlaceSelect, region, mapInstance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const placesService = useRef(null);

  useEffect(() => {
    if (isOpen && mapInstance) {
      placesService.current = new window.google.maps.places.PlacesService(mapInstance);
    }
  }, [isOpen, mapInstance]);

  const categories = [
    { id: 'all', label: '전체', emoji: '🔍' },
    { id: 'restaurant', label: '식당', emoji: '🍴' },
    { id: 'cafe', label: '카페', emoji: '☕' },
    { id: 'attraction', label: '관광지', emoji: '🗺️' },
    { id: 'museum', label: '박물관', emoji: '🏛️' },
    { id: 'park', label: '공원', emoji: '🏞️' },
    { id: 'shopping', label: '쇼핑', emoji: '🛍️' }
  ];

  const getPlaceDetails = (placeId) => {
    return new Promise((resolve, reject) => {
      if (!placesService.current) {
        reject(new Error('Places 서비스가 초기화되지 않았습니다.'));
        return;
      }

      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry', 'types', 'wheelchair_accessible_entrance', 'wheelchair_accessible_parking', 'wheelchair_accessible_restroom', 'elevator', 'ramp']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const transformedPlace = {
              id: placeId,
              place_name: place.name,
              place_type: getPlaceType(place.types),
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              description: place.formatted_address,
              accessibility_features: {
                wheelchair_accessible_entrance: place.wheelchair_accessible_entrance || '정보 없음',
                wheelchair_accessible_parking: place.wheelchair_accessible_parking || '정보 없음',
                wheelchair_accessible_restroom: place.wheelchair_accessible_restroom || '정보 없음',
                elevator: place.elevator || '정보 없음',
                ramp: place.ramp || '정보 없음'
              }
            };
            resolve(transformedPlace);
          } else {
            reject(new Error(`장소 상세 정보를 가져오는데 실패했습니다: ${status}`));
          }
        }
      );
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    if (!placesService.current) {
      console.error("Places 서비스가 초기화되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    const request = {
      query: `${region} ${searchQuery} 무장애`,
      fields: ['name', 'geometry', 'types', 'formatted_address', 'place_id'],
      location: mapInstance.getCenter(),
      radius: 5000
    };

    placesService.current.textSearch(request, (results, status) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const filteredResults = results.filter(place => {
          if (selectedCategory === "all") return true;
          return place.types.some(type => {
            switch (selectedCategory) {
              case "restaurant": return type.includes("restaurant");
              case "cafe": return type.includes("cafe");
              case "attraction": return type.includes("tourist_attraction");
              case "museum": return type.includes("museum");
              case "park": return type.includes("park");
              case "shopping": return type.includes("shopping_mall");
              default: return true;
            }
          });
        });

        const places = filteredResults.map(place => ({
          id: place.place_id,
          place_name: place.name,
          place_type: getPlaceType(place.types),
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          description: place.formatted_address,
          accessibility_features: {
            wheelchair_accessible_parking: "정보 없음",
            wheelchair_accessible_restroom: "정보 없음",
            elevator: "정보 없음",
            ramp: "정보 없음"
          }
        }));

        setSearchResults(places);
      } else {
        console.error("검색 실패:", status);
        setSearchResults([]);
      }
    });
  };

  const handlePlaceSelect = async (place) => {
    try {
      setIsDetailLoading(true);
      const detailedPlace = await getPlaceDetails(place.id);
      onPlaceSelect({
        ...place,
        ...detailedPlace
      });
      onClose();
    } catch (error) {
      console.error("장소 상세 정보를 가져오는데 실패했습니다:", error);
      onPlaceSelect(place);
      onClose();
    } finally {
      setIsDetailLoading(false);
    }
  };

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
          <div className="header-content">
            <h3>장소를 검색하고 코스에 추가해보세요</h3>
          </div>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        <div className="search-container">
        <div className="search-box">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${region}의 무장애 여행지를 검색해보세요`}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-button"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
          </button>
              )}
            </div>
            <button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim()}
              className="search-button"
            >
              검색
            </button>
          </div>

          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              >
                <span className="category-emoji">{category.emoji}</span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="search-results">
          {searchResults.map((place) => (
            <div
              key={place.id}
              className="search-result-item"
              onClick={() => handlePlaceSelect(place)}
            >
              <div className="place-info">
                <div className="place-header">
                  <span className="place-type-badge">
                    {placeTypeToEmoji[place.place_type] || "📍"}
                  </span>
                  <h4 className="place-name">{place.place_name}</h4>
                </div>
                <div className="place-address">{place.description}</div>
                <div className="accessibility-info">
                  <span className="accessibility-tag">
                    <span className="tag-icon">♿</span>
                    무장애 시설
                  </span>
                  <span className="accessibility-tag">
                    <span className="tag-icon">🅿️</span>
                    주차 가능
                  </span>
              </div>
              </div>
              <button 
                className="add-place-button"
                disabled={isDetailLoading}
              >
                추가하기
              </button>
            </div>
          ))}
          {searchResults.length === 0 && searchQuery && !isLoading && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <p>검색 결과가 없습니다</p>
              <p className="no-results-suggestion">
                다른 검색어로 시도해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 시간 입력 모달 컴포넌트
const AddPlaceTimeModal = ({ isOpen, onClose, onConfirm, placeName }) => {
  const [hours, setHours] = useState("09");
  const [minutes, setMinutes] = useState("00");

  useEffect(() => {
    if (isOpen) {
      setHours("09");
      setMinutes("00");
    }
  }, [isOpen]);

  const handleHoursChange = (e) => {
    const value = e.target.value;
    // 0-23 사이의 숫자만 입력 가능
    if (value === "" || (/^[0-9]{1,2}$/.test(value) && parseInt(value) <= 23)) {
      setHours(value);
    }
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    // 0-59 사이의 숫자만 입력 가능
    if (value === "" || (/^[0-9]{1,2}$/.test(value) && parseInt(value) <= 59)) {
      setMinutes(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 시간과 분이 비어있지 않은 경우에만 처리
    if (hours && minutes) {
      const time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      onConfirm(time);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="time-modal">
        <div className="modal-header">
          <div className="header-content">
            <h3>방문 시간 설정</h3>
            <div className="header-subtitle">{placeName}</div>
          </div>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="time-form">
          <div className="time-input-group">
            <div className="time-input-container">
              <input
                type="text"
                value={hours}
                onChange={handleHoursChange}
                className="time-input-field"
                placeholder="00"
                maxLength={2}
                required
              />
              <span className="time-separator">:</span>
              <input
                type="text"
                value={minutes}
                onChange={handleMinutesChange}
                className="time-input-field"
                placeholder="00"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" disabled={!hours || !minutes}>확인</button>
          </div>
        </form>
      </div>
    </div>
  );
};

function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // 코스 기본 정보
  const [courseName, setCourseName] = useState('');
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 모달 상태
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedPlaceForTime, setSelectedPlaceForTime] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ open: false, type: '', place: null });
  const [showRoutes, setShowRoutes] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAddPlaceTimeModalOpen, setIsAddPlaceTimeModalOpen] = useState(false);
  const [selectedPlaceToAdd, setSelectedPlaceToAdd] = useState(null);
  const [timeModalMode, setTimeModalMode] = useState('edit');
  
  // 지도 관련
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const markersRef = useRef([]);
  const directionsRenderersRef = useRef([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // 경로 색상 정보를 저장할 상태 추가
  const [routeColorsByPlace, setRouteColorsByPlace] = useState({});

  const currentUserId = localStorage.getItem('userId');

  // 구글 지도 API 로드 확인
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, []);

  // 코스 정보 불러오기 (DB에서)
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        console.log('코스 상세 정보 요청 시작 - 코스 ID:', courseId);
        const response = await axiosInstance.get(`/courses/${courseId}`);
        console.log('=== 코스 상세 정보 응답 ===');
        console.log('코스명:', response.data.course_name);
        console.log('지역:', response.data.region);
        console.log('시작일:', response.data.start_date);
        console.log('종료일:', response.data.end_date);
        console.log('일차 수:', response.data.days.length);
        
        const courseData = response.data;
        
        // 장소 데이터에 id 필드 추가
        const processedCourseData = {
          ...courseData,
          days: courseData.days.map(day => ({
            ...day,
            itinerary: day.itinerary.map((place, index) => ({
              ...place,
              id: place.id || `${day.day}-${index}` // id가 없으면 생성
            }))
          }))
        };
        
        setCourseDetail(processedCourseData);
        setCourseName(processedCourseData.course_name || '');
        setRegion(processedCourseData.region || '');
        setStartDate(processedCourseData.start_date || '');
        setEndDate(processedCourseData.end_date || '');
        
        console.log('=== 응답 데이터 끝 ===');
      } catch (err) {
        console.error('코스 정보 가져오기 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // 지도 관련 설정
  useEffect(() => {
    const initializeMap = () => {
      const mapDiv = document.getElementById("map");
      if (!mapDiv) {
        setTimeout(initializeMap, 100);
        return;
      }
      if (!mapInstance.current) {
        const mapOptions = {
          center: { lat: 36.5, lng: 127.8 },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };
        try {
          mapInstance.current = new window.google.maps.Map(mapDiv, mapOptions);
          // Directions 서비스와 렌더러 초기화
          directionsService.current = new window.google.maps.DirectionsService();
          directionsRenderer.current = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: '#FF0000',
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });
          if (directionsRenderer.current) {
            directionsRenderer.current.setMap(mapInstance.current);
          }
        } catch (error) {
          console.error('지도 생성 중 오류 발생:', error);
        }
      }
    };
    initializeMap();
    return () => {
      if (mapInstance.current) mapInstance.current = null;
      if (directionsService.current) directionsService.current = null;
      if (directionsRenderer.current) directionsRenderer.current = null;
    };
  }, []);

  // 마커와 경로 업데이트
  const updateMapMarkersAndRoute = (dayNumber) => {
    if (!mapInstance.current) return;

    // 기존 마커와 경로 제거
    clearMarkers();
    clearDirectionsRenderers();

    const currentDay = courseDetail?.days?.find(day => day.day === dayNumber);
    if (!currentDay || !currentDay.itinerary || currentDay.itinerary.length === 0) return;

    const places = currentDay.itinerary;
    const pathCoordinates = [];

    // 마커 생성
    places.forEach((place, index) => {
      // 좌표 접근 방식 수정 - coordinates 객체 또는 직접 필드
      const lat = place.coordinates?.latitude || place.latitude;
      const lng = place.coordinates?.longitude || place.longitude;
      
      if (!lat || !lng) {
        console.warn('좌표 정보가 없는 장소:', place.place_name);
        return;
      }

      const newMarker = createMarker(place, index, lat, lng);
      if (newMarker) {
        markersRef.current.push(newMarker);
      }
      pathCoordinates.push({ lat: lat, lng: lng });
    });

    // 경로 그리기
    if (pathCoordinates.length >= 2) {
      drawRoute(pathCoordinates);
    }

    // 지도 범위 조정
    if (pathCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      pathCoordinates.forEach(coord => bounds.extend(coord));
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  };

  // 마커 생성
  const createMarker = (place, index, lat, lng) => {
    const color = placeTypeToColor[place.place_type] || "#2196F3";
    
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

    return new window.google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: mapInstance.current,
      icon: icon,
      title: place.place_name
    });
  };

  // 마커 제거
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // 경로 렌더러 제거
  const clearDirectionsRenderers = () => {
    directionsRenderersRef.current.forEach(renderer => renderer.setMap(null));
    directionsRenderersRef.current = [];
  };

  // 경로 그리기
  const drawRoute = (pathCoordinates) => {
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 3
      }
    });

    directionsRenderer.setMap(mapInstance.current);
    directionsRenderersRef.current.push(directionsRenderer);

    if (pathCoordinates.length >= 2) {
      const waypoints = pathCoordinates.slice(1, -1).map(coord => ({
        location: new window.google.maps.LatLng(coord.lat, coord.lng),
        stopover: true
      }));

      const request = {
        origin: new window.google.maps.LatLng(pathCoordinates[0].lat, pathCoordinates[0].lng),
        destination: new window.google.maps.LatLng(pathCoordinates[pathCoordinates.length - 1].lat, pathCoordinates[pathCoordinates.length - 1].lng),
        waypoints: waypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      });
    }
  };

  // 드래그 앤 드롭 처리
  const handlePlaceOrderChange = (result) => {
    if (!result.destination) return;

    const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
    if (!currentDay) return;

    const items = Array.from(currentDay.itinerary);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 시간 교환
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // 시간이 있는 경우에만 교환
    if (items[sourceIndex]?.time && items[destIndex]?.time) {
      const tempTime = items[sourceIndex].time;
      items[sourceIndex] = { ...items[sourceIndex], time: items[destIndex].time };
      items[destIndex] = { ...items[destIndex], time: tempTime };
    }

    const updatedCourseDetail = {
      ...courseDetail,
      days: courseDetail.days.map(day => 
        day.day === selectedDay ? { ...day, itinerary: items } : day
      )
    };

    setCourseDetail(updatedCourseDetail);
  };

  // 장소 삭제
  const handleDeletePlace = (placeId) => {
    if (!window.confirm('이 장소를 삭제하시겠습니까?')) return;

    const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
    if (!currentDay) return;

    const updatedItinerary = currentDay.itinerary.filter(place => place.id !== placeId);
    
    const updatedCourseDetail = {
      ...courseDetail,
      days: courseDetail.days.map(day => 
        day.day === selectedDay ? { ...day, itinerary: updatedItinerary } : day
      )
    };

    setCourseDetail(updatedCourseDetail);
  };

  // 시간 수정
  const handleTimeChange = (newTime) => {
    if (!selectedPlaceForTime) return;

    const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
    if (!currentDay) return;

    const updatedItinerary = currentDay.itinerary.map(place => 
      place.id === selectedPlaceForTime.id ? { ...place, time: newTime } : place
    );

    const updatedCourseDetail = {
      ...courseDetail,
      days: courseDetail.days.map(day => 
        day.day === selectedDay ? { ...day, itinerary: updatedItinerary } : day
      )
    };

    setCourseDetail(updatedCourseDetail);
    setSelectedPlaceForTime(null);
  };

  // 날짜 수정
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // 코스 수정 완료
  const handleUpdateCourse = async () => {
    if (!courseName.trim() || !region.trim() || !startDate || !endDate) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // 백엔드가 기대하는 CourseCreateRequest 형식으로 변환
      const updatedCourse = {
        title: courseName,                    // course_name -> title
        courseImageUrl: courseDetail.course_image_url, // 기존 이미지 URL 유지
        region: region,
        startDate: startDate,                 // start_date -> startDate
        endDate: endDate,                     // end_date -> endDate
        durationDays: courseDetail.days.length, // 일차 수
        keywords: courseDetail.keywords,      // 기존 키워드 유지
        days: courseDetail.days.map(day => ({
          dayNumber: day.day,                 // day -> dayNumber
          itinerary: day.itinerary.map(place => ({
            time: place.time || "",
            placeName: place.place_name || "", // place_name -> placeName
            placeType: place.place_type || "", // place_type -> placeType
            description: place.description || "",
            details: place.details || "",
            coordinates: {
              // 백엔드에서 받아온 좌표 데이터 형식에 맞게 처리
              latitude: place.coordinates?.latitude || place.latitude || 0,
              longitude: place.coordinates?.longitude || place.longitude || 0
            },
            accessibilityFeatures: place.accessibility_features || {},
            travelFromPrevious: place.travel_from_previous || null
          }))
        }))
      };

      await axiosInstance.put(`/courses/${courseId}`, updatedCourse);
      alert('코스가 성공적으로 수정되었습니다.');
      navigate('/mypage');
    } catch (error) {
      console.error('코스 수정 실패:', error);
      alert('코스 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
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

  // 여행 기간 표시
  const getDateDisplay = () => {
    if (!startDate || !endDate) return "날짜 정보 없음";
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  // 장소 카드 렌더링
  const renderPlaceCard = (place, index) => (
    <Draggable key={place.id || `place-${index}`} draggableId={(place.id || `place-${index}`).toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`course-card ${snapshot.isDragging ? 'dragging' : ''} ${snapshot.draggingOver ? 'drag-over' : ''}`}
          style={{
            ...provided.draggableProps.style,
            borderLeft: showRoutes && routeColorsByPlace[place.id] ? `4px solid ${routeColorsByPlace[place.id]}` : 'none'
          }}
        >
          <div className="left">
            <div 
              className="circle-number" 
              style={{ backgroundColor: placeTypeToColor[place.place_type] || "#2196F3" }}
            >
              {index + 1}
            </div>
            <div className="time" style={{ fontSize: '1.1rem', fontWeight: '500' }}>{place.time || '--:--'}</div>
            <div className="title" style={{ fontSize: '1.2rem', fontWeight: '600' }}>{place.place_name}</div>
            <div className="place-type" style={{ 
              fontSize: '1.1rem', 
              fontWeight: '500',
              color: placeTypeToColor[place.place_type] || "#2196F3"
            }}>
              {placeTypeToEmoji[place.place_type] || "📍 기타"}
            </div>
            <div className="button-group">
              <button
                className="info-btn"
                onClick={() => setModalInfo({ open: true, type: 'info', place })}
              >
                <FaInfoCircle /> 상세정보
              </button>
              <button
                className="access-btn"
                onClick={() => setModalInfo({ open: true, type: 'accessibility', place })}
              >
                <FaWheelchair /> 무장애 정보
              </button>
            </div>
          </div>
          <div className="right">
            <div className="action-buttons">
              <button onClick={() => handleDeletePlace(place.id)}>
                <IoTrashBinOutline size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  // Directions API를 Promise로 감싸는 헬퍼 함수
  const getDirections = (directionsService, request) => {
    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Directions 요청 실패: ${status}`));
        }
      });
    });
  };

  // 시간을 비교하기 위한 정렬 함수 추가
  const compareTimes = (timeA, timeB) => {
    // 오전/오후 형식의 시간을 24시간제로 변환
    const convertTo24Hour = (time) => {
      if (!time) return 0;
      if (time.includes('오전') || time.includes('오후')) {
        const [period, timeStr] = time.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        const hour = period === '오후' && hours !== 12 ? hours + 12 : 
                    period === '오전' && hours === 12 ? 0 : hours;
        return hour * 60 + minutes;
      }
      // 일반 24시간제 형식
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    return convertTo24Hour(timeA) - convertTo24Hour(timeB);
  };

  // 장소 추가 처리
  const handleAddPlace = (newPlace) => {
    setSelectedPlace(newPlace);
    setTimeModalMode('add');
    setIsTimeModalOpen(true);
  };

  // 시간 설정 확인 처리
  const handleTimeConfirm = (time) => {
    if (!selectedPlaceToAdd) return;

    const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
    if (!currentDay) return;

    const currentPlaces = currentDay.itinerary || [];
    const nextId = `${selectedDay}-${currentPlaces.length}`;
    
    const placeWithTime = {
      ...selectedPlaceToAdd,
      id: nextId,
      time: time
    };
    
    const updatedItinerary = [...currentPlaces, placeWithTime];
    
    const updatedCourseDetail = {
      ...courseDetail,
      days: courseDetail.days.map(day => 
        day.day === selectedDay ? { ...day, itinerary: updatedItinerary } : day
      )
    };

    setCourseDetail(updatedCourseDetail);
    setSelectedPlaceToAdd(null);
  };

  // 경로 표시/숨김 처리 함수
  const toggleRoutes = useCallback(() => {
    setShowRoutes(prev => !prev);
    if (!showRoutes) {
      // 경로 표시 모드로 전환 시 경로 계산
      const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
      if (currentDay?.itinerary && currentDay.itinerary.length >= 2) {
        calculateRoute(currentDay.itinerary);
      }
    } else {
      // 경로 숨김 모드로 전환 시 경로 제거
      clearDirectionsRenderers();
    }
  }, [showRoutes, selectedDay, courseDetail]);

  // 경로 계산 함수
  const calculateRoute = useCallback(async (places) => {
    if (!places || places.length < 2) return;
    if (!mapInstance.current) {
      console.log('지도 인스턴스가 아직 초기화되지 않음');
      return;
    }

    // 기존 마커와 경로 제거
    clearMarkers();
    clearDirectionsRenderers();

    // 마커 생성
    places.forEach((place, index) => {
      const lat = place.coordinates?.latitude || place.lat;
      const lng = place.coordinates?.longitude || place.lng;
      
      if (!lat || !lng) {
        console.warn(`장소 "${place.place_name}"의 좌표가 없습니다:`, place);
        return;
      }

      const newMarker = createMarker(place, index, lat, lng);
      if (newMarker) {
        markersRef.current.push(newMarker);
      }
    });

    // 연속된 장소들 사이의 경로를 개별적으로 계산
    const travelModes = [
      window.google.maps.TravelMode.TRANSIT
    ];

    // 코스 순서별 색상 정의
    const routeColors = [
      '#4285F4', // Google Blue
      '#EA4335', // Google Red
      '#FBBC05', // Google Yellow
      '#34A853', // Google Green
      '#9C27B0', // Purple
      '#FF9800', // Orange
      '#795548', // Brown
      '#607D8B'  // Blue Grey
    ];
    
    // 장소별 경로 색상 정보 초기화
    const newRouteColorsByPlace = {};

    // 연속된 장소들 사이의 경로 계산
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];
      const routeColor = routeColors[i % routeColors.length];
      
      const originLat = origin.coordinates?.latitude || origin.lat;
      const originLng = origin.coordinates?.longitude || origin.lng;
      const destLat = destination.coordinates?.latitude || destination.lat;
      const destLng = destination.coordinates?.longitude || destination.lng;

      // 대중교통 경로 계산 시도
      for (const mode of travelModes) {
        try {
          const request = {
            origin: new window.google.maps.LatLng(originLat, originLng),
            destination: new window.google.maps.LatLng(destLat, destLng),
            travelMode: mode
          };

          const result = await getDirections(new window.google.maps.DirectionsService(), request);
          
          // 대중교통 경로가 있는 경우에만 색상 정보 저장
          newRouteColorsByPlace[origin.id] = routeColor;
          newRouteColorsByPlace[destination.id] = routeColor;

          // 경로 렌더링
          const renderer = new window.google.maps.DirectionsRenderer({
            map: mapInstance.current,
            directions: result,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: routeColor,
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });

          directionsRenderersRef.current.push(renderer);
          break;
        } catch (error) {
          console.warn(`${mode} 모드로 경로 계산 실패:`, error);
        }
      }
    }

    // 경로 색상 정보 업데이트
    setRouteColorsByPlace(newRouteColorsByPlace);

    // 모든 마커가 보이도록 지도 범위 조정
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.current.fitBounds(bounds);
    }
  }, []);

  // CSS 추가
  const styles = `
  .route-toggle-section {
    margin: 10px 0;
  }

  .route-toggle-btn {
    font-weight: 500;
  }

  .route-toggle-btn:hover {
    opacity: 0.8;
  }

  .route-toggle-btn.active {
    color: #4285F4;
  }

  .title-modal {
    background: white;
    border-radius: 8px;
    padding:  5px 30px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .title-form {
    display: flex;
    flex-direction: column;
  }

  .title-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title-input-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }

  .title-input-group input:focus {
    outline: none;
    border-color: #4285F4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .modal-buttons button {
    padding: 12px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .modal-buttons button[type="button"] {
    background-color: #f1f3f4;
    color: #202124;
  }

  .modal-buttons button[type="submit"] {
    background-color: #4285F4;
    color: white;
  }

  .modal-buttons button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .modal-buttons button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .loading-content {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .loading-content p {
    margin: 12px 0 0 0;
    color: #666;
    font-size: 0.9rem;
  }

  .add-place-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .add-place-button .loading-spinner {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  .time-input-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .time-input-field {
    width: 60px;
    height: 48px;
    font-size: 1.5rem;
    text-align: center;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
    color: #333;
    transition: all 0.2s;
  }

  .time-input-field:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }

  .time-separator {
    font-size: 1.5rem;
    font-weight: bold;
    color: #666;
  }

  .time-input-hint {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
    flex: 1;
  }

  .header-content h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    text-align: left;
  }

  .header-subtitle {
    font-size: 1rem;
    color: #666;
    margin: 0;
    text-align: left;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
  }

  .time-display {
    font-size: 1.2rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
    text-align: center;
  }

  .time-input-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  `;

  // 스타일 태그 추가
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [showRoutes]);

  useEffect(() => {
    if (!mapInstance.current || !courseDetail) return;
    const currentDay = courseDetail.days?.find(day => day.day === selectedDay);
    if (!currentDay || !currentDay.itinerary) return;
    updateMapMarkersAndRoute(selectedDay);
  }, [courseDetail, selectedDay]);

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">에러: {error}</div>;
  }

  if (!courseDetail) {
    return <div className="error">코스 정보를 찾을 수 없습니다.</div>;
  }

  const currentDay = courseDetail?.days?.find(day => day.day === selectedDay);
  const totalDays = courseDetail?.days?.length || 1;
  const currentDayPlaces = currentDay?.itinerary || [];

  return (
    <div className="course-page">
      <div className="course-main">
        <div className="course-sidebar">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {courseName}
            <button 
              onClick={() => {
                const newName = prompt('코스 제목을 입력하세요:', courseName);
                if (newName && newName.trim()) {
                  setCourseName(newName.trim());
                }
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '3px',
                color: '#666',
                fontSize: '12px'
              }}
              title="제목 수정"
            >
              <LuPencilLine size={14} />
            </button>
          </h2>
          <div className="date-section">
            <p className="date">{getDateDisplay()}</p>
            <button 
              className="edit-button" 
              onClick={() => setShowDateModal(true)}
              aria-label="날짜 수정"
            >
              <LuPencilLine />
            </button>
          </div>

          {/* 경로 표시 토글 버튼 */}
          <div className="route-toggle-section" style={{ paddingLeft: '16px' }}>
            <button
              className={`route-toggle-btn ${showRoutes ? 'active' : ''}`}
              onClick={toggleRoutes}
              style={{
                padding: '5px 5px',
                border: 'none',
                backgroundColor: 'transparent',
                color: showRoutes ? '#4285F4' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
                fontSize: '28px',
                borderRadius: '8px',
                minWidth: '120px',
                minHeight: '48px',
              }}
            >
              {showRoutes ? (
                <LiaToggleOnSolid size={36} />
              ) : (
                <LiaToggleOffSolid size={36} />
              )}
              <span style={{ fontSize: '18px', fontWeight: 500, color: showRoutes ? '#4285F4' : '#666', marginLeft: '6px' }}>
                {showRoutes ? '경로 숨기기' : '경로 표시'}
              </span>
            </button>
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

          <DragDropContext onDragEnd={handlePlaceOrderChange}>
            <Droppable droppableId="places">
              {(provided) => (
                <div
                  className="course-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {currentDayPlaces.map((place, index) => renderPlaceCard(place, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* 하단 버튼 영역 */}
          <div className="footer-buttons">
            <button 
              onClick={handleUpdateCourse}
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
              {isSaving ? '수정 중...' : '수정 완료'}
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
          <div id="map" style={{ width: "100%", height: "100%" }} ref={mapRef} />
          {!courseDetail && (
            <div style={{textAlign:'center',marginTop:'3rem'}}>코스 정보를 불러오는 중...</div>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPlaceSelect={handleAddPlace}
        region={region}
        mapInstance={mapInstance.current}
      />
      <DateModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onDateChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
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
                  {Object.entries(modalInfo.place.accessibility_features || {})
                    .filter(([, value]) => value && value !== 'null' && value !== 'undefined' && String(value).trim() !== '')
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
                        'facilities_etc': '기타 편의시설',
                        'room': '객실',
                        'facilities': '편의시설',
                        'lactation_room': '수유실',
                        'etc': '기타'
                      };

                      const valueMapping = {
                        'available': '있음',
                        'yes': '있음',
                        'true': '있음',
                        'free': '무료',
                        'paid': '유료',
                        'inside': '실내',
                        'outside': '실외',
                        'both': '실내/실외',
                        'ground_floor': '1층',
                        'all_floors': '전 층',
                        'partial': '일부',
                        'full': '전체',
                        'wheelchair_accessible': '휠체어 접근 가능',
                        'guide_dog_allowed': '안내견 동반 가능',
                        'braille_available': '점자 안내 있음',
                        'audio_guide_available': '음성 안내 있음',
                        'human_guide_available': '안내요원 있음',
                      };

                      let displayValue = value;
                      if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                          displayValue = value.map(v => valueMapping[v.toLowerCase()] || v).join(', ');
                        } else {
                          displayValue = Object.keys(value)
                            .map(k => `${keyMapping[k] || k}: ${valueMapping[value[k]?.toLowerCase()] || value[k]}`)
                            .join(', ');
                        }
                      } else if (typeof value === 'string') {
                        displayValue = valueMapping[value.toLowerCase()] || value;
                      } else if (typeof value !== 'number') {
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
      
      {/* 시간 수정 모달 */}
      <TimeModal
        isOpen={isTimeModalOpen}
        onClose={() => {
          setIsTimeModalOpen(false);
          setSelectedPlace(null);
        }}
        onTimeChange={handleTimeChange}
        currentTime={selectedPlace?.time}
        placeName={selectedPlace?.place_name}
        isNewPlace={timeModalMode === 'add'}
      />
      
      {/* 시간 입력 모달 */}
      <AddPlaceTimeModal
        isOpen={isAddPlaceTimeModalOpen}
        onClose={() => {
          setIsAddPlaceTimeModalOpen(false);
          setSelectedPlaceToAdd(null);
        }}
        onConfirm={handleTimeConfirm}
        placeName={selectedPlaceToAdd?.place_name}
      />
    </div>
  );
}

export default CourseEditPage; 