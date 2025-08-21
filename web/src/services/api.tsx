import axios from 'axios';
import type { UserPatchDto } from '../types/dto';

export const getUser = async () => {
  const res = await fetch('/api/user/get', { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('User not authenticated');
    }
    throw new Error('Failed to fetch user data');
  }
  return res.json(); // Returns { name, email, profileImage, providerUserName, providerAvatarUrl, socials }
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

export const updateUser = async (updates: UserPatchDto) => {
  const response = await axios.patch('/api/user/patch', updates, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const updateUserProfileImage = async (avatarUrl: string) => {
  return updateUser({ avatarUrl });
};

// Portfolio API functions
export const portfoliosApi = {
  createPortfolio: async (data: unknown) => {
    const response = await axios.post('/api/portfolios', data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  getPortfolio: async (id: string) => {
    const res = await fetch(`/api/portfolios/${id}`, { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('User not authenticated');
      }
      if (res.status === 404) {
        throw new Error('Portfolio not found');
      }
      throw new Error('Failed to fetch portfolio');
    }
    return res.json();
  },

  updatePortfolio: async (id: string, data: unknown) => {
    const response = await axios.put(`/api/portfolios/${id}`, data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  deletePortfolio: async (id: string) => {
    const response = await axios.delete(`/api/portfolios/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  getPortfolios: async () => {
    const res = await fetch('/api/portfolios', { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('User not authenticated');
      }
      throw new Error('Failed to fetch portfolios');
    }
    return res.json();
  },
};
