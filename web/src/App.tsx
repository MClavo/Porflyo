import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import './styles/modern.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
