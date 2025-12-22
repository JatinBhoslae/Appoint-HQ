import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw { message: 'Login failed' };
    }
  };

  const loginWithData = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (name, email, mobile, password, role, category = null) => {
    try {
      // Prepare payload, only include mobile if it's a valid 10-digit number
      const payload = { name, email, password, role };
      
      // Only add mobile if it's a valid number (allowing international format)
      if (mobile && /^\+?[0-9]{10,15}$/.test(mobile)) {
        payload.mobile = mobile;
      }
      
      if (category && role === 'organiser') {
        payload.category = category;
      }

      const { data } = await axios.post(`${API_URL}/api/otp/signup`, payload);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, loginWithData }}>
      {children}
    </AuthContext.Provider>
  );
};