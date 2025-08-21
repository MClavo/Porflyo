import { QueryProvider } from './lib/query/QueryProvider';
import { UserProvider } from './context/UserContext';
import { AppRouter } from './routes/AppRouter';
import Navbar from './components/Navbar';
import './styles/modern.css';

function App() {
  return (
    <QueryProvider>
      <UserProvider>
        <div className="app-container">
          <Navbar />
          <AppRouter />
        </div>
      </UserProvider>
    </QueryProvider>
  );
}

export default App;
