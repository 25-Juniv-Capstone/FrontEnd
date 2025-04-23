import React, { useEffect, useRef } from 'react';
import Header from '../layout/Header';
import '../css/CourseCreatePage.css';

const mockData = [
  {
    id: 1,
    title: '전주 한옥마을',
    time: '10:00 - 12:00',
    duration: '40분',
    img: 'https://source.unsplash.com/160x100/?hanok',
    lat: 35.814,
    lng: 127.15,
  },
];

function CourseCreatePage() {
  const mapRef = useRef(null); // 지도 참조

  useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.814, lng: 127.15 },
        zoom: 14,
      });

      // 마커 찍기
      mockData.forEach((place) => {
        new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          title: place.title,
        });
      });
    }
  }, []);

  return (
    <div className="course-page">
      <Header />

      <div className="course-main">
        {/* 왼쪽 일정 패널 */}
        <div className="course-sidebar">
          <h2>전주</h2>
          <p className="date">2025.04.03 ~ 2025.04.04</p>

          <div className="day-buttons">
            <button className="active">1일차</button>
            <button>2일차</button>
          </div>

          <div className="course-list">
            {mockData.map((item) => (
              <div className="course-card" key={item.id}>
                <div className="left">
                  <div className="time">{item.time}</div>
                  <div className="title">{item.title}</div>
                  <div className="duration">이동: {item.duration}</div>
                </div>
                <div className="right">
                  <img src={item.img} alt={item.title} />
                  <div className="action-buttons">
                    <button>🗑</button>
                    <button>↕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="footer-buttons">
            <button>+ 장소 추가</button>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ flex: 1 }}>저장</button>
              <button style={{ flex: 1 }}>공유</button>
            </div>
          </div>
        </div>

        {/* 오른쪽 지도 자리 */}
        <div className="map-area">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
}

export default CourseCreatePage;
