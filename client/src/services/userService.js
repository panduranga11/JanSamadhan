import { api } from './api';

export const getUserProfile = () => api.get('/users/profile');

export const updateUserProfile = ({ fullName, phone, address }) =>
  api.put('/users/profile', { fullName, phone, address });

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.postForm('/users/avatar', form);
};
