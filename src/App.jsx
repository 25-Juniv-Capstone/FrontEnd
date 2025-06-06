import { Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import CourseCreatePage from './pages/CourseCreatePage';
import CourseDetailPage from './pages/CourseDetailPage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';
import SelectPages from './pages/selectpages.jsx';
import CommunityPage from './pages/CommunityPage/CommunityPage.jsx';
import WritePage from './pages/WritePage/WritePage.jsx';
import KakaoCallbackPage from './pages/KakaoCallbackPage';
import SelectPage from './pages/selectpages';
import PostPage from './pages/PostPage/PostPage.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/selectpage" element={<SelectPages />} />
        <Route path="/course" element={<CourseCreatePage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/select" element={<SelectPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
    </>
  );
}

export default App;
