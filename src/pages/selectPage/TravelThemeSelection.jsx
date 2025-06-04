import React, { useState } from "react";
import ThemeCard from "./ThemeCard";
import styles from '../../css/selectpages/TravelThemeSelection.module.css';

const TravelThemeSelection = ({ onSelect }) => {
  const themes = [
    {
      id: "history",
      title: "역사탐방",
      imageUrl: "/images/themes/history.jpg",
    },
    {
      id: "nature",
      title: "자연주의",
      imageUrl: "/images/themes/nature.jpg",
    },
    {
      id: "city",
      title: "도시위주",
      imageUrl: "/images/themes/city.jpg",
    },
    {
      id: "cafe",
      title: "예쁜카페",
      imageUrl: "/images/themes/cafe.jpg",
    },
  ];

  const [selectedTheme, setSelectedTheme] = useState(null);

  const handleThemeSelect = (id) => {
    // 같은 테마를 다시 클릭하면 선택 해제
    const newSelection = selectedTheme === id ? null : id;
    setSelectedTheme(newSelection);
    onSelect(newSelection ? [newSelection] : []); // 배열 형태 유지하되 단일 값만 전달
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        💫 희망하는 여행 테마를 선택 해주세요.{" "}
      </h2>
      <div className={styles.themeGrid} role="radiogroup" aria-label="여행 테마 선택">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            title={theme.title}
            imageUrl={theme.imageUrl}
            onClick={() => handleThemeSelect(theme.id)}
            isSelected={selectedTheme === theme.id}
          />
        ))}
      </div>
    </section>
  );
};

export default TravelThemeSelection;