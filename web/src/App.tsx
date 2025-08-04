import { useEffect, useState } from 'react';
import LoginButton from './components/LoginButton';
import UserProfile from './components/UserProfile';
import RepoList from './components/RepoList';
import { getUser, getRepos } from './services/api';

function App() {
  const [user, setUser] = useState<null | {
    login: string;
    name: string;
    avatarUrl: string;
    id: string;
    email: string;
  }>(null);

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user data...');
        const userData = await getUser();
        console.log('User data received:', userData);
        setUser(userData);
        
        console.log('Fetching repo data...');
        const repoData = await getRepos();
        console.log('Repo data received:', repoData);
        setRepos(repoData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        setUser(null);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Porflyo</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Porflyo</h1>
      {error && (
        <div style={{ color: 'red', marginBottom: 20 }}>
          <p>Error: {error}</p>
        </div>
      )}
      {!user ? (
        <LoginButton />
      ) : (
        <>
          <UserProfile {...user} />
          <h2>Repositorios</h2>
          <RepoList repos={repos} />
        </>
      )}
    </div>
  );
}

export default App;
