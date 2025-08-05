import axios from 'axios';

export const getUser = async () => {
  const res = await fetch('/api/user/get', { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('User not authenticated');
    }
    throw new Error('Failed to fetch user data');
  }
  return res.json(); // Returns { name, email, avatarUrl, providerUserName, providerAvatarUrl, socials }
};

export const getRepos = async () => {
  const res = await fetch('/api/repos', { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('User not authenticated');
    }
    throw new Error('Repositories not available');
  }
  return res.json(); // Returns array of repositories directly
};

export const updateUser = async (updates: Record<string, unknown>) => {
  const response = await axios.patch('/api/user/patch', updates, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
