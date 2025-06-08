export const getUser = async () => {
  const res = await fetch('/user', { credentials: 'include' });
  if (!res.ok) throw new Error('Usuario no autenticado');
  return res.json(); // Devuelve [{ login, name, avatar_url }]
};

export const getRepos = async () => {
  const res = await fetch('/repos', { credentials: 'include' });
  if (!res.ok) throw new Error('Repos no disponibles');
  return res.json(); // Devuelve { repos: [...] }
};
