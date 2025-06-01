"use client";
import React, { useState } from "react";
import FilterButton from "./FilterButton";
import SearchBar from "./SearchBar";
import TravelCard from "./TravelCard";
import WritePageModal from "../WritePage/WritePage";
import styles from "../../css/communitypages/CommunityPage.module.css"; // CSS 모듈 import 경로 수정

function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState(null); // 단일 선택을 위한 상태
  const [isWriteModalOpen, setWriteModalOpen] = useState(false); // 모달 상태 추가

  const filterOptions = [
    "휠체어 이용자",
    "시각 장애인",
    "청각 장애인"
  ];

  const handleFilterClick = (option) => {
    setActiveFilter(prevFilter => {
      // 같은 필터를 다시 클릭하면 선택 해제
      if (prevFilter === option) {
        return null;
      }
      // 다른 필터를 클릭하면 해당 필터 선택
      return option;
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
            isActive={activeFilter === option} // 단일 선택 비교
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