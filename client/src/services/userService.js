// Mock Service for now
// import { api } from './api';

export const getUserProfile = async () => {
    // return api.get('/users/profile');
     return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '9876543210',
                address: '123, Main Street, City',
                role: 'user'
            });
        }, 500);
    });
};

export const updateUserProfile = async (userData) => {
    // return api.put('/users/profile', userData);
      return new Promise(resolve => {
        setTimeout(() => {
            resolve(userData);
        }, 800);
    });
};
