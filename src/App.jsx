import { Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import CourseCreatePage from './pages/CourseCreatePage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';
import KakaoCallbackPage from './pages/KakaoCallbackPage';
import CommunityPage from './pages/CommunityPage/CommunityPage';
import WritePage from './pages/WritePage/WritePage';
import SelectPage from './pages/selectpages';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/course" element={<CourseCreatePage />} />
        <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/select" element={<SelectPage />} />
      </Routes>
    </>
  );
}

export default App;
