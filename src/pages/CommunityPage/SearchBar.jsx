import React, { useState } from "react";
import styles from "../../css/communitypages/SearchBar.module.css"; // CSS 모듈 import 경로 수정

function SearchBar({ placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const clearInput = () => {
    setInputValue("");
  };

  return (
    <div className={styles.searchBarContainer}>
      <input
        type="text"
        placeholder={placeholder}
        className={styles.searchInput}
        value={inputValue}
        onChange={handleInputChange}
      />
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/05afde3f510438352a2d148c5effaf0f44a7212c?placeholderIfAbsent=true&apiKey=51da45a900b44128b831ca29137094ce"
        alt="Search icon"
        className={styles.searchIcon}
        onClick={clearInput}
      />
    </div>
  );
}

export default SearchBar;
