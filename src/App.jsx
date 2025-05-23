import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import MyPage from './pages/MyPage.jsx';
import SelectPages from './pages/selectpages.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/selectpage" element={<SelectPages />} /> 
    </Routes>
  );
}

export default App;