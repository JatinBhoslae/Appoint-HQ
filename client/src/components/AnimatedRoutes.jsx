import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageTransition from './ui/PageTransition';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import VerifyOTPOtp from '../pages/VerifyOTPOtp';
import Dashboard from '../pages/Dashboard';
import Booking from '../pages/Booking';
import Confirmation from '../pages/Confirmation';
import Profile from '../pages/Profile';
import TicketView from '../pages/TicketView';
import SignupOTP from '../pages/SignupOTP';
import ForgotPasswordOTP from '../pages/ForgotPasswordOTP';
import ResetPasswordOTP from '../pages/ResetPasswordOTP';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/verify-otp" element={<PageTransition><VerifyOTP /></PageTransition>} />
        <Route path="/verify-otp-otp" element={<PageTransition><VerifyOTPOtp /></PageTransition>} />
        <Route path="/signup-otp" element={<PageTransition><SignupOTP /></PageTransition>} />
        <Route path="/forgot-password-otp" element={<PageTransition><ForgotPasswordOTP /></PageTransition>} />
        <Route path="/reset-password-otp" element={<PageTransition><ResetPasswordOTP /></PageTransition>} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <PageTransition><Dashboard /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <PageTransition><Profile /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/book/:id" element={
          <PrivateRoute>
            <PageTransition><Booking /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/confirmation/:id" element={
          <PrivateRoute>
            <PageTransition><Confirmation /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/appointment/:id" element={
          <PrivateRoute>
            <PageTransition><TicketView /></PageTransition>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
