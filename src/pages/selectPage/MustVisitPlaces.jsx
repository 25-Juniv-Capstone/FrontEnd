import React, { useState, useRef, useEffect } from "react";
import styles from '../../css/selectpages/MustVisitPlaces.module.css';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const MustVisitPlaces = ({ onChange }) => {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [places, setPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // HomePage에서 전달받은 좌표 사용
  const initialCoordinates = location.state?.coordinates || { lat: 36.5, lng: 127.8 };
  const [mapCenter, setMapCenter] = useState(initialCoordinates);
  
  const [markers, setMarkers] = useState([]);
  const searchRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const resultMarkers = useRef([]);

  // 지도 초기화 - HomePage에서 선택한 지역 좌표 사용
  useEffect(() => {
    if (window.google && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: initialCoordinates,
        zoom: 12,
      });
      placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [initialCoordinates]);

  // mapCenter가 바뀔 때 setCenter만 (지도 생성 후에만)
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  useEffect(() => {
    if (input.trim() === "" || !window.google) {
      setSearchResults([]);
      clearResultMarkers();
      return;
    }
    setIsLoading(true);
    autocompleteService.current.getPlacePredictions({ input, types: ['establishment'] }, (predictions, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
        setSearchResults([]);
        setIsLoading(false);
        clearResultMarkers();
        return;
      }
      const detailsPromises = predictions.slice(0, 7).map(pred =>
        new Promise(resolve => {
          placesService.current.getDetails({ placeId: pred.place_id, fields: ['name', 'formatted_address', 'types', 'place_id', 'geometry'] }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              resolve({
                id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                types: place.types,
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
              });
            } else {
              resolve(null);
            }
          });
        })
      );
      Promise.all(detailsPromises).then(results => {
        const filtered = results.filter(Boolean);
        setSearchResults(filtered);
        setIsLoading(false);
        if (filtered.length > 0 && filtered[0].lat && filtered[0].lng) {
          setMapCenter({ lat: filtered[0].lat, lng: filtered[0].lng });
        }
        showResultMarkers(filtered);
      });
    });
    // eslint-disable-next-line
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 지도에 검색 결과 마커 표시
  const showResultMarkers = (results) => {
    if (!mapInstance.current) return;
    clearResultMarkers();
    resultMarkers.current = results.map((place) => {
      if (!place.lat || !place.lng) return null;
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        title: place.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
      marker.addListener('click', () => {
        mapInstance.current.setCenter({ lat: place.lat, lng: place.lng });
      });
      return marker;
    }).filter(Boolean);
  };
  // 마커 제거
  const clearResultMarkers = () => {
    resultMarkers.current.forEach(marker => marker.setMap(null));
    resultMarkers.current = [];
  };

  // 선택한 장소 마커 표시
  useEffect(() => {
    if (!mapInstance.current) return;
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = places.map((place) => {
      if (!place.lat || !place.lng) return null;
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        title: place.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
      return marker;
    }).filter(Boolean);
    setMarkers(newMarkers);
  }, [places]);

  const handleAdd = (place) => {
    if (place && !places.some(p => p.id === place.id)) {
      const newPlaces = [...places, place];
      setPlaces(newPlaces);
      onChange && onChange(newPlaces);
      setInput("");
      setShowResults(false);
      if (place.lat && place.lng) setMapCenter({ lat: place.lat, lng: place.lng });
    }
  };

  const handleRemove = (id) => {
    const newPlaces = places.filter((p) => p.id !== id);
    setPlaces(newPlaces);
    onChange && onChange(newPlaces);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setShowResults(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleAdd(searchResults[0]);
    }
  };

  return (
    <>
      <div className={styles.title}>📍 포함하고 싶은 여행지를 입력하세요 (선택사항)</div>
      <div className={styles.inputRow} ref={searchRef}>
        <input
          className={styles.input}
          type="text"
          placeholder="장소명, 카페, 식당, 관광지 등 검색"
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.addButton} onClick={() => searchResults.length > 0 && handleAdd(searchResults[0])}>
          <FaPlus />
        </button>
        {showResults && (searchResults.length > 0 || isLoading) && (
          <div className={styles.searchResults}>
            {isLoading && <div className={styles.searchResultItem}>검색 중...</div>}
            {searchResults.map((result) => (
              <div
                key={result.id}
                className={styles.searchResultItem}
                onClick={() => handleAdd(result)}
              >
                <div className={styles.resultName}>{result.name}</div>
                <div className={styles.resultAddress}>{result.address}</div>
                <div className={styles.resultType}>{result.types && result.types[0]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.mapBox}>
        <div ref={mapRef} className={styles.map} />
      </div>
      <div className={styles.cardList}>
        {places.map((place) => (
          <div className={styles.card} key={place.id}>
            <div className={styles.cardContent}>
              <span className={styles.placeName}>{place.name}</span>
              <span className={styles.placeAddress}>{place.address}</span>
              <button className={styles.removeButton} onClick={() => handleRemove(place.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MustVisitPlaces; 