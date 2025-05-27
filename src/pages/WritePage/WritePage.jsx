"use client";
import React from "react";
// 기존 styles 임포트는 모달 전용 CSS로 변경하거나, 내부 section에 그대로 사용할 수 있습니다.
// import styles from "../../css/writepages/InputDesign.module.css"; 
import modalStyles from "../../css/writepages/ModalWritePage.module.css"; // 모달 전용 CSS (새로 생성)
import PostCreationHeader from "./PostCreationHeader";
import FormContent from "./FormContent";
import ActionButtons from "./ActionButtons";

function WritePageModal({ isOpen, onClose }) { // 컴포넌트 이름 및 props 변경
  if (!isOpen) {
    return null; 
  }

  // 모달 외부 클릭 시 닫기 (선택적 기능)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) { // 오버레이 자체를 클릭했는지 확인
      onClose();
    }
  };

  const handleSubmitForm = async () => {
    // TODO: 여기에 실제 폼 데이터 수집 로직을 구현해야 합니다.
    // 예시: FormContent 내부의 상태들을 props로 받아오거나, Context/Zustand 등으로 관리하여 여기서 접근합니다.
    const formData = {
      title: "임시 제목", // 실제로는 TitleInput의 상태값
      content: "임시 내용", // 실제로는 ContentTextarea의 상태값
      image: null, // 실제로는 ImageUploader의 상태값 (파일 객체 또는 URL)
      accessibility: "선택안함", // 실제로는 AccessibilitySelect의 상태값
    };

    console.log("저장할 폼 데이터:", formData);

    // --- 실제 저장 로직 (시뮬레이션) ---
    try {
      // 예시: API 호출
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error('데이터 저장 실패');
      // }

      // const result = await response.json();
      // console.log('저장 성공:', result);

      // --- 시뮬레이션: 2초 후 성공으로 간주 ---
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      console.log("데이터가 성공적으로 저장되었습니다. (시뮬레이션)");
      // --- 시뮬레이션 끝 ---

      // 저장 성공 후 모달 닫기
      alert("게시글이 저장되었습니다!"); // 사용자에게 알림
      onClose(); // 모달 닫기 함수 호출

    } catch (error) {
      console.error("데이터 저장 중 오류 발생:", error);
      alert("게시글 저장에 실패했습니다. 다시 시도해주세요."); // 사용자에게 오류 알림
      // 오류 발생 시 모달을 _닫지 않을_ 수도 있습니다. (선택)
    }
    // --- 실제 저장 로직 끝 ---
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={handleOverlayClick}> 
      <div className={modalStyles.modalContent}>
        {/* 기존 WritePage 내용 */} 
        {/* InputDesign.module.css의 .div 스타일을 사용하던 section은 그대로 두거나, 
            modalStyles 내부로 스타일을 옮겨올 수 있습니다. 
            여기서는 기존 클래스명을 유지한다고 가정하고 styles를 modalStyles.div로 변경합니다. 
            만약 InputDesign.module.css를 그대로 사용하고 싶다면, 해당 css를 임포트하고 className을 styles.div로 사용합니다.
            충돌을 피하기 위해 여기서는 modalStyles.formContainer 등으로 이름을 변경하는 것을 추천합니다.
        */}
        <section className={modalStyles.formContainer}> {/* 기존 .div 대신 모달에 맞는 클래스명 사용 권장 */} 
            <PostCreationHeader />
            <FormContent />
            <ActionButtons onCancel={onClose} onSubmit={handleSubmitForm} />
        </section>
      </div>
    </div>
  );
}

export default WritePageModal; // export 이름 변경
