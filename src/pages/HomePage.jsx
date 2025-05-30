import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    navigate('/select', { 
      state: { 
        region: selectedRegion,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate
      } 
    });
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

      {/* 베스트 여행지 카드 */}
      <section className="best-destinations">
        <h2> 베스트 여행지</h2>
        <div className="card-container">

    <div className="destination-card jeju">
      <div className="overlay">
        <h3>JEJU<br /><span>제주도</span></h3>
      </div>
    </div>

    <div className="destination-card seoul">
      <div className="overlay">
        <h3>SEOUL<br /><span>서울</span></h3>
      </div>
    </div>

    <div className="destination-card busan">
      <div className="overlay">
        <h3>BUSAN<br /><span>부산</span></h3>
      </div>
    </div>

    <div className="destination-card suwon">
      <div className="overlay">
        <h3>SUWON<br /><span>수원</span></h3>
      </div>
    </div>
    
  </div>
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
