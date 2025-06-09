"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/communitypages/CommunityPage.module.css";
import WritePageModal from "../WritePage/WritePageModal";
import axiosInstance from "../../utils/axiosConfig";
import debounce from "lodash/debounce";

const DISABILITY_TYPES = [
  { key: "all", label: "전체" },
  { key: "wheelchair", label: "휠체어 이용자" },
  { key: "visual", label: "시각 장애인" },
  { key: "hearing", label: "청각 장애인" },
];

const SEARCH_TYPES = [
  { key: "title", label: "제목" },
  { key: "content", label: "내용" },
  { key: "region", label: "지역" },
  { key: "nickname", label: "작성자" },
];

function CommunityPage() {
  const navigate = useNavigate();
  // 새로운 디자인의 상태들
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 기존 API 로직 상태들
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [searchType, setSearchType] = useState("title");

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  // API 호출 로직 (axiosInstance 사용)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedType && selectedType !== 'all') params.append('disabilityType', selectedType);
        if (searchTerm) {
          params.append('searchTerm', searchTerm);
          params.append('searchType', searchType);
        }
        if (selectedRegion) params.append('region', selectedRegion);
        
        const response = await axiosInstance.get(`/posts?${params.toString()}`);
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('포스트 목록 가져오기 실패:', error);
        setError('포스트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedType, searchTerm, selectedRegion, searchType]);

  // 글 작성 버튼 클릭 핸들러
  const handleWriteClick = () => {
    console.log('글 작성 버튼 클릭됨');
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const handleCardClick = (courseId, postTitle, postId) => {
    navigate(`/courses/${courseId}`, {
      state: {
        from: 'community',
        postTitle,
        postId
      }
    });
  };

  // 카드 리스트에서 검색어가 포함된 게시글만 보여주기
  const filteredPosts = posts.filter(post => {
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;

    switch (searchType) {
      case "title":
        return post.title?.toLowerCase().includes(keyword);
      case "content":
        return post.content?.toLowerCase().includes(keyword);
      case "region":
        return post.region?.toLowerCase().includes(keyword);
      case "nickname":
        return post.userName?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

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
          <form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
            <select 
              value={searchType}
              onChange={handleSearchTypeChange}
              className={styles.searchTypeSelect}
            >
              {SEARCH_TYPES.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              className={styles.searchInput}
              type="text"
              placeholder={`${SEARCH_TYPES.find(type => type.key === searchType)?.label} 검색`}
              value={searchInput}
              onChange={handleSearchChange}
            />
          </form>
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
          {filteredPosts.length === 0 ? (
            <div className={styles.noResult}>검색 결과가 없습니다.</div>
          ) : (
            filteredPosts.map((post) => (
              <div 
                key={post.postId} 
                className={styles.card}
                onClick={() => handleCardClick(post.courseId, post.title, post.postId)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`${styles.cardType} ${styles[`type${post.disabilityType.charAt(0).toUpperCase() + post.disabilityType.slice(1)}`]}`}>
                  {DISABILITY_TYPES.find(type => type.key === post.disabilityType)?.label}
                </div>
                <img 
                  src={post.courseImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                  alt={post.title} 
                  className={styles.cardImage} 
                />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <div className={styles.cardTags}>
                    {post.courseTitle && (
                      <span className={styles.cardTag}>#{post.courseTitle}</span>
                    )}
                    {post.region && (
                      <span className={styles.cardTag}>#{post.region}</span>
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardLocal}>
                      {post.region || '전체지역'}
                    </div>
                    {post.keywords && (
                      <div className={styles.cardKeywords} style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {post.keywords.split(',').map((kw, idx) => (
                          <span key={idx} style={{ color: '#1976d2', fontWeight: 500, fontSize: '0.95em' }}>#{kw.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className={styles.cardStats}>
                      <span>👁️ {post.viewCount || 0}</span>
                      <span className={post.isLiked ? styles.likedHeart : ''}>❤️ {post.likeCount || 0}</span>
                    </div>
                  </div>
                  <div className={styles.cardAuthor}>
                    by {post.userName || '익명'}
                  </div>
                  <div className={styles.cardDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
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