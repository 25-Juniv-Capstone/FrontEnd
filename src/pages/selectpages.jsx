import React, { useState } from "react";
import UserTypeSelection from "@/pages/selectPage/UserTypeSelection";
import TravelThemeSelection from "@/pages/selectPage/TravelThemeSelection";
import DestinationSearch from "@/pages/selectPage/DestinationSearch";
import AddedPlacesList from "@/pages/selectPage/AddedPlacesList";
import GenerateButton from "@/pages/selectPage/GenerateButton";
import styles from '@/css/selectpages/SelectPages.module.css';

const SelectPages = () => {
  const [userType, setUserType] = useState("general");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [addedPlaces, setAddedPlaces] = useState([
    { id: "default1", name: "좋아 숙소", memo: "메모" },
    { id: "default2", name: "싫어 아울렛", memo: "메모" },
  ]);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  const handleThemeSelect = (themes) => {
    setSelectedThemes(themes);
  };

  const handleAddPlace = (place) => {
    if (!addedPlaces.some((p) => p.id === place.id)) {
      setAddedPlaces([...addedPlaces, place]);
    }
  };

  const handleRemovePlace = (id) => {
    setAddedPlaces(addedPlaces.filter((place) => place.id !== id));
  };

  const handleGenerate = () => {
    console.log({
      userType,
      selectedThemes,
      addedPlaces,
    });
    alert("여행 계획이 생성되었습니다!");
  };

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <UserTypeSelection onSelect={handleUserTypeSelect} />

        <TravelThemeSelection onSelect={handleThemeSelect} />

        <section className={styles.destinationSection}>
          <h2 className={styles.destinationHeading}>
            🏙️ 꼭 포함하고 싶은 여행지를 선택 해주세요.
          </h2>

          <DestinationSearch onAddPlace={handleAddPlace} />

          <AddedPlacesList
            places={addedPlaces}
            onRemovePlace={handleRemovePlace}
          />
        </section>

        <GenerateButton onClick={handleGenerate} />
      </main>
    </div>
  );
};

export default SelectPages;

