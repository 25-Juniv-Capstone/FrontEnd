import React, { useState, useEffect } from "react";
import UserTypeSelection from "./selectPage/UserTypeSelection";
import TravelThemeSelection from "./selectPage/TravelThemeSelection";
import DestinationSearch from "./selectPage/DestinationSearch";
import AddedPlacesList from "./selectPage/AddedPlacesList";
import GenerateButton from "./selectPage/GenerateButton";
import MustVisitPlaces from "./selectPage/MustVisitPlaces";
import styles from '../css/selectpages/SelectPages.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "./selectPage/SuccessModal";
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const SelectPages = () => {
  const [userType, setUserType] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [addedPlaces, setAddedPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // location.state 로깅
  useEffect(() => {
    // console.log('SelectPage received location state:', location.state);
  }, [location.state]);

  const [region, setRegion] = useState(location.state?.region || "사용자 선택");
  const [startDate, setStartDate] = useState(location.state?.startDate || "");
  const [endDate, setEndDate] = useState(location.state?.endDate || "");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // HomePage에서 전달받은 날짜 정보가 있으면 사용
  useEffect(() => {
    if (location.state?.startDate && location.state?.endDate) {
      // console.log('Setting dates from location state:', {
      //   startDate: location.state.startDate,
      //   endDate: location.state.endDate
      // });
      setStartDate(location.state.startDate);
      setEndDate(location.state.endDate);
    }
  }, [location.state]);

  const handleUserTypeSelect = (types) => {
    setUserType(types);
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

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    console.log('Loading started:', { isLoading: true, region });  // 디버깅용 로그
    
    try {
      // 필수 데이터 검증
      if (!region || region === "사용자 선택") {
        throw new Error('지역을 선택해주세요.');
      }

      // 날짜 정보 로깅
      // console.log('Date check before validation:', {
      //   startDate,
      //   endDate,
      //   locationState: location.state,
      //   hasStartDate: Boolean(startDate),
      //   hasEndDate: Boolean(endDate)
      // });

      if (!startDate || !endDate) {
        throw new Error('여행 날짜를 선택해주세요. HomePage에서 날짜를 선택한 후 다시 시도해주세요.');
      }

      // 테마 ID를 한글로 변환하는 매핑
      const themeMapping = {
        "history": "역사탐방",
        "nature": "자연주의", 
        "city": "도시위주",
        "activity": "엑티비티",
        "cafe": "예쁜카페"
      };

      // 장애 유형을 한글로 변환하는 매핑
      const userTypeMapping = {
        "wheelchair": "휠체어 이용자",
        "visuallyImpaired": "시각 장애인",
        "hearingImpaired": "청각 장애인"
      };

      // 키워드 배열 구성
      let keywords = [];
      
      // 선택된 테마를 한글로 변환하여 추가
      if (selectedThemes.length > 0) {
        keywords = selectedThemes.map(theme => themeMapping[theme] || theme);
      }
      
      // 선택된 장애 유형을 한글로 변환하여 추가
      if (Array.isArray(userType) && userType.length > 0) {
        const userTypeKeywords = userType.map(type => userTypeMapping[type] || type);
        keywords = [...keywords, ...userTypeKeywords];
      }
      
      // "무장애" 키워드가 없으면 추가
      if (!keywords.includes("무장애")) {
        keywords.push("무장애");
      }
      
      // 기본 키워드가 없으면 "관광" 추가
      if (keywords.length === 1 && keywords[0] === "무장애") {
        keywords.push("관광");
      }

      // backend-ai API 요청 데이터 구성
      const requestData = {
        region: region,
        keywords: keywords,
        duration: getDateDiff(startDate, endDate),
        must_visit_places: addedPlaces.map(place => place.place_name || place.name),
        num_courses: 1,
        model: "gemini"
      };

      // console.log('Sending request data:', JSON.stringify(requestData, null, 2));

      // 데이터 유효성 검증
      if (!requestData.region || requestData.region === "사용자 선택") {
        throw new Error('유효하지 않은 지역 정보입니다.');
      }

      // backend-ai API 호출
      const response = await axios.post(
        'http://158.247.239.241:8000/api/travel-recommendation',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // console.log('Backend response:', JSON.stringify(response.data, null, 2));

      // 응답 데이터 검증
      if (!response.data.recommended_courses || response.data.recommended_courses.length === 0) {
        throw new Error('추천 코스를 생성하지 못했습니다. 다시 시도해주세요.');
      }

      // CoursePage로 이동하면서 데이터 전달
      const navigationData = {
        courseData: response.data,
        region: region,
        startDate: startDate,
        endDate: endDate,
        mustVisitPlaces: addedPlaces
      };
      
      // console.log('Navigating to CoursePage with data:', JSON.stringify(navigationData, null, 2));
      
      navigate("/course", { 
        state: navigationData
      });

    } catch (error) {
      console.error('Error in handleGenerate:', error);  // 디버깅용 로그
      let errorMessage = '코스 생성 중 오류가 발생했습니다.';
      
      if (error.response?.data) {
        // 백엔드에서 반환한 에러 메시지 처리
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data)) {
          // FastAPI validation error 형식 처리
          errorMessage = error.response.data
            .map(err => err.msg || '유효하지 않은 입력입니다.')
            .join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      console.log('Loading finished:', { isLoading: false });  // 디버깅용 로그
      setIsLoading(false);
    }
  };

  // 날짜 차이 계산 함수
  const getDateDiff = (start, end) => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  };

  return (
    <div className={styles.container}>
      {console.log('Render state:', { isLoading, region })}
      {isLoading && <LoadingSpinner region={region} />}
      <main className={styles.main}>
        <UserTypeSelection onSelect={handleUserTypeSelect} />
        <TravelThemeSelection onSelect={handleThemeSelect} />
        <section className={styles.destinationSection}>
          {/* <h2 className={styles.destinationHeading}>
            🏙️ 꼭 포함하고 싶은 여행지를 선택 해주세요.
          </h2> */}

          <MustVisitPlaces onChange={setAddedPlaces} />
        </section>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {typeof error === 'string' ? error : '알 수 없는 오류가 발생했습니다.'}
          </div>
        )}

        <GenerateButton 
          onClick={handleGenerate} 
          disabled={isLoading}
          loading={isLoading}
        />
      </main>
      {showModal && <SuccessModal message="일정이 생성되었습니다!" />}
    </div>
  );
};

export default SelectPages;

