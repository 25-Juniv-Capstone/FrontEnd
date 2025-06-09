// 시간을 HTML input type="time" 형식으로 변환하는 함수
export const formatTimeForInput = (timeStr) => {
  if (!timeStr) return '';
  
  // 오전/오후 형식인 경우 24시간제로 변환
  if (timeStr.includes('오전') || timeStr.includes('오후')) {
    const [period, timeStrPart] = timeStr.split(' ');
    const [hours, minutes] = timeStrPart.split(':').map(Number);
    const hour = period === '오후' && hours !== 12 ? hours + 12 : 
                period === '오전' && hours === 12 ? 0 : hours;
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // "9:00" -> "09:00" 형식으로 변환
  const [hours, minutes] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

// 시간을 오전/오후 형식으로 변환하는 함수
export const formatDisplayTime = (timeStr) => {
  if (!timeStr) return '--:--';
  
  // 이미 오전/오후 형식인 경우 그대로 반환
  if (timeStr.includes('오전') || timeStr.includes('오후')) {
    return timeStr;
  }
  
  // "10:30" -> "오전 10:30" 형식으로 변환
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour.toString().padStart(2, '0')}:${minutes}`;
}; 