import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ConfirmModal from '../components/ConfirmModal';
import '../css/HomePage.css';

// 지역 선택 모달 컴포넌트
const RegionModal = ({ isOpen, onClose, onConfirm, destination }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="region-modal">
        <div className="modal-header">
          <h3>여행 지역 확인</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          <p>{destination}으로 여행을 떠나시겠습니까?</p>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>아니오</button>
          <button onClick={() => onConfirm(destination)}>예</button>
        </div>
      </div>
    </div>
  );
};

// 날짜 입력 모달 컴포넌트
const DateInputModal = ({ isOpen, onClose, onConfirm, region }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onConfirm({ startDate, endDate });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="date-input-modal">
        <div className="modal-header">
          <h3>여행 날짜를 선택해주세요</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="date-input-group">
            <label>여행 시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="date-input-group">
            <label>여행 마지막일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">다음</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 최종 확인 모달 (여행 계획 세우기)
const FinalConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="modal-header">
          <h3>여행 계획 확인</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          <p>여행 계획을 세우시겠습니까?</p>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>아니오</button>
          <button onClick={onConfirm}>예</button>
        </div>
      </div>
    </div>
  );
};

// 지역별 좌표 정보
const regionCoordinates = {
  "서울": { lat: 37.5665, lng: 126.9780 },
  "부산": { lat: 35.1796, lng: 129.0756 },
  "인천": { lat: 37.4563, lng: 126.7052 },
  "대구": { lat: 35.8714, lng: 128.6014 },
  "광주": { lat: 35.1595, lng: 126.8526 },
  "대전": { lat: 36.3504, lng: 127.3845 },
  "울산": { lat: 35.5384, lng: 129.3114 },
  "세종": { lat: 36.4801, lng: 127.2892 },
  "경기": { lat: 37.4138, lng: 127.5183 },
  "강원": { lat: 37.8228, lng: 128.1555 },
  "충북": { lat: 36.6357, lng: 127.4915 },
  "충남": { lat: 36.6588, lng: 126.6728 },
  "전북": { lat: 35.8242, lng: 127.1480 },
  "전남": { lat: 34.8161, lng: 126.4629 },
  "경북": { lat: 36.5760, lng: 128.5059 },
  "경남": { lat: 35.2382, lng: 128.6924 },
  "제주": { lat: 33.4996, lng: 126.5312 },
  // 주요 도시 좌표 추가
  "전주": { lat: 35.8242, lng: 127.1480 },
  "여수": { lat: 34.7604, lng: 127.6622 },
  "강릉": { lat: 37.7519, lng: 128.8960 },
  "속초": { lat: 38.2070, lng: 128.5918 },
  "춘천": { lat: 37.8813, lng: 127.7300 },
  "포항": { lat: 36.0190, lng: 129.3434 },
  "창원": { lat: 35.2277, lng: 128.6819 },
  "수원": { lat: 37.2636, lng: 127.0286 },
  "성남": { lat: 37.4449, lng: 127.1389 },
  "용인": { lat: 37.2411, lng: 127.1775 },
  "고양": { lat: 37.6584, lng: 126.8320 },
  "남양주": { lat: 37.6365, lng: 127.2162 },
  "하남": { lat: 37.5392, lng: 127.2148 },
  "파주": { lat: 37.8154, lng: 126.7937 },
  "김포": { lat: 37.6156, lng: 126.7155 },
  "평택": { lat: 36.9920, lng: 127.1127 },
  "오산": { lat: 37.1498, lng: 127.0772 },
  "안산": { lat: 37.3219, lng: 126.8309 },
  "시흥": { lat: 37.3799, lng: 126.8035 },
  "군포": { lat: 37.3616, lng: 126.9357 },
  "의왕": { lat: 37.3446, lng: 126.9683 },
  "안양": { lat: 37.3942, lng: 126.9568 },
  "과천": { lat: 37.4291, lng: 126.9878 },
  "광명": { lat: 37.4792, lng: 126.8646 },
  "부천": { lat: 37.5035, lng: 126.7660 },
  "김해": { lat: 35.2284, lng: 128.8894 },
  "양산": { lat: 35.3380, lng: 129.0334 },
  "밀양": { lat: 35.5035, lng: 128.7464 },
  "진주": { lat: 35.1802, lng: 128.1077 },
  "통영": { lat: 34.8544, lng: 128.4331 },
  "거제": { lat: 34.8806, lng: 128.6210 },
  "목포": { lat: 34.8118, lng: 126.3928 },
  "순천": { lat: 34.9506, lng: 127.4872 },
  "나주": { lat: 35.0162, lng: 126.7108 },
  "광양": { lat: 34.9407, lng: 127.6959 },
  "제주시": { lat: 33.4996, lng: 126.5312 },
  "서귀포시": { lat: 33.2541, lng: 126.5600 }
};

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDates, setSelectedDates] = useState({ startDate: "", endDate: "" });
  const searchRef = useRef(null);

  // 한국의 주요 도시 및 관광지 목록
  const destinations = [
    '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    '전주', '여수', '강릉', '속초', '춘천', '포항', '창원', '수원', '성남',
    '용인', '고양', '남양주', '하남', '파주', '김포', '평택', '오산', '안산',
    '시흥', '군포', '의왕', '안양', '과천', '광명', '부천', '인천', '김해',
    '양산', '밀양', '진주', '통영', '거제', '창녕', '함안', '의령', '합천',
    '거창', '산청', '하동', '남해', '사천', '고성', '창원', '마산', '진해',
    '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥',
    '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광',
    '장성', '완도', '진도', '신안', '군산', '익산', '정읍', '남원',
    '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안',
    '제주시', '서귀포시', '애월읍', '한림읍', '대정읍', '안덕면', '표선면',
    '성산읍', '구좌읍', '조천읍', '한경면', '추자면', '우도면'
  ];

  // 검색어 입력 시 자동완성 결과 업데이트
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filteredResults = destinations.filter(destination =>
      destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults.slice(0, 5));
  }, [searchQuery]);

  // 검색창 외부 클릭 시 결과 숨기기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleResultClick = (destination) => {
    setSearchQuery(destination);
    setSelectedRegion(destination);
    setShowResults(false);
    setShowRegionModal(true);
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setShowRegionModal(false);
    setShowDateModal(true);
  };

  const handleDateSubmit = (dates) => {
    setSelectedDates(dates);
    setShowDateModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    // 선택된 지역의 좌표 정보 가져오기
    const coordinates = regionCoordinates[selectedRegion] || { lat: 36.5, lng: 127.8 };
    
    navigate('/select', { 
      state: { 
        region: selectedRegion,
        coordinates: coordinates,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate
      } 
    });
  };

  // 슬라이더 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: false
        }
      }
    ]
  };

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-overlay">
          <h1>Barrier-Free 여행</h1>
          <div className="searchBox" ref={searchRef}>
            <input
              type="text"
              placeholder="여행 지역을 입력해주세요"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
            />
            {showResults && searchResults.length > 0 && (
              <div className="searchResults">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="searchResultItem"
                    onClick={() => handleResultClick(result)}
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="travelBtn" onClick={() => setShowRegionModal(true)}>여행하기</button>
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <section className="features-section">
        <Slider {...sliderSettings} className="feature-slider">
          <div className="feature-slide">
            <div className="feature-block">
              <h2 className="feature-title">모든 사람을 위한 여행</h2>
              <p className="feature-subtitle">장벽 없는 여행의 시작</p>
              <div className="feature-content">
                <div className="feature-image wheelchair"></div>
                <div className="feature-description">
                  <h3>편안한 이동, 자유로운 여행</h3>
                  <p>휠체어 이용자도 걱정 없이 즐길 수 있는 여행지를 소개합니다. 무장애 시설이 완비된 관광지부터 휠체어 택시 예약, 장애인 전용 주차장까지. 여행의 모든 순간을 편안하게.</p>
                  <ul className="feature-list">
                    <li>✓ 무장애 시설 상세 정보 제공</li>
                    <li>✓ 휠체어 대여/택시 예약 서비스</li>
                    <li>✓ 장애인 전용 주차장 위치 안내</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-slide">
            <div className="feature-block reverse">
              <h2 className="feature-title">시각장애인을 위한 여행</h2>
              <p className="feature-subtitle">소리로 만나는 새로운 경험</p>
              <div className="feature-content">
                <div className="feature-description">
                  <h3>더 풍부한 여행 경험</h3>
                  <p>음성 안내로 여행지의 모든 것을 느껴보세요. 점자 안내판과 음성 설명이 있는 전시관, 촉각 체험 프로그램까지. 시각을 넘어선 특별한 여행 경험을 선사합니다.</p>
                  <ul className="feature-list">
                    <li>✓ 실시간 음성 안내 서비스</li>
                    <li>✓ 점자 정보와 촉각 체험 프로그램</li>
                    <li>✓ 시각장애인 전용 관광 코스</li>
                  </ul>
                </div>
                <div className="feature-image visual"></div>
              </div>
            </div>
          </div>

          <div className="feature-slide">
            <div className="feature-block">
              <h2 className="feature-title">청각장애인을 위한 여행</h2>
              <p className="feature-subtitle">소통의 즐거움, 여행의 행복</p>
              <div className="feature-content">
                <div className="feature-image hearing"></div>
                <div className="feature-description">
                  <h3>소통의 장벽을 넘어</h3>
                  <p>수어 통역사와 함께하는 특별한 여행. 모든 안내와 설명이 수어로 제공되며, 자막이 있는 공연과 전시까지. 여행지에서 만나는 모든 순간을 편안하게 소통하세요.</p>
                  <ul className="feature-list">
                    <li>✓ 실시간 수어 통역 서비스</li>
                    <li>✓ 자막이 있는 공연/전시 정보</li>
                    <li>✓ 청각장애인 맞춤 관광 가이드</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-slide">
            <div className="feature-block reverse">
              <h2 className="feature-title">맞춤형 여행 계획</h2>
              <p className="feature-subtitle">AI가 제안하는 특별한 여행</p>
              <div className="feature-content">
                <div className="feature-description">
                  <h3>나만을 위한 완벽한 여행</h3>
                  <p>장애 유형과 선호도를 고려한 맞춤형 여행 코스를 추천해드립니다. 편의시설, 교통, 숙박까지 모든 것을 고려한 완벽한 여행 계획. AI가 당신의 여행을 더 특별하게 만들어드립니다.</p>
                  <ul className="feature-list">
                    <li>✓ AI 기반 맞춤형 여행 코스</li>
                    <li>✓ 실시간 교통/편의시설 정보</li>
                    <li>✓ 장애인 친화 숙소 추천</li>
                  </ul>
                </div>
                <div className="feature-image ai"></div>
              </div>
            </div>
          </div>
        </Slider>
      </section>

      <RegionModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onConfirm={handleRegionSelect}
        destination={selectedRegion}
      />

      <DateInputModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={handleDateSubmit}
        region={selectedRegion}
      />

      <FinalConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default HomePage;
