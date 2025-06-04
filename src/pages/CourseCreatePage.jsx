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
import React, { useEffect, useState, useRef, useCallback } from "react";
import "../css/CourseCreatePage.css"; // 스타일 import
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // 드래그앤드롭 라이브러리
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosConfig';
import { LiaToggleOnSolid, LiaToggleOffSolid } from "react-icons/lia";

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

// 번호가 크게 보이는 SVG 마커 아이콘 생성 함수 - 나중에 사용될 수 있으므로 주석 처리
/*
function getNumberedMarkerIcon(number, placeType) {
  const color = placeTypeToColor[placeType] || "#2196F3";
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
*/

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
  const region = regionFromState;
  const [isSaving, setIsSaving] = useState(false);
  const [modalInfo, setModalInfo] = useState({ open: false, type: '', place: null });
  const [showRoutes, setShowRoutes] = useState(false);
  
  // 지도 관련 설정
  const mapInstance = useRef(null);
  const mapRef = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const markers = useRef([]); // 마커 배열 추가
  const directionsRenderers = useRef([]);

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

  // 여행 일수 계산
  const getDateDiff = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.round((e - s) / (1000*60*60*24)) + 1);
  };

  // 상태 변경 감지를 위한 useEffect
  useEffect(() => {
    console.log('\n=== 상태 변경 감지 ===');
    console.log('courseData 변경:', {
      hasData: !!courseData,
      hasRecommendedCourses: !!courseData?.recommended_courses,
      metadata: courseData?.metadata
    });
    console.log('placesByDay 변경:', {
      hasData: !!placesByDay,
      days: Object.keys(placesByDay),
      currentDayPlaces: placesByDay[selectedDay]
    });
    console.log('selectedDay 변경:', selectedDay);
  }, [courseData, placesByDay, selectedDay]);

  // 초기 데이터 설정
  useEffect(() => {
    console.log('초기 데이터 설정 시작:', {
      backendCourseData,
      startDate,
      endDate,
      regionFromState
    });

    if (backendCourseData) {
      console.log('backendCourseData 존재:', backendCourseData);
      
      // 날짜 정보가 없는 경우 location.state에서 가져온 날짜 사용
      const metadata = {
        ...backendCourseData.metadata,
        start_date: backendCourseData.metadata?.start_date || startDate,
        end_date: backendCourseData.metadata?.end_date || endDate,
        region: backendCourseData.metadata?.region || regionFromState,
        duration: backendCourseData.metadata?.duration || getDateDiff(startDate, endDate)
      };

      console.log('생성된 metadata:', metadata);

      const processedData = {
        ...backendCourseData,
        metadata: metadata
      };

      console.log('processedData 구조:', {
        hasRecommendedCourses: !!processedData.recommended_courses,
        recommendedCoursesLength: processedData.recommended_courses?.length,
        firstCourse: processedData.recommended_courses?.[0],
        hasDays: !!processedData.recommended_courses?.[0]?.days,
        daysLength: processedData.recommended_courses?.[0]?.days?.length
      });

      if (processedData.recommended_courses?.[0]?.days) {
        console.log('recommended_courses 상세 데이터:', {
          course: processedData.recommended_courses[0],
          days: processedData.recommended_courses[0].days,
          firstDay: processedData.recommended_courses[0].days[0]
        });
        
        const course = processedData.recommended_courses[0];
        const processedPlaces = {};
        
        console.log('days 데이터 처리 시작:', {
          daysArray: course.days,
          daysLength: course.days.length,
          firstDayData: course.days[0]
        });

        course.days.forEach((dayData, dayIndex) => {
          console.log(`\n=== ${dayIndex + 1}일차 처리 시작 ===`);
          console.log('일차 데이터 원본:', dayData);
          console.log('일차 번호:', dayData.day);
          console.log('itinerary 존재 여부:', !!dayData.itinerary);
          
          if (!dayData.itinerary) {
            console.log(`${dayIndex + 1}일차 itinerary 없음`);
            return;
          }
          
          console.log('itinerary 데이터:', dayData.itinerary);
          
          try {
            processedPlaces[dayData.day] = dayData.itinerary.map((item, index) => {
              console.log(`\n--- ${dayIndex + 1}일차 ${index + 1}번째 장소 처리 ---`);
              console.log('장소 데이터 원본:', item);
              
              // accessibility_features 안전하게 처리
              let accessibilityFeatures = {};
              
              if (item.accessibility_info) {
                console.log('accessibility_info 처리:', item.accessibility_info);
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
                console.log('accessibility_features 처리:', item.accessibility_features);
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
              
              const processedPlace = {
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
              
              console.log('처리된 장소 데이터:', processedPlace);
              return processedPlace;
            });
            
            console.log(`${dayIndex + 1}일차 처리 완료:`, processedPlaces[dayData.day]);
          } catch (error) {
            console.error(`${dayIndex + 1}일차 처리 중 오류 발생:`, error);
          }
        });
        
        console.log('\n=== 최종 처리된 장소 데이터 ===');
        console.log('processedPlaces:', processedPlaces);
        
        console.log('\n=== 상태 업데이트 시작 ===');
        console.log('업데이트 전 상태:', {
          courseData,
          placesByDay,
          selectedDay
        });

        // 상태 업데이트를 한 번에 처리
        const updateState = () => {
          setCourseData(processedData);
          setPlacesByDay(processedPlaces);
          setSelectedDay(1);
        };

        // 상태 업데이트 실행
        updateState();

        // 상태 업데이트 후 즉시 확인
        console.log('상태 업데이트 호출 완료');
        console.log('processedData:', processedData);
        console.log('processedPlaces:', processedPlaces);
      } else {
        console.log('recommended_courses 또는 days 없음');
        // 코스 데이터가 없더라도 날짜 정보는 저장
        setCourseData(processedData);
      }
    } else {
      console.log('backendCourseData 없음');
    }
  }, [backendCourseData, startDate, endDate, regionFromState]);

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('상태 업데이트:', {
      courseData,
      selectedDay,
      placesByDay,
      currentDayPlaces: placesByDay[selectedDay]
    });
  }, [courseData, selectedDay, placesByDay]);

  // 지도 초기화 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const initializeMap = () => {
      const mapDiv = document.getElementById("map");
      console.log('지도 초기화 시도:', { mapDiv, mapInstance: mapInstance.current });
      
      if (!mapDiv) {
        console.log('map div를 찾을 수 없음, 100ms 후 재시도');
        setTimeout(initializeMap, 100);
        return;
      }

      if (!mapInstance.current) {
        console.log('지도 생성 시작');
        const mapOptions = {
          center: { lat: 36.5, lng: 127.8 }, // 기본 중심점
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };
        
        try {
          mapInstance.current = new window.google.maps.Map(mapDiv, mapOptions);
          console.log('지도 생성 완료');
          
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
          
          // 지도가 생성된 후 directionsRenderer 설정
          if (directionsRenderer.current) {
            directionsRenderer.current.setMap(mapInstance.current);
          }
        } catch (error) {
          console.error('지도 생성 중 오류 발생:', error);
        }
      }
    };

    // 지도 초기화 시작
    initializeMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
      if (directionsService.current) {
        directionsService.current = null;
      }
      if (directionsRenderer.current) {
        directionsRenderer.current = null;
      }
    };
  }, []);

  // mapCenter가 바뀔 때 setCenter만 (지도 생성 후에만)
  const [mapCenter] = useState({ lat: 36.5, lng: 127.8 });
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  // 마커 생성 함수
  const createMarker = (place, index) => {
    if (!mapInstance.current) return null;

    const marker = new window.google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: mapInstance.current,
      title: place.place_name,
      label: {
        text: `${index + 1}`,
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: placeTypeToColor[place.place_type] || "#2196F3",
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 15
      }
    });

    // 마커 클릭 시 정보창 표시
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0;">${place.place_name}</h3>
          <p style="margin: 0;">${place.place_type}</p>
          <p style="margin: 4px 0 0 0;">${place.description || ''}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstance.current, marker);
    });

    return marker;
  };

  // 마커 초기화 함수
  const clearMarkers = () => {
    if (markers.current) {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    }
  };

  // 기존 렌더러 정리 함수
  const clearDirectionsRenderers = () => {
    if (directionsRenderers.current) {
      directionsRenderers.current.forEach(renderer => {
        if (renderer) {
          renderer.setMap(null);
        }
      });
      directionsRenderers.current = [];
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      clearMarkers();
      clearDirectionsRenderers();
      if (mapInstance.current) {
        mapInstance.current = null;
      }
      if (directionsService.current) {
        directionsService.current = null;
      }
      if (directionsRenderer.current) {
        directionsRenderer.current = null;
      }
    };
  }, []);

  const calculateRoute = useCallback(async (places) => {
    if (!places || places.length < 2) return;
    if (!directionsService.current || !mapInstance.current) {
      console.log('directionsService 또는 map이 아직 초기화되지 않음');
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

      const marker = createMarker({ ...place, lat, lng }, index);
      if (marker) {
        markers.current.push(marker);
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

    // 경로를 저장할 배열
    const routes = [];
    let hasError = false;

    // 연속된 장소들 사이의 경로 계산
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];
      
      // 현재 구간의 색상 선택 (색상 배열을 순환하면서 사용)
      const routeColor = routeColors[i % routeColors.length];
      
      const originLat = origin.coordinates?.latitude || origin.lat;
      const originLng = origin.coordinates?.longitude || origin.lng;
      const destLat = destination.coordinates?.latitude || destination.lat;
      const destLng = destination.coordinates?.longitude || destination.lng;

      console.log(`경로 계산 시도 ${i + 1}/${places.length - 1}:`, {
        from: origin.place_name,
        to: destination.place_name,
        color: routeColor,
        coordinates: {
          origin: { lat: originLat, lng: originLng },
          destination: { lat: destLat, lng: destLng }
        }
      });

      // 각 이동 수단으로 시도
      let routeFound = false;
      for (const mode of travelModes) {
        try {
          const request = {
            origin: new window.google.maps.LatLng(originLat, originLng),
            destination: new window.google.maps.LatLng(destLat, destLng),
            travelMode: mode
          };

          console.log(`${mode} 모드로 경로 계산 시도...`);
          const result = await getDirections(directionsService.current, request);
          console.log(`${mode} 모드로 경로 계산 성공!`);
          
          // 새로운 DirectionsRenderer 생성
          const renderer = new window.google.maps.DirectionsRenderer({
            map: mapInstance.current,
            directions: result,
            suppressMarkers: true, // 마커는 직접 관리
            preserveViewport: true, // 지도 자동 포커싱 비활성화
            polylineOptions: {
              strokeColor: routeColor,
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });

          directionsRenderers.current.push(renderer);
          routes.push(result);
          routeFound = true;
          break; // 성공하면 다음 이동 수단 시도하지 않음
        } catch (error) {
          console.warn(`${mode} 모드로 경로 계산 실패:`, error);
          hasError = true;
        }
      }

      if (!routeFound) {
        console.warn(`${origin.place_name}에서 ${destination.place_name}까지의 경로를 찾을 수 없습니다.`);
        hasError = true;
      }
    }

    if (hasError) {
      console.warn('일부 경로 계산에 실패했습니다. 성공한 경로만 표시됩니다.');
    }

    // 모든 마커가 보이도록 지도 범위 조정
    if (markers.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.current.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.current.fitBounds(bounds);
    }
  }, []);

  // 경로 표시/숨김 처리 함수
  const toggleRoutes = useCallback(() => {
    setShowRoutes(prev => !prev);
    if (!showRoutes) {
      // 경로 표시 모드로 전환 시 경로 계산
      if (placesByDay[selectedDay] && placesByDay[selectedDay].length >= 2) {
        calculateRoute(placesByDay[selectedDay]);
      }
    } else {
      // 경로 숨김 모드로 전환 시 경로 제거
      clearDirectionsRenderers();
    }
  }, [showRoutes, selectedDay, placesByDay, calculateRoute]);

  // selectedDay나 placesByDay가 변경될 때 경로 재계산하는 useEffect 수정
  useEffect(() => {
    console.log('selectedDay 또는 placesByDay 변경 감지:', {
      selectedDay,
      hasPlaces: !!placesByDay[selectedDay],
      placesCount: placesByDay[selectedDay]?.length,
      showRoutes
    });

    // 기존 마커와 경로 제거
    clearMarkers();
    clearDirectionsRenderers();

    // 현재 일차의 장소가 있는 경우
    if (mapInstance.current && placesByDay[selectedDay]) {
      const currentPlaces = placesByDay[selectedDay];
      
      // 마커 생성
      currentPlaces.forEach((place, index) => {
        const lat = place.coordinates?.latitude || place.lat;
        const lng = place.coordinates?.longitude || place.lng;
        
        if (!lat || !lng) {
          console.warn(`장소 "${place.place_name}"의 좌표가 없습니다:`, place);
          return;
        }

        const marker = createMarker({ ...place, lat, lng }, index);
        if (marker) {
          markers.current.push(marker);
        }
      });

      // 마커들이 모두 생성된 후 지도 범위 조정
      if (markers.current.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.current.forEach(marker => bounds.extend(marker.getPosition()));
        mapInstance.current.fitBounds(bounds, {
          padding: { top: 50, right: 50, bottom: 50, left: 50 }  // 여백 추가
        });
      }

      // 경로 표시가 켜져있고 장소가 2개 이상인 경우에만 경로 계산
      if (showRoutes && currentPlaces.length >= 2) {
        console.log('경로 계산 시작');
        calculateRoute(currentPlaces);
      }
    }
  }, [selectedDay, placesByDay, calculateRoute, showRoutes]);

  // 장소 삭제 처리 수정
  const handleDeletePlace = (placeId) => {
    const updatedPlaces = placesByDay[selectedDay].filter(
      (place) => place.id !== placeId
    );
    setPlacesByDay({
      ...placesByDay,
      [selectedDay]: updatedPlaces,
    });

    // 경로 재계산
    if (updatedPlaces.length >= 2) {
      calculateRoute(updatedPlaces);
    } else {
      clearMarkers();
      clearDirectionsRenderers();
    }
  };

  // 드래그 앤 드롭으로 장소 순서 변경 수정
  const handlePlaceOrderChange = (result) => {
    if (!result.destination) return;

    const items = Array.from(placesByDay[selectedDay]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlacesByDay({
      ...placesByDay,
      [selectedDay]: items
    });

    // 경로 재계산
    if (items.length >= 2) {
      calculateRoute(items);
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

    setIsSaving(true);  // 저장 시작 시 상태 변경

    try {
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
    } finally {
      setIsSaving(false);  // 저장 완료 또는 실패 시 상태 변경
    }
  };

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

  return (
    <div className="course-page">
      <div className="course-main">
        <div className="course-sidebar">
          <h2>{region}</h2>
          <div className="date-section" onClick={() => setIsDateModalOpen(true)}>
            <p className="date">{getDateDisplay && getDateDisplay()}</p>
            <span className="edit-icon">✏️</span>
          </div>

          {/* 경로 표시 토글 버튼 수정 */}
          <div className="route-toggle-section" style={{ paddingLeft: '16px' }}>
            <button
              className={`route-toggle-btn ${showRoutes ? 'active' : ''}`}
              onClick={toggleRoutes}
              style={{
                padding: '8px',
                margin: '10px 0',
                border: 'none',
                backgroundColor: 'transparent',
                color: showRoutes ? '#4285F4' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
                fontSize: '24px'
              }}
            >
              {showRoutes ? (
                <LiaToggleOnSolid size={32} />
              ) : (
                <LiaToggleOffSolid size={32} />
              )}
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
                              <button onClick={() => handleDeletePlace(place.id)}>🗑️</button>
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
          <div id="map" style={{ width: "100%", height: "100%" }} ref={mapRef} />
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
