// 필수 라이브러리 import
import React, { useEffect, useState, useRef } from "react";
import Header from "../layout/Header"; // 상단 공통 Header
import "../css/CourseCreatePage.css"; // 스타일 import
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // 드래그앤드롭 라이브러리

// 장소 타입별 이모지 매핑 (한글 설명도 붙음)
const placeTypeToEmoji = {
  "한식당": "🍴 식당",
  "중식당": "🍴 식당",
  "양식당": "🍴 식당",
  "카페": "☕ 카페",
  "공원": "🏞️ 공원",
  "박물관": "🏛️ 박물관",
  "호텔": "🏨 호텔",
  "백화점": "🏬 쇼핑",
  "공연예술 극장": "🎭 공연장",
};

// 초기 mock 데이터 (서버 연결 전 테스트용)
const initialData = {
  1: [
    { id: "1", time: "오전 9:00", place_name: "나막집", place_type: "한식당", lat: 35.134, lng: 129.112 },
    { id: "2", time: "오전 11:00", place_name: "국립해양박물관", place_type: "박물관", lat: 35.078, lng: 129.080 },
    { id: "3", time: "오후 1:30", place_name: "동백공원", place_type: "공원", lat: 35.153, lng: 129.152 },
  ],
  2: [
    { id: "4", time: "오전 9:00", place_name: "무궁화", place_type: "한식당", lat: 35.156, lng: 129.056 },
    { id: "5", time: "오전 11:00", place_name: "부산시민공원", place_type: "공원", lat: 35.165, lng: 129.055 },
  ],
  3: [
    { id: "6", time: "오전 9:00", place_name: "롯데호텔 부산", place_type: "호텔", lat: 35.159, lng: 129.054 },
    { id: "7", time: "오전 10:30", place_name: "부산어린이대공원", place_type: "공원", lat: 35.187, lng: 129.042 },
  ],
};

function CourseCreatePage() {
  // 각 일차별 장소 데이터 관리
  const [placesByDay, setPlacesByDay] = useState(initialData);
  // 현재 선택된 일차 (1일차, 2일차, 3일차)
  const [selectedDay, setSelectedDay] = useState(1);

  // 지도 관련 ref
  const mapRef = useRef(null); // 지도 DOM 참조
  const mapInstance = useRef(null); // 지도 인스턴스 저장
  const markers = useRef([]); // 마커들 저장
  const pathLine = useRef(null); // 핀들을 연결하는 선 저장

  // ✅ 처음에 구글 지도 초기화
  useEffect(() => {
    if (window.google && mapRef.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.1595, lng: 129.0756 }, // 부산 중심 좌표
        zoom: 12,
      });
    }
  }, []);

  // ✅ 선택된 일차의 장소를 지도에 표시 (마커 + 선)
  useEffect(() => {
    if (!mapInstance.current) return;

    // 기존 마커와 선 지우기
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    if (pathLine.current) {
      pathLine.current.setMap(null);
      pathLine.current = null;
    }

    const currentPlaces = placesByDay[selectedDay] || [];

    const pathCoordinates = [];

    // 새 마커 찍기 + 순번 라벨 추가
    currentPlaces.forEach((place, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        label: `${idx + 1}`, // 1번, 2번처럼 순서 표시
        title: place.place_name,
      });
      markers.current.push(marker);
      pathCoordinates.push({ lat: place.lat, lng: place.lng });
    });

    // 지도 중심 이동
    if (currentPlaces.length > 0) {
      const firstPlace = currentPlaces[0];
      mapInstance.current.setCenter({ lat: firstPlace.lat, lng: firstPlace.lng });
    }

    // 핀들을 순서대로 잇는 선 그리기
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

  // ✅ 드래그앤드롭 완료했을 때 순서 재정렬
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(placesByDay[selectedDay]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlacesByDay({ ...placesByDay, [selectedDay]: items });
  };

  return (
    <div className="course-page">
      <Header />

      <div className="course-main">
        {/* 왼쪽 패널 (일정 + 장소 리스트) */}
        <div className="course-sidebar">
          <h2>부산</h2>
          <p className="date">2025.04.03 ~ 2025.04.05</p>

          {/* 일차 버튼 */}
          <div className="day-buttons">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                className={selectedDay === day ? "active" : ""}
                onClick={() => setSelectedDay(day)}
              >
                {day}일차
              </button>
            ))}
          </div>

          {/* 드래그앤드롭 컨텍스트 */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="places">
              {(provided) => (
                <div
                  className="course-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {/* 장소 카드 렌더링 */}
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
                            <div className="circle-number">{index + 1}</div> {/* 순서 표시 */}
                            <div className="time">{place.time}</div> {/* 시간 */}
                            <div className="title">{place.place_name}</div> {/* 장소 이름 */}
                            <div className="place-type">
                              {placeTypeToEmoji[place.place_type] || "📍 기타"} {/* 장소 종류 */}
                            </div>
                          </div>

                          <div className="right">
                            <div className="action-buttons">
                              <button>🗑</button> {/* 삭제 버튼 (아직 기능 없음) */}
                              <button>↕️</button> {/* 드래그 핸들 버튼 */}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder} {/* 드래그할 때 공간 확보 */}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* 하단 추가 버튼 */}
          <div className="footer-buttons">
            <button>+ 장소 추가</button>
            <div className="button-row">
              <button>저장</button>
              <button>공유</button>
            </div>
          </div>
        </div>

        {/* 오른쪽 지도 */}
        <div className="map-area">
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </div>
  );
}

export default CourseCreatePage;
