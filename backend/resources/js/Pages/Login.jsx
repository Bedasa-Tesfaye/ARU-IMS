import React from "react";
import { Link, useForm } from "@inertiajs/react";
import "./Login.css";

// For video in public/videos folder - use absolute path (no import needed)
// The video file should be at: public/videos/hero-bg-2.mp4

const LoginPage = () => {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [serverError, setServerError] = React.useState("");

    const handleInputChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setServerError("");

        post("/login", {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                setServerError("");
            },
            onError: () => {
                setServerError(
                    "Login failed. Please check your credentials and try again.",
                );
            },
        });
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
                            <Link href="/" className="home-nav-btn">
                                🏠 Back to Home
                            </Link>
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
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="form-input"
                            />
                            {errors.email && (
                                <div className="error">{errors.email}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your Password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="form-input"
                                />
                                {errors.password && (
                                    <div className="error">
                                        {errors.password}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">
                                Forgot Password?
                            </a>
                        </div>

                        {errors.email && (
                            <div className="error-message">
                                <span>⚠️</span>
                                <span>{errors.email}</span>
                            </div>
                        )}
                        {errors.password && (
                            <div className="error-message">
                                <span>⚠️</span>
                                <span>{errors.password}</span>
                            </div>
                        )}
                        {serverError && (
                            <div className="error-message">
                                <span>⚠️</span>
                                <span>{serverError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="spinner"></div>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="signup-note">
                        Don't have an account? <span>Contact Support</span>
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
                    <video autoPlay loop muted playsInline className="bg-video">
                        {/* Video from public folder */}
                        <source src="/videos/hero-bg-2.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="bg-overlay"></div>
                </div>

                <div className="info-content">
                    <div className="info-badge">✨</div>
                    <h2>Internship Excellence</h2>
                    <p>
                        Bridge the gap between education and industry with our
                        comprehensive internship management platform.
                    </p>

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
                                <h4>Join 500+ Users</h4>
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
                        <p>
                            This platform transformed our internship management
                            process. Efficient, secure, and user-friendly!
                        </p>
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
