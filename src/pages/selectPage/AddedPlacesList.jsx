import React from "react";
import styles from '@/css/selectpages/AddedPlacesList.module.css';

const AddedPlacesList = ({ places, onRemovePlace }) => {

  // 삭제 확인 핸들러 함수 추가
  const handleConfirmRemove = (id, name) => {
    if (window.confirm(`'${name}' 장소를 정말로 삭제하시겠습니까?`)) {
      onRemovePlace(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        추가한 장소
      </div>
      <div className={styles.dividerContainer}>
        <div className={styles.divider} />
      </div>
      <div className={styles.listContainer}>
        {places.length === 0 ? (
          <div className={styles.emptyMessage}>
            장소를 검색하여 추가해주세요
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              className={styles.listItem}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/48204828aedf4b3e9d1bc563b87457c6/c990e247e1d6e64e87407a626cfcd6014a34015d?placeholderIfAbsent=true"
                alt="Location icon"
                className={styles.icon}
              />
              <div className={styles.contentWrapper}>
                <div className={styles.nameWrapper}>
                  <div className={styles.name}>
                    {place.name}
                  </div>
                  <button
                    // 변경: onClick 핸들러 수정
                    onClick={() => handleConfirmRemove(place.id, place.name)} 
                    className={styles.removeButton}
                    aria-label={`Remove ${place.name}`}
                  >
                    -
                  </button>
                </div>
                {place.memo && (
                  <div className={styles.memo}>
                    {place.memo}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddedPlacesList;