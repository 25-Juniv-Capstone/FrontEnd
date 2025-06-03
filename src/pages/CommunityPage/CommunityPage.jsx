"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/communitypages/CommunityPage.module.css";
import WritePageModal from "../WritePage/WritePageModal";

const DISABILITY_TYPES = [
  { key: "wheelchair", label: "휠체어 이용자" },
  { key: "visual", label: "시각 장애인" },
  { key: "hearing", label: "청각 장애인" },
];

// 샘플 데이터 (실제론 API 등에서 받아올 수 있음)
const SAMPLE_COURSES = [
  {
    id: 1,
    type: "wheelchair",
    title: "부산 해운대 무장애 여행",
    region: "부산",
    author: "김여행",
    tags: ["해변", "맛집", "바다"],
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    type: "visual",
    title: "서울 도심 시각장애인 투어",
    region: "서울",
    author: "이베프",
    tags: ["도심", "문화", "역사"],
    imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    type: "hearing",
    title: "제주도 청각장애인 맞춤 여행",
    region: "제주",
    author: "박여행",
    tags: ["자연", "관광지", "해변"],
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    type: "wheelchair",
    title: "강원도 평창 무장애 스키장 투어",
    region: "강원",
    author: "최스키",
    tags: ["스키", "겨울", "액티비티"],
    imageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    type: "visual",
    title: "전주 한옥마을 촉각 체험 여행",
    region: "전주",
    author: "정문화",
    tags: ["한옥", "전통", "문화"],
    imageUrl: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    type: "hearing",
    title: "여수 바다 여행 - 청각장애인 맞춤 코스",
    region: "여수",
    author: "김바다",
    tags: ["바다", "섬", "해산물"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    type: "wheelchair",
    title: "서울 한강공원 무장애 산책로",
    region: "서울",
    author: "이한강",
    tags: ["공원", "산책", "도심"],
    imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    type: "visual",
    title: "경주 불국사 촉각 문화 체험",
    region: "경주",
    author: "박역사",
    tags: ["문화재", "역사", "전통"],
    imageUrl: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    type: "hearing",
    title: "인천 차이나타운 청각장애인 투어",
    region: "인천",
    author: "최중국",
    tags: ["중국", "맛집", "문화"],
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    type: "wheelchair",
    title: "대구 수성못 무장애 산책로",
    region: "대구",
    author: "김대구",
    tags: ["공원", "산책", "도심"],
    imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    type: "visual",
    title: "부여 백제문화단지 촉각 체험",
    region: "부여",
    author: "이백제",
    tags: ["역사", "문화", "전통"],
    imageUrl: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    type: "hearing",
    title: "강릉 해변 청각장애인 맞춤 코스",
    region: "강릉",
    author: "박강릉",
    tags: ["해변", "바다", "여름"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  }
];

function CommunityPage() {
  const [selectedType, setSelectedType] = useState("wheelchair");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 필터링된 코스 리스트
  const filteredCourses = SAMPLE_COURSES.filter(
    (course) =>
      course.type === selectedType &&
      (
        course.title.includes(search) ||
        course.region.includes(search) ||
        course.author.includes(search)
      )
  );

  // 글 작성 버튼 클릭 시 모달을 열도록 수정
  const handleWriteClick = () => {
    console.log('글 작성 버튼 클릭됨');
    setIsModalOpen(true);
  };

  return (
    <div className={styles.mainContainer}>
      {/* 상단 타이틀 */}
      <div className={styles.titleSection}>
        <h1>커뮤니티</h1>
        <p>장애유형별 무장애 여행코스를 공유하고 검색해보세요.</p>
      </div>

      {/* 장애유형 탭 + 검색 */}
      <div className={styles.filterSection}>
        <div className={styles.filterLeft}>
          <div className={styles.tabGroup}>
            {DISABILITY_TYPES.map((type) => (
              <button
                key={type.key}
                className={
                  selectedType === type.key
                    ? styles.tabButtonActive
                    : styles.tabButton
                }
                onClick={() => setSelectedType(type.key)}
              >
                {type.label}
              </button>
            ))}
          </div>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="지역, 장소, 작성자 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={styles.writeButton}
          onClick={handleWriteClick}
        >
          글 작성
        </button>
      </div>

      {/* 카드 리스트 */}
      <div className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {filteredCourses.length === 0 ? (
            <div className={styles.noResult}>검색 결과가 없습니다.</div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className={styles.card}>
                <div className={`${styles.cardType} ${styles[`type${course.type.charAt(0).toUpperCase() + course.type.slice(1)}`]}`}>
                  {DISABILITY_TYPES.find(type => type.key === course.type)?.label}
                </div>
                <img src={course.imageUrl} alt={course.title} className={styles.cardImage} />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                  <div className={styles.cardTags}>
                    {course.tags.map((tag, index) => (
                      <span key={index} className={styles.cardTag}>#{tag}</span>
                    ))}
                  </div>
                  <div className={styles.cardLocal}>{course.region}</div>
                  <div className={styles.cardAuthor}>by {course.author}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <WritePageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default CommunityPage;