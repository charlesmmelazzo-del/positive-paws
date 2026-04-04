import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const styles = {
    heroContainer: {
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      paddingTop: '60px',
      paddingBottom: '60px',
      textAlign: 'center',
    },
    heroContent: {
      maxWidth: '600px',
      zIndex: 2,
      padding: '0 20px',
    },
    heroHeading: {
      fontSize: '64px',
      fontWeight: '800',
      marginBottom: '16px',
      lineHeight: '1.2',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    },
    tagline: {
      fontSize: '24px',
      marginBottom: '40px',
      opacity: '0.95',
      lineHeight: '1.5',
    },
    ctaContainer: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    ctaButton: {
      padding: '16px 40px',
      fontSize: '18px',
      fontWeight: '600',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
    },
    primaryBtn: {
      background: '#FFE66D',
      color: '#1A1A2E',
    },
    primaryBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    secondaryBtn: {
      background: 'transparent',
      color: 'white',
      border: '2px solid white',
    },
    secondaryBtnHover: {
      background: 'rgba(255,255,255,0.1)',
      transform: 'translateY(-2px)',
    },
    featuresSection: {
      background: '#FFF9F5',
      padding: '80px 20px',
    },
    featuresSectionInner: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '48px',
      fontWeight: '700',
      color: '#1A1A2E',
      textAlign: 'center',
      marginBottom: '60px',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
    },
    featureCard: {
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    featureCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    },
    featureIcon: {
      fontSize: '56px',
      marginBottom: '20px',
    },
    featureTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1A1A2E',
      marginBottom: '12px',
    },
    featureDescription: {
      fontSize: '16px',
      color: '#6B7280',
      lineHeight: '1.6',
    },
    footer: {
      background: '#1A1A2E',
      color: 'white',
      textAlign: 'center',
      padding: '40px 20px',
    },
  };

  const [hoveredCard, setHoveredCard] = React.useState(null);
  const [hoveredBtn, setHoveredBtn] = React.useState(null);

  const features = [
    {
      icon: '📚',
      title: 'Expert Courses',
      description: 'Learn from certified dog trainers with proven techniques',
    },
    {
      icon: '🎯',
      title: 'Scenario Training',
      description: 'Practice real-world situations with interactive challenges',
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your dog\'s development with detailed analytics',
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      description: 'Compete with other trainers and celebrate your wins',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <div style={styles.heroContainer}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroHeading}>Train with Love. 🐾</h1>
          <p style={styles.tagline}>
            Master positive dog training methods that build trust and strengthen your bond
          </p>
          <div style={styles.ctaContainer}>
            <Link
              to="/register"
              style={{
                ...styles.ctaButton,
                ...styles.primaryBtn,
                ...(hoveredBtn === 'start' ? styles.primaryBtnHover : {}),
              }}
              onMouseEnter={() => setHoveredBtn('start')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              style={{
                ...styles.ctaButton,
                ...styles.secondaryBtn,
                ...(hoveredBtn === 'signin' ? styles.secondaryBtnHover : {}),
              }}
              onMouseEnter={() => setHoveredBtn('signin')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresSectionInner}>
          <h2 style={styles.sectionTitle}>Why Choose Positive Paws?</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureCard,
                  ...(hoveredCard === index ? styles.featureCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2024 Positive Paws. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
