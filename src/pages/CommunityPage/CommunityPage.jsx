"use client";
import React, { useState, useEffect } from "react";
import FilterButton from "./FilterButton";
import SearchBar from "./SearchBar";
import TravelCard from "./TravelCard";
import WritePageModal from "../WritePage/WritePage";
import { Link, useNavigate } from 'react-router-dom';
import styles from "../../css/communitypages/CommunityPage.module.css"; // CSS 모듈 import 경로 수정

function CommunityPage() {
  const [activeFilters, setActiveFilters] = useState([]); // 초기 상태를 빈 배열로 변경 (복수 선택을 위해)
  const [isWriteModalOpen, setWriteModalOpen] = useState(false); // 모달 상태 추가
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 글쓰기 페이지 이동을 위해 사용

  const [searchTerm, setSearchTerm] = useState(""); // 사용자가 입력하는 검색어
  const [searchQuery, setSearchQuery] = useState(""); // 실제 API 요청에 사용될 검색어

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

  const closeWriteModal = () => setWriteModalOpen(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); // form 기본 동작 방지
    setSearchQuery(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery(""); // 실제 검색 필터도 초기화
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      let apiUrl = '/api/post';
      const params = new URLSearchParams();

      if (activeFilters.length > 0) {
        params.append('keywords', activeFilters.join(','));
      }

      if (searchQuery) {
        params.append('search', searchQuery); // 'search'는 예시이며, 백엔드와 협의된 파라미터명 사용
      }

      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilters, searchQuery]); // searchQuery가 변경될 때도 useEffect 실행

  const handleWriteButtonClick = () => {
    // 로그인 여부 확인 로직이 필요하다면 여기에 추가
    navigate('/write'); // 글쓰기 페이지 경로 (App.jsx에 정의된 경로)
  };

  // travelCards 샘플 데이터 삭제
  // const travelCards = Array(8).fill({ ... });

  if (loading) {
    return <div className={styles.loadingContainer}>게시글 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>오류가 발생했습니다: {error}. API 응답 및 백엔드 로그를 확인해주세요.</div>;
  }

  return (
    <main className={styles.mainContainer}>
      <header className={styles.pageHeader}>
        {/* <button onClick={handleWriteButtonClick} className={styles.writeButton}>
          ✏️ 글쓰기
        </button> */}
      </header>

      <section className={styles.filterSection}>
        {filterOptions.map((option) => (
          <FilterButton
            key={option}
            label={option}
            isActive={activeFilters.includes(option)} // 배열에 포함 여부로 활성 상태 결정
            onClick={() => handleFilterClick(option)}
          />
        ))}
        <SearchBar 
          placeholder="검색어를 입력하세요" 
          value={searchTerm}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit} 
          onClear={handleClearSearch}
        />
      </section>

      {/* API에서 받아온 posts 데이터로 TravelCard를 렌더링 */}
      {/* 현재는 posts 배열 전체를 한 번에 보여주지만, 추후 페이지네이션 구현 가능 */}
      {posts.length > 0 ? (
        <section className={styles.cardSection}>
          <div className={styles.cardGrid}>
            {posts.map((post, index) => (
              <TravelCard
                key={post.postId || index} // post.postId를 key로 사용
                title={post.title} // 게시글 제목
                // API 응답에 course 관련 keywords, field가 포함되어야 tags, local에 매핑 가능
                // 현재 PostResponse에는 courseId, courseTitle만 있음.
                // tags={post.course?.keywords ? post.course.keywords.join(', ') : (post.field || '일반')} 
                tags={post.field ? [post.field] : (post.courseTitle ? [post.courseTitle] : [])} // 임시: 게시글 field 또는 courseTitle을 태그로 사용
                local={post.courseTitle || '전체지역'} // 임시: courseTitle을 지역 정보로 사용, 없으면 '전체지역'
                author={post.userName || '익명'} // 작성자 닉네임
                imageUrl={post.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'} // 썸네일 URL, 없을 경우 placeholder
                // postId={post.postId} // TravelCard 내부에서 상세 페이지 이동 시 필요하면 전달
              />
            ))}
          </div>
        </section>
      ) : (
        !loading && <div className={styles.noPosts}>조건에 맞는 게시글이 없습니다.</div>
      )}
      
      {/* 기존 게시글 테이블 형식은 주석 처리 또는 삭제 (TravelCard 형식으로 대체) */}
      {/* {posts.length > 0 && (
        <table className={styles.postsTable}>
          <thead> ... </thead>
          <tbody> ... </tbody>
        </table>
      )} */}

      {/* WritePageModal 관련 부분도 현재 API 연동과 직접적 관련 없으므로 주석 처리 */}
      {/* <WritePageModal isOpen={isWriteModalOpen} onClose={closeWriteModal} /> */}
    </main>
  );
}

export default CommunityPage;