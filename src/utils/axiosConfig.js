import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // 토큰이 존재하는지 확인
            if (!token.trim()) {
                console.error('토큰이 비어있습니다.');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/';
                return Promise.reject('토큰이 비어있습니다.');
            }
            
            config.headers.Authorization = `Bearer ${token}`;
            console.log('요청 헤더에 토큰 추가됨:', config.headers.Authorization);
        } else {
            console.log('토큰이 없습니다. 로그인이 필요합니다.');
        }
        return config;
    },
    (error) => {
        console.error('요청 인터셉터 에러:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('응답 에러:', error.response?.status, error.response?.data);
        
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 토큰이 만료되었거나 유효하지 않은 경우
                    console.log('인증 실패:', error.response.data);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    
                    // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
                    if (!window.location.pathname.includes('/kakao/callback')) {
                        const currentPath = window.location.pathname;
                        window.location.href = `/kakao/callback?error=unauthorized&from=${encodeURIComponent(currentPath)}`;
                    }
                    break;
                    
                case 403:
                    console.log('권한 없음:', error.response.data);
                    alert('이 작업을 수행할 권한이 없습니다.');
                    break;
                    
                default:
                    console.error('API 에러:', error.response.data);
                    alert(error.response.data.message || '서버 오류가 발생했습니다.');
            }
        } else if (error.request) {
            console.error('서버 응답 없음:', error.request);
            alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
            console.error('요청 설정 에러:', error.message);
            alert('요청을 처리하는 중 오류가 발생했습니다.');
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance; 