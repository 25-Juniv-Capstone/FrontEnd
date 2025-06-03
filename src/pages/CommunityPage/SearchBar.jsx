import React from "react";
import styles from "../../css/communitypages/SearchBar.module.css"; // CSS 모듈 import 경로 수정

function SearchBar({ placeholder, value, onChange, onSubmit, onClear }) {
  return (
    <form className={styles.searchBarContainer} onSubmit={onSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        className={styles.searchInput}
        value={value}
        onChange={onChange}
      />
      {value && (
        <button 
          type="button"
          className={`${styles.clearButton} ${styles.iconButton}`}
          onClick={onClear}
        >
          &#x2715;
        </button>
      )}
    </form>
  );
}

export default SearchBar;
