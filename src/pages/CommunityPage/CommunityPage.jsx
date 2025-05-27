"use client";
import React, { useState } from "react";
import FilterButton from "./FilterButton";
import SearchBar from "./SearchBar";
import TravelCard from "./TravelCard";
import WritePageModal from "../WritePage/WritePage";
import styles from "../../css/communitypages/CommunityPage.module.css"; // CSS 모듈 import 경로 수정

function CommunityPage() {
  const [activeFilters, setActiveFilters] = useState([]); // 초기 상태를 빈 배열로 변경 (복수 선택을 위해)
  const [isWriteModalOpen, setWriteModalOpen] = useState(false); // 모달 상태 추가

  const filterOptions = [
    "휠체어",
    "일반인",
    "시각장애",
    "청각장애",
    "노인",
    "유아",
  ];

  const handleFilterClick = (option) => {
    setActiveFilters(prevFilters => {
      if (prevFilters.includes(option)) {
        // 이미 활성화된 필터를 다시 클릭하면 선택 해제
        return prevFilters.filter(filter => filter !== option);
      } else {
        // 다른 필터를 클릭하면 해당 필터 활성화 (배열에 추가)
        return [...prevFilters, option];
      }
    });
  };

  const openWriteModal = () => setWriteModalOpen(true);
  const closeWriteModal = () => setWriteModalOpen(false);

  // Sample data for travel cards - Reverted to 8 items
  const travelCards = Array(8).fill({
    title: "제목",
    tags: "무장애유형",
    local : "지역",
    author: "작성자",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets/TEMP/439f39c492d18cd84459070b4b857af8a00fab36?placeholderIfAbsent=true&apiKey=51da45a900b44128b831ca29137094ce",
  });

  return (
    <main className={styles.mainContainer}>
      <section className={styles.filterSection}>
        {filterOptions.map((option) => (
          <FilterButton
            key={option}
            label={option}
            isActive={activeFilters.includes(option)} // 배열에 포함 여부로 활성 상태 결정
            onClick={() => handleFilterClick(option)}
          />
        ))}
        <SearchBar placeholder="검색어를 입력하세요" />
        <button onClick={openWriteModal} className={styles.createPostButton}> {/* 글쓰기 버튼 추가 */}
          글쓰기
        </button>
      </section>

      <section className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {travelCards.slice(0, 4).map((card, index) => (
            <TravelCard
              key={`row1-${index}`}
              title={card.title}
              tags={card.tags}
              local={card.local}
              author={card.author}
              imageUrl={card.imageUrl}
            />
          ))}
        </div>
        <div className={styles.cardGridSecondRow}>
          {travelCards.slice(4, 8).map((card, index) => (
            <TravelCard
              key={`row2-${index}`}
              title={card.title}
              tags={card.tags}
              local={card.local}
              author={card.author}
              imageUrl={card.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* 모달 컴포넌트 렌더링 */}
      <WritePageModal isOpen={isWriteModalOpen} onClose={closeWriteModal} />
      
    </main>
  );
}

export default CommunityPage;