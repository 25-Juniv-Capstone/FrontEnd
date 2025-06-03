"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/communitypages/CommunityPage.module.css";
import WritePageModal from "../WritePage/WritePageModal";

const DISABILITY_TYPES = [
  { key: "wheelchair", label: "휠체어 이용자" },
  { key: "visual", label: "시각 장애인" },
  { key: "hearing", label: "청각 장애인" },
];

function CommunityPage() {
  // 새로운 디자인의 상태들
  const [selectedType, setSelectedType] = useState("wheelchair");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 기존 API 로직 상태들
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();

  // API 호출 로직 (기존 브랜치의 것 유지)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      let apiUrl = '/api/post';
      const params = new URLSearchParams();

      // 장애유형 필터링
      if (selectedType) {
        params.append('type', selectedType);
      }

      // 검색어 필터링
      if (search) {
        params.append('search', search);
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
  }, [selectedType, search]);

  // 글 작성 버튼 클릭 핸들러
  const handleWriteClick = () => {
    console.log('글 작성 버튼 클릭됨');
    setIsModalOpen(true);
  };

  // 검색어 변경 핸들러 (디바운싱 효과를 위해 실시간 검색 대신 약간의 지연)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>게시글 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>오류가 발생했습니다: {error}. API 응답 및 백엔드 로그를 확인해주세요.</div>;
  }

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
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className={styles.writeButton}
          onClick={handleWriteClick}
        >
          글 작성
        </button>
      </div>

      {/* 카드 리스트 (API 데이터 사용) */}
      <div className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {posts.length === 0 ? (
            <div className={styles.noResult}>검색 결과가 없습니다.</div>
          ) : (
            posts.map((post, index) => (
              <div key={post.postId || index} className={styles.card}>
                <div className={`${styles.cardType} ${styles[`type${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`]}`}>
                  {DISABILITY_TYPES.find(type => type.key === selectedType)?.label}
                </div>
                <img 
                  src={post.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                  alt={post.title} 
                  className={styles.cardImage} 
                />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <div className={styles.cardTags}>
                    {post.field && (
                      <span className={styles.cardTag}>#{post.field}</span>
                    )}
                    {post.courseTitle && (
                      <span className={styles.cardTag}>#{post.courseTitle}</span>
                    )}
                  </div>
                  <div className={styles.cardLocal}>{post.courseTitle || '전체지역'}</div>
                  <div className={styles.cardAuthor}>by {post.userName || '익명'}</div>
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