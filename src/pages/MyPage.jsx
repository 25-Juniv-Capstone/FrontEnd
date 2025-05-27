import '../css/MyPage.css';

function MyPage() {
  return (
    <div className="my-container">
      
      <header className="my-header">
        <div className="profile-image" />
        <h2 className="profile-name">홍길동</h2>
        <button className="edit-button">회원정보수정</button>
      </header>

      <nav className="tab-menu">
        <span className="active">내 여행</span>
        <span>내가 좋아요한 여행</span>
      </nav>

{/* 게시물 */}
      <section className="best-destinations">
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

export default MyPage;
