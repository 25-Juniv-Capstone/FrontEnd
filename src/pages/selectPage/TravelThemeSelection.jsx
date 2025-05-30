import React, { useState } from "react";
import ThemeCard from "./ThemeCard";
import styles from '../../css/selectpages/TravelThemeSelection.module.css';

const TravelThemeSelection = ({ onSelect }) => {
  const themes = [
    {
      id: "history",
      title: "역사탐방",
      imageUrl: "https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/645713b954d11b1aa22db62550e582af133e44ec?placeholderIfAbsent=true",
    },
    {
      id: "nature",
      title: "자연주의",
      imageUrl: "https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/8428a3168a300e47ef7dacb5300722d95ac30234?placeholderIfAbsent=true",
    },
    {
      id: "city",
      title: "도시위주",
      imageUrl: "https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/26a0bdcfde47145ed84054fbe2c692c203e86771?placeholderIfAbsent=true",
    },
    {
      id: "activity",
      title: "엑티비티",
      imageUrl: "https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/26a0bdcfde47145ed84054fbe2c692c203e86771?placeholderIfAbsent=true",
    },
    {
      id: "cafe",
      title: "예쁜카페",
      imageUrl: "https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/26a0bdcfde47145ed84054fbe2c692c203e86771?placeholderIfAbsent=true",
    },
  ];

  const [selectedThemes, setSelectedThemes] = useState([]);

  const toggleTheme = (id) => {
    const newSelection = selectedThemes.includes(id)
      ? selectedThemes.filter((themeId) => themeId !== id)
      : [...selectedThemes, id];
    
    setSelectedThemes(newSelection);
    onSelect(newSelection);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        💫 희망하는 여행 테마를 선택 해주세요.{" "}
      </h2>
      <div className={styles.themeGrid}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            title={theme.title}
            imageUrl={theme.imageUrl}
            onClick={() => toggleTheme(theme.id)}
            isSelected={selectedThemes.includes(theme.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default TravelThemeSelection;