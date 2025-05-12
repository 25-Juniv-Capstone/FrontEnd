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
import Header from "../layout/Header"; // 상단 공통 Header
import "../css/CourseCreatePage.css"; // 스타일 import
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // 드래그앤드롭 라이브러리

// 장소 타입별 이모지 매핑 - UI에 표시될 아이콘 정의
const placeTypeToEmoji = {
  "한식당": "🍴 식당",
  "카페": "☕ 카페",
  "공원": "🏞️ 공원",
  "박물관": "🏛️ 박물관",
  "호텔": "🏨 숙소",
  "백화점": "🏬 쇼핑",
  "공연예술 극장": "�� 공연장",
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

function CourseCreatePage() {
  // 상태 관리
  const [courseData, setCourseData] = useState(mockCourseData);
  const [selectedDay, setSelectedDay] = useState(1);
  const [placesByDay, setPlacesByDay] = useState({});
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // 초기 데이터 처리 - 받아온 데이터를 화면에 표시하기 좋은 형태로 변환
  useEffect(() => {
    console.log("courseData:", courseData);

    if (!courseData?.recommended_courses?.[0]?.days) {
      console.log("No course data available");
      return;
    }

    const course = courseData.recommended_courses[0];
    const processedPlaces = {};

    // 각 일차별 장소 데이터 처리
    course.days.forEach(dayData => {
      console.log("Processing day:", dayData);
      
      processedPlaces[dayData.day] = dayData.itinerary.map((item, index) => ({
        id: `${dayData.day}-${index}`,
        time: item.time,
        place_name: item.place_name,
        place_type: item.place_type,
        description: item.description,
        lat: item.coordinates.latitude,
        lng: item.coordinates.longitude,
        accessibility_features: item.accessibility_features
      }));
    });

    console.log("Processed places:", processedPlaces);
    setPlacesByDay(processedPlaces);
  }, [courseData]);

  // 지도 관련 설정
  const mapRef = useRef(null); // 지도를 표시할 DOM 요소
  const mapInstance = useRef(null); // 구글 지도 인스턴스
  const markers = useRef([]); // 지도에 표시될 마커들
  const pathLine = useRef(null); // 경로를 표시할 선

  // 구글 지도 초기화
  useEffect(() => {
    if (window.google && mapRef.current) {
      // 첫 번째 장소의 좌표를 기본 중심점으로 설정
      const defaultCenter = { 
        lat: courseData.recommended_courses[0]?.days[0]?.itinerary[0]?.coordinates.latitude || 35.1795543,
        lng: courseData.recommended_courses[0]?.days[0]?.itinerary[0]?.coordinates.longitude || 129.0756416
      };
      
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
      });
    }
  }, []);

  // 선택된 일차의 장소들을 지도에 표시
  useEffect(() => {
    if (!mapInstance.current) return;

    // 기존 마커와 경로 삭제
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    if (pathLine.current) {
      pathLine.current.setMap(null);
      pathLine.current = null;
    }

    const currentPlaces = placesByDay[selectedDay] || [];
    const pathCoordinates = [];

    // 새 마커 생성 및 정보창 설정
    currentPlaces.forEach((place, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        label: `${idx + 1}`,
        title: place.place_name,
      });

      // 마커 클릭시 표시될 정보창 설정
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>${place.place_name}</h3>
            <p>${place.description || ""}</p>
            <div class="accessibility">
              ${Object.entries(place.accessibility_features || {})
                .map(([key, value]) => `<p>• ${value}</p>`)
                .join("")}
            </div>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
      pathCoordinates.push({ lat: place.lat, lng: place.lng });
    });

    // 장소들을 연결하는 경로선 그리기
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

    // 지도 중심 이동
    if (currentPlaces.length > 0) {
      mapInstance.current.setCenter({ lat: currentPlaces[0].lat, lng: currentPlaces[0].lng });
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

  // 디버깅을 위한 상태 로깅
  console.log("Current state:", {
    selectedDay,
    placesByDay,
    currentDayPlaces: placesByDay[selectedDay]
  });

  // Places 서비스 초기화
  const placesService = useRef(null);
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && mapInstance.current) {
      placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);
    }
  }, [mapInstance.current]);

  return (
    <div className="course-page">
      <Header />

      <div className="course-main">
        {/* 왼쪽 패널 - 일정 목록 */}
        <div className="course-sidebar">
          <h2>{courseData?.metadata?.region || "지역 정보 없음"}</h2>
          <p className="date">{getDateDisplay()}</p>

          {/* 일차 선택 버튼 */}
          <div className="day-buttons">
            {Array.from({ length: courseData?.metadata?.duration || 0 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                className={selectedDay === day ? "active" : ""}
                onClick={() => setSelectedDay(day)}
              >
                {day}일차
              </button>
            ))}
          </div>

          {/* 드래그 앤 드롭으로 순서 변경 가능한 장소 목록 */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="places">
              {(provided) => (
                <div
                  className="course-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {/* 각 장소 카드 */}
                  {(placesByDay[selectedDay] || []).map((place, index) => (
                    <Draggable key={place.id} draggableId={place.id} index={index}>
                      {(provided) => (
                        <div
                          className="course-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="left">
                            <div className="circle-number">{index + 1}</div>
                            <input
                              type="time"
                              defaultValue={formatTimeString(place.time)}
                              onChange={(e) => handleTimeChange(place.id, e.target.value)}
                              className="time-input"
                            />
                            <div className="title">{place.place_name}</div>
                            <div className="place-type">
                              {placeTypeToEmoji[place.place_type] || "📍 기타"}
                            </div>
                            {/* 무장애 시설 정보 */}
                            <div className="accessibility-info">
                              {Object.entries(place.accessibility_features || {}).map(([key, value]) => (
                                <div key={key} className="accessibility-item">
                                  • {value}
                                </div>
                              ))}
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
            <button onClick={() => setIsSearchModalOpen(true)}>+ 장소 추가</button>
            <div className="button-row">
              <button>저장</button>
              <button>공유</button>
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 - 구글 지도 */}
        <div className="map-area">
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      {/* 장소 검색 모달 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPlaceSelect={handleAddPlace}
        region={courseData?.metadata?.region || ""}
        mapInstance={mapInstance.current}
      />
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
    
    console.log("검색 시작:", searchQuery);
    console.log("Places 서비스 상태:", placesService.current);
    
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

    console.log("검색 요청:", request);

    placesService.current.textSearch(request, (results, status) => {
      console.log("검색 결과 상태:", status);
      console.log("검색 결과:", results);
      
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
        console.log("변환된 장소 데이터:", places);
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

export default CourseCreatePage;
