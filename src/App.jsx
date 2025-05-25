import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CourseCreatePage from './pages/CourseCreatePage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/course" element={<CourseCreatePage />} />
    </Routes>
  );
}

export default App;