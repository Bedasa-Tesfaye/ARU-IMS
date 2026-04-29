import React, { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/VideoHero.css';

const VideoHero = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videos = [
    '/assets/hero-bg-1.mp4',
    '/assets/hero-bg-2.mp4',
    '/assets/hero-bg-3.mp4',
    '/assets/hero-bg-4.mp4'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 8000); // Change video every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="video-hero" id="home">
      <Header />
      <div className="video-background">
        <video
          key={currentVideo}
          autoPlay
          muted
          loop
          playsInline
          className="hero-video"
        >
          <source src={videos[currentVideo]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="container">
          <h1 className="hero-title">
            <span className="title-line">ARU Internship</span>
            <span className="title-line highlight">Management System</span>
          </h1>
          <p className="hero-subtitle">
            Connecting talented students with leading companies for meaningful internship experiences
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Partner Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
          
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg">Get Started</button>
            <button className="btn btn-outline-light btn-lg">Learn More</button>
          </div>
        </div>
      </div>
      
      <div className="video-indicators">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentVideo ? 'active' : ''}`}
            onClick={() => setCurrentVideo(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default VideoHero;
