import React from 'react';
import Header from '../layout/Header'; // 헤더 import

const mockData = [ /* 일정 데이터 */ ];

function CourseCreatePage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* 왼쪽 일정 */}
        <div style={{ width: '340px', padding: '20px', overflowY: 'auto', background: '#fff', borderRight: '1px solid #ddd' }}>
          <h2 style={{ marginBottom: '20px' }}>지역 이름</h2>
          {mockData.map((item) => (
            <div key={item.id} style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '14px', color: '#555' }}>{item.time}</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.title}</div>
              <img src={item.img} alt={item.title} style={{ marginTop: '8px', width: '100%', borderRadius: '8px' }} />
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>이동시간: {item.duration}</div>
            </div>
          ))}
        </div>

        {/* 오른쪽 지도 자리 */}
        <div style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#aaa',
              fontSize: '18px',
            }}
          >
            🗺️ 여기에 지도 영역이 들어갈 예정입니다
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCreatePage;
