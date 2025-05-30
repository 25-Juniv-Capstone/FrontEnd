import { Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import CourseCreatePage from './pages/CourseCreatePage';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
      <Route path="/selectpage" element={<SelectPages />} />
        <Route path="/course" element={<CourseCreatePage />} />
      </Routes>
    </>
  );
}

export default App;
