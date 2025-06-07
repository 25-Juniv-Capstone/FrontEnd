import { Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import CourseCreatePage from './pages/CourseCreatePage';
import CourseDetailPage from './pages/CourseDetailPage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';
import CommunityPage from './pages/CommunityPage/CommunityPage.jsx';
import KakaoCallbackPage from './pages/KakaoCallbackPage';
import SelectPage from './pages/selectpages';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/course" element={<CourseCreatePage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/select" element={<SelectPage />} />
      </Routes>
    </>
  );
}

export default App;
