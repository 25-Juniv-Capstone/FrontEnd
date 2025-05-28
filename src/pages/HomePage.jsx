import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleTravelClick = () => {
    navigate('/select');
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-overlay">
          <h1>Barrier-Free 여행</h1>
          <div className="searchBox">
            <input type="text" placeholder="여행 지역을 입력해주세요" />
          </div>
          <button className="travelBtn" onClick={handleTravelClick}>여행하기</button>
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

    </div>
  );
}

export default HomePage;
