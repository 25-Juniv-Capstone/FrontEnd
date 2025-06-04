export const getNumberedMarkerIcon = (number, placeType, placeTypeToColor) => {
  const color = placeTypeToColor[placeType] || "#2196F3";
  return {
    url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
      <svg width="38" height="38" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="17" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="19" y="25" text-anchor="middle" font-size="18" font-family="Arial" font-weight="bold" fill="white">${number}</text>
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(38, 38),
    labelOrigin: new window.google.maps.Point(19, 19)
  };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반경 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateTravelTime = (lat1, lon1, lat2, lon2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const averageSpeed = 30; // 평균 시속 30km/h로 가정
  return (distance / averageSpeed) * 60; // 분 단위로 반환
}; 