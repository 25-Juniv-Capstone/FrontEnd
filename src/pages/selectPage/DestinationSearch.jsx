import React, { useState } from "react";
import SearchListItem from "./SearchListItem";
import styles from '../../css/selectpages/DestinationSearch.module.css';

const DestinationSearch = ({ onAddPlace }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock search results - in a real app, this would come from an API
  const searchResults = [
    {
      id: "1",
      name: "국립 중앙 박물관",
      address: "서울 용산구 서빙고로 137 국립중앙박물관",
    },
    {
      id: "2",
      name: "국립 현대 미술 서울",
      address: "서울 종로구 삼청로 30",
    },
    {
      id: "3",
      name: "국립 민속 박물관",
      address: "서울 종로구 삼청로 37",
    },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // In a real app, you would trigger an API search here
  };

  const handleSelectPlace = (place) => {
    onAddPlace(place);
    setSearchQuery("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBarContainer}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconInnerWrapper}>
            <div className={styles.iconBox}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/6dda7243f1c758e4df496c30bd39df9a7e9f7321?placeholderIfAbsent=true"
                alt="Search icon"
                className={styles.icon}
              />
            </div>
          </div>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="장소를 검색해주세요"
              className={styles.input}
            />
          </div>
        </div>
      </div>
      <div className={styles.dividerContainer}>
        <div className={styles.divider} />
      </div>
      <div className={styles.resultsContainer}>
        {searchResults.map((place) => (
          <SearchListItem
            key={place.id}
            name={place.name}
            address={place.address}
            onSelect={() => handleSelectPlace(place)}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationSearch;