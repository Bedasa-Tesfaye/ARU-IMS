import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

// For video in public/assets folder - use absolute path (no import needed)
// The video file should be at: public/assets/hero-bg-2.mp4

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Side - Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          <div className="logo-section">
            <div className="logo-icon">🎓</div>
            <h1>Arsi University</h1>
            <p>Internship Management System</p>
            <div className="nav-home">
              <button 
                onClick={() => navigate('/')} 
                className="home-nav-btn"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>

          <h2>Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="signup-note">
            Don't have an account? <span>Contact Super Admin</span>
          </div>

          <div className="login-footer">
            <a href="#">About Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Services</a>
          </div>
        </div>
      </div>

      {/* Right Side - Video Background (using video from public/assets) */}
      <div className="login-right">
        <div className="right-background">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="bg-video"
          >
            {/* Video from public/assets folder - use absolute path */}
            <source src="/assets/hero-bg-2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="bg-overlay"></div>
        </div>

        <div className="info-content">
          <div className="info-badge">✨</div>
          <h2>Internship Excellence</h2>
          <p>Bridge the gap between education and industry with our comprehensive internship management platform.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📚</span>
              </div>
              <div>
                <h4>5 Stage Learning Method</h4>
                <p>Structured approach to internship success</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">👥</span>
              </div>
              <div>
                <h4>Join 500+ Students</h4>
                <p>Successfully placed in top companies</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🏢</span>
              </div>
              <div>
                <h4>100+ Partner Companies</h4>
                <p>Leading employers trust our platform</p>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="quote-icon">“</div>
            <p>This platform transformed our internship management process. Efficient, secure, and user-friendly!</p>
            <div className="testimonial-author">
              <strong>- Department of IT</strong>
              <span>Arsi University</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;