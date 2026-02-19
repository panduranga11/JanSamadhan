// Mock Auth Service
export const login = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
    setTimeout(() => {
      // Allow any login
      const isAdmin = email.includes('admin');
      resolve({
        user: {
          id: isAdmin ? '999' : '1',
          name: isAdmin ? 'Admin User' : 'Citizen User',
          email: email,
          role: isAdmin ? 'admin' : 'user',
        },
        token: isAdmin ? 'mock-admin-token' : 'mock-user-token',
      });
    }, 800);
    }, 1000);
  });
};

export const register = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '2',
          name: userData.fullName,
          email: userData.email,
          role: 'user',
        },
        token: 'mock-register-token',
      });
    }, 1000);
  });
};

export const logout = () => {
  localStorage.removeItem('token');
};
