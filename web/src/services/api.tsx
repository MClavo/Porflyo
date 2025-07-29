export const getUser = async () => {
  const res = await fetch('/api/user', { credentials: 'include' });
  if (!res.ok) throw new Error('Usuario no autenticado');
  return res.json(); // Devuelve { login, id, name, email, avatar_url }
};

export const getRepos = async () => {
  const res = await fetch('/api/repos', { credentials: 'include' });
  if (!res.ok) throw new Error('Repos no disponibles');
  return res.json(); // Devuelve directamente el array de repositorios
};
