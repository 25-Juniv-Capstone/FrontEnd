import { useState, useEffect } from 'react';
import { regionInfo } from '../utils/regionInfo';

export const useLoadingAnimation = (region = "기타") => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState('');
  const [dots, setDots] = useState('');

  useEffect(() => {
    // 프로그레스 바 애니메이션
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 1;
      });
    }, 1000);

    // 로딩 점 애니메이션
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // 지역 정보 변경 (8초마다 변경)
    const tipInterval = setInterval(() => {
      const tips = regionInfo[region] || regionInfo["기타"];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
    }, 8000);

    // 초기 팁 설정
    const initialTips = regionInfo[region] || regionInfo["기타"];
    setCurrentTip(initialTips[Math.floor(Math.random() * initialTips.length)]);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearInterval(tipInterval);
    };
  }, [region]);

  return { progress, dots, currentTip };
}; 