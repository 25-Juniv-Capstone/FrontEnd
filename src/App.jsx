import { Routes, Route } from 'react-router-dom';
import CourseCreatePage from './pages/CourseCreatePage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';
import SelectPages from './pages/selectpages.jsx';
import CommunityPage from './pages/CommunityPage/CommunityPage.jsx';
import WritePage from './pages/WritePage/WritePage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/selectpage" element={<SelectPages />} />
      <Route path="/course" element={<CourseCreatePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/write" element={<WritePage />} />
    </Routes>
  );
}

export default App;