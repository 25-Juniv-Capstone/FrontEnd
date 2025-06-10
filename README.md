# 🚀 여행 코스 플래너 프론트엔드

React와 Vite를 기반으로 한 여행 코스 플래닝 웹 애플리케이션입니다.

## 📋 목차

- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [개발 가이드](#개발-가이드)
- [배포](#배포)

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 라이브러리
- **Vite** - 빠른 빌드 도구 및 개발 서버
- **React Router DOM** - 클라이언트 사이드 라우팅
- **Styled Components** - CSS-in-JS 스타일링
- **React Icons** - 아이콘 라이브러리

### 지도 및 드래그 앤 드롭
- **@react-google-maps/api** - Google Maps 통합
- **@hello-pangea/dnd** - 드래그 앤 드롭 기능
- **react-beautiful-dnd** - 추가 드래그 앤 드롭 지원

### 기타 라이브러리
- **Axios** - HTTP 클라이언트
- **React Slick** - 캐러셀 컴포넌트
- **Lodash** - 유틸리티 함수

## ✨ 주요 기능

- 🏠 **홈페이지** - 메인 랜딩 페이지
- 👤 **마이페이지** - 사용자 프로필 및 설정
- 🗺️ **코스 생성** - 새로운 여행 코스 만들기
- 📍 **코스 상세보기** - 생성된 코스의 상세 정보
- ✏️ **코스 편집** - 기존 코스 수정
- 💬 **커뮤니티** - 사용자 간 소통 공간
- 🔐 **카카오 로그인** - 소셜 로그인 연동
- 🎯 **선택 페이지** - 다양한 옵션 선택

## 📁 프로젝트 구조

```
src/
├── api/           # API 통신 관련
├── assets/        # 정적 자산 (이미지, 폰트 등)
├── components/    # 재사용 가능한 컴포넌트
├── constants/     # 상수 정의
├── css/          # 스타일 파일
├── hooks/        # 커스텀 React 훅
├── images/       # 이미지 파일
├── layout/       # 레이아웃 컴포넌트 (Header 등)
├── pages/        # 페이지 컴포넌트
├── routes/       # 라우팅 설정
├── utils/        # 유틸리티 함수
├── App.jsx       # 메인 앱 컴포넌트
├── main.jsx      # 앱 진입점
└── index.css     # 글로벌 스타일
```

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

### 4. 빌드 미리보기

```bash
npm run preview
```

### 5. 린트 검사

```bash
npm run lint
```

## 💻 개발 가이드

### 환경 설정

1. Node.js 18+ 버전이 필요합니다.
2. 프로젝트 루트에서 `npm install`을 실행하여 의존성을 설치합니다.

### 코드 스타일

- ESLint를 사용하여 코드 품질을 관리합니다.
- React Hooks 규칙을 준수합니다.
- 컴포넌트는 함수형 컴포넌트로 작성합니다.

### 라우팅

React Router DOM을 사용하여 클라이언트 사이드 라우팅을 구현했습니다:

- `/` - 홈페이지
- `/mypage` - 마이페이지
- `/course` - 코스 생성
- `/courses/:courseId` - 코스 상세보기
- `/courses/:courseId/edit` - 코스 편집
- `/community` - 커뮤니티
- `/kakao/callback` - 카카오 로그인 콜백
- `/select` - 선택 페이지

## 🌐 배포

### Vercel 배포 (권장)

1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 환경 변수 설정 (필요시)

### Netlify 배포

1. Netlify 계정 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
