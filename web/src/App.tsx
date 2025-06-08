import { useEffect, useState } from 'react';
import LoginButton from './components/LoginButton';
import UserProfile from './components/UserProfile';
import RepoList from './components/RepoList';
import { getUser, getRepos } from './services/api';

function App() {
  const [user, setUser] = useState<null | {
    login: string;
    name: string;
    avatar_url: string;
  }>(null);

  const [repos, setRepos] = useState([]);

  useEffect(() => {
    getUser()
      .then((data) => {
        setUser(data[0]); // porque viene como [{...}]
        return getRepos();
      })
      .then((repoData) => setRepos(repoData.repos))
      .catch(() => {
        setUser(null); // no logueado
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Porflyo</h1>
      {!user ? (
        <LoginButton />
      ) : (
        <>
          <UserProfile {...user} />
          <RepoList repos={repos} />
        </>
      )}
    </div>
  );
}

export default App;
