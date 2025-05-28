import React, { useState } from "react";
import UserTypeSelection from "./selectPage/UserTypeSelection";
import TravelThemeSelection from "./selectPage/TravelThemeSelection";
import DestinationSearch from "./selectPage/DestinationSearch";
import AddedPlacesList from "./selectPage/AddedPlacesList";
import GenerateButton from "./selectPage/GenerateButton";
import MustVisitPlaces from "./selectPage/MustVisitPlaces";
import styles from '../css/selectpages/SelectPages.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "./selectPage/SuccessModal";

const SelectPages = () => {
  const [userType, setUserType] = useState("general");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [addedPlaces, setAddedPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [region, setRegion] = useState(location.state?.region || "사용자 선택");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      navigate("/course", { state: { mustVisitPlaces: addedPlaces, region, startDate, endDate } });
    }, 1500);
  };

  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <UserTypeSelection onSelect={handleUserTypeSelect} />

        <TravelThemeSelection onSelect={handleThemeSelect} />

        <section className={styles.destinationSection}>
          {/* <h2 className={styles.destinationHeading}>
            🏙️ 꼭 포함하고 싶은 여행지를 선택 해주세요.
          </h2> */}

          <MustVisitPlaces onChange={setAddedPlaces} />
        </section>

        <GenerateButton onClick={handleGenerate} />
      </main>
      {showModal && <SuccessModal message="일정이 생성되었습니다!" />}
    </div>
  );
};

export default SelectPages;

