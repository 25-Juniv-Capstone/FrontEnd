import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage />} />
    </Routes>
  );
}

export default App;