import React, { useState, useEffect } from 'react';
import '../css/LoadingSpinner.css';

// 지역별 정보 데이터
const regionInfo = {
  "서울": [
    "서울은 조선시대부터 대한민국의 수도로, 600년 이상의 역사를 가지고 있어요.",
    "경복궁은 조선왕조 제일의 법궁으로, 무장애 관람이 가능한 구간이 마련되어 있어요.",
    "남산타워는 서울의 상징으로, 장애인 전용 엘리베이터가 구비되어 있어요.",
    "서울시는 장애인 관광객을 위한 '서울 무장애 관광 가이드'를 제공하고 있어요.",
    "인사동은 전통문화의 중심지로, 대부분의 골목이 휠체어 접근이 가능해요."
  ],
  "부산": [
    "부산은 대한민국 제2의 도시로, 아름다운 해변과 산이 어우러진 도시예요.",
    "해운대 해수욕장은 장애인 전용 해변 시설이 잘 갖춰져 있어요.",
    "부산국제영화제는 장애인 관객을 위한 배리어프리 상영관을 운영하고 있어요.",
    "부산 타워는 장애인 전용 엘리베이터와 휠체어 램프가 설치되어 있어요.",
    "부산시는 장애인 관광객을 위한 '부산 무장애 관광 가이드맵'을 제공해요."
  ],
  "제주": [
    "제주도는 화산섬으로, 유네스코 세계자연유산으로 지정된 아름다운 섬이에요.",
    "성산일출봉은 장애인 전용 관람로가 잘 갖춰져 있어요.",
    "제주 올레길 중 일부 코스는 휠체어 접근이 가능하도록 조성되어 있어요.",
    "제주도는 장애인 관광객을 위한 '제주 무장애 관광 가이드'를 제공하고 있어요.",
    "제주 국제공항은 장애인 지원 서비스가 잘 갖춰져 있어요."
  ],
  "인천": [
    "인천은 대한민국의 서해안 관문으로, 현대적인 도시와 역사가 공존해요.",
    "인천국제공항은 장애인 지원 서비스가 세계적으로 인정받고 있어요.",
    "월미도는 장애인 전용 관람 시설이 잘 갖춰진 관광지예요.",
    "인천 차이나타운은 대부분의 거리가 휠체어 접근이 가능해요.",
    "인천시는 장애인 관광객을 위한 '인천 무장애 관광 가이드'를 제공해요."
  ],
  "대구": [
    "대구는 대한민국의 내륙 중심 도시로, 전통시장과 현대적 시설이 공존해요.",
    "동성로는 장애인 편의시설이 잘 갖춰진 대표적인 상권이에요.",
    "대구타워는 장애인 전용 엘리베이터와 관람 시설이 구비되어 있어요.",
    "대구시는 장애인 관광객을 위한 '대구 무장애 관광 가이드'를 제공하고 있어요.",
    "대구 약령시는 전통시장 중 장애인 편의시설이 잘 갖춰진 곳이에요."
  ],
  "전주": [
    "전주는 조선시대부터 전통문화의 중심지로, 한옥마을이 유네스코 세계문화유산으로 지정되어 있어요.",
    "전주 한옥마을은 대부분의 골목이 휠체어 접근이 가능하도록 조성되어 있어요.",
    "전주시는 장애인 관광객을 위한 '전주 무장애 관광 가이드'를 제공하고 있어요.",
    "전주 경기전은 장애인 전용 관람로와 엘리베이터가 구비되어 있어요.",
    "전주 남부시장은 장애인 편의시설이 잘 갖춰진 대표적인 전통시장이에요.",
    "전주 한옥마을 내 대부분의 문화시설은 장애인 전용 화장실을 갖추고 있어요.",
    "전주시는 장애인 관광객을 위한 무장애 관광 코스를 운영하고 있어요.",
    "전주 국립무형유산원은 장애인 전용 관람 시설이 잘 갖춰져 있어요.",
    "전주 한옥마을 내 맛집들은 대부분 휠체어 접근이 가능해요.",
    "전주시는 장애인 관광객을 위한 전용 주차장을 주요 관광지에 마련해두고 있어요.",
    "전주 한옥마을 내 전통문화체험관은 장애인 전용 관람로가 잘 갖춰져 있어요.",
    "전주 풍남문 일대는 휠체어 접근이 용이하도록 조성되어 있어요.",
    "전주 전통문화관은 장애인 전용 엘리베이터와 관람 시설이 구비되어 있어요.",
    "전주 한옥마을 내 전통찻집들은 대부분 휠체어 접근이 가능해요.",
    "전주시는 장애인 관광객을 위한 무장애 관광 버스를 운영하고 있어요.",
    "전주 한옥마을 내 전통공예관은 장애인 전용 관람 시설이 잘 갖춰져 있어요.",
    "전주 전통시장은 장애인 전용 화장실과 편의시설이 잘 갖춰져 있어요.",
    "전주 한옥마을 내 전통문화공연장은 장애인 전용 관람석을 운영하고 있어요.",
    "전주시는 장애인 관광객을 위한 무장애 관광 가이드 서비스를 제공해요.",
    "전주 한옥마을 내 전통문화체험 프로그램은 장애인 참여가 가능해요."
  ],
  "기타": [
    "한국의 전통 시장은 대부분 장애인 편의시설이 잘 갖춰져 있어요.",
    "대부분의 관광지에는 장애인 전용 주차장이 마련되어 있어요.",
    "한국의 대중교통은 장애인 지원 서비스가 점차 개선되고 있어요.",
    "관광지의 장애인 화장실은 대부분 무료로 이용할 수 있어요.",
    "한국의 관광안내소는 장애인 관광객을 위한 정보를 제공하고 있어요."
  ]
};

const LoadingSpinner = ({ message = "코스를 생성하고 있습니다...", region = "기타" }) => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState('');
  const [dots, setDots] = useState('');

  useEffect(() => {
    // 프로그레스 바 애니메이션
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 1000);

    // 로딩 점 애니메이션
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // 지역 정보 변경 (8초마다 변경)
    const tipInterval = setInterval(() => {
      const tips = regionInfo[region] || regionInfo["기타"];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
    }, 8000);

    // 초기 팁 설정
    const initialTips = regionInfo[region] || regionInfo["기타"];
    setCurrentTip(initialTips[Math.floor(Math.random() * initialTips.length)]);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearInterval(tipInterval);
    };
  }, [region]);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="loading-message">{message}{dots}</p>
        <div className="tip-container">
          <div className="tip-header">
            <span className="tip-icon">💡</span>
            <span className="tip-title">{region} 여행 정보</span>
          </div>
          <div className="tip-content-wrapper">
            <p className="tip-content">{currentTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 