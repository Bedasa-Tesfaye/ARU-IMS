import React, { useState, useEffect } from 'react';
import './AIInsights.css';

const AIInsights = ({ userRole, userId }) => {
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);

  useEffect(() => {
    // Simulate AI API call for insights
    setTimeout(() => {
      const aiData = generateAIInsights(userRole, userId);
      setInsights(aiData.insights);
      setPredictions(aiData.predictions);
      setRecommendations(aiData.recommendations);
      setLoading(false);
    }, 1500);
  }, [userRole, userId]);

  const generateAIInsights = (role, id) => {
    const baseInsights = {
      student: {
        insights: [
          {
            id: 1,
            type: 'performance',
            title: 'Performance Trend Analysis',
            description: 'Your internship performance shows 23% improvement over the past 4 weeks',
            confidence: 92,
            impact: 'high',
            data: {
              currentScore: 85,
              previousScore: 69,
              trend: 'increasing',
              factors: ['Report Quality', 'Communication', 'Technical Skills']
            },
            recommendations: ['Continue current approach', 'Focus on documentation', 'Enhance presentation skills']
          },
          {
            id: 2,
            type: 'skill_gap',
            title: 'Skill Gap Analysis',
            description: 'AI identifies 3 key areas for skill development',
            confidence: 87,
            impact: 'medium',
            data: {
              gaps: ['Advanced JavaScript', 'Database Design', 'Project Management'],
              priority: 'medium',
              estimatedTime: '6-8 weeks'
            },
            recommendations: ['Take online courses', 'Practice with real projects', 'Seek mentorship']
          },
          {
            id: 3,
            type: 'opportunity',
            title: 'Career Opportunity Match',
            description: '87% match with upcoming opportunities at partner companies',
            confidence: 85,
            impact: 'high',
            data: {
              companies: ['Ethio Telecom', 'Commercial Bank', 'Ethiopian Airlines'],
              positions: ['Junior Developer', 'System Analyst', 'IT Support'],
              matchScore: 87
            },
            recommendations: ['Update portfolio', 'Prepare for interviews', 'Network with alumni']
          }
        ],
        predictions: [
          {
            id: 1,
            type: 'completion',
            title: 'Internship Completion Probability',
            probability: 94,
            timeframe: 'Current internship',
            factors: ['Performance trend', 'Attendance', 'Mentor feedback']
          },
          {
            id: 2,
            type: 'placement',
            title: 'Job Placement Likelihood',
            probability: 78,
            timeframe: 'Within 3 months',
            factors: ['Skill alignment', 'Company satisfaction', 'Network strength']
          }
        ],
        recommendations: [
          {
            id: 1,
            priority: 'high',
            title: 'Complete Advanced React Course',
            description: 'Based on your performance and market demand',
            estimatedImpact: '+15% employability',
            timeframe: '4 weeks'
          },
          {
            id: 2,
            priority: 'medium',
            title: 'Participate in Hackathon',
            description: 'Improve practical skills and network with industry professionals',
            estimatedImpact: '+10% skill score',
            timeframe: '2 weeks'
          }
        ]
      },
      company: {
        insights: [
          {
            id: 1,
            type: 'talent_pool',
            title: 'Talent Pool Analysis',
            description: 'AI identifies 12 high-potential candidates matching your requirements',
            confidence: 89,
            impact: 'high',
            data: {
              totalCandidates: 45,
              highPotential: 12,
              averageMatch: 76,
              topSkills: ['React', 'Python', 'Database']
            },
            recommendations: ['Schedule interviews with top 5', 'Expand skill requirements', 'Offer competitive packages']
          },
          {
            id: 2,
            type: 'retention',
            title: 'Intern Retention Prediction',
            description: 'Current interns show 82% probability of full-time conversion',
            confidence: 85,
            impact: 'high',
            data: {
              currentInterns: 8,
              likelyToConvert: 7,
              riskFactors: ['Compensation', 'Career growth', 'Work environment']
            },
            recommendations: ['Improve compensation packages', 'Create career paths', 'Enhance mentorship programs']
          }
        ],
        predictions: [
          {
            id: 1,
            type: 'hiring',
            title: 'Hiring Success Rate',
            probability: 76,
            timeframe: 'Next quarter',
            factors: ['Market competition', 'Salary competitiveness', 'Company reputation']
          },
          {
            id: 2,
            type: 'performance',
            title: 'Intern Performance Forecast',
            probability: 88,
            timeframe: 'Current cohort',
            factors: ['Academic background', 'Initial assessment', 'Training effectiveness']
          }
        ],
        recommendations: [
          {
            id: 1,
            priority: 'high',
            title: 'Implement AI-Powered Screening',
            description: 'Reduce hiring time by 40% while improving match quality',
            estimatedImpact: '+25% efficiency',
            timeframe: '6 weeks'
          },
          {
            id: 2,
            priority: 'medium',
            title: 'Develop Internship Curriculum',
            description: 'Standardize training and improve onboarding experience',
            estimatedImpact: '+30% retention',
            timeframe: '8 weeks'
          }
        ]
      },
      coordinator: {
        insights: [
          {
            id: 1,
            type: 'placement',
            title: 'Placement Rate Analysis',
            description: 'Current placement rate is 78%, 12% above national average',
            confidence: 94,
            impact: 'high',
            data: {
              currentRate: 78,
              nationalAverage: 66,
              topPerformingCompanies: ['Ethio Telecom', 'Commercial Bank'],
              improvementAreas: ['Technical interviews', 'Portfolio preparation']
            },
            recommendations: ['Focus on interview preparation', 'Enhance portfolio workshops', 'Expand company partnerships']
          },
          {
            id: 2,
            type: 'student_success',
            title: 'Student Success Patterns',
            description: 'AI identifies key factors for internship success',
            confidence: 91,
            impact: 'high',
            data: {
              successFactors: ['Technical skills', 'Communication', 'Problem solving'],
              atRiskStudents: 15,
              interventionOpportunities: 8
            },
            recommendations: ['Early intervention programs', 'Skill development workshops', 'Mentorship pairing']
          }
        ],
        predictions: [
          {
            id: 1,
            type: 'enrollment',
            title: 'Next Semester Enrollment',
            probability: 85,
            timeframe: 'Fall 2024',
            factors: ['Program reputation', 'Job market', 'Student satisfaction']
          },
          {
            id: 2,
            type: 'placement',
            title: 'Year-End Placement Target',
            probability: 82,
            timeframe: 'December 2024',
            factors: ['Company partnerships', 'Student preparation', 'Market conditions']
          }
        ],
        recommendations: [
          {
            id: 1,
            priority: 'high',
            title: 'Implement Predictive Analytics Dashboard',
            description: 'Track student progress and identify at-risk individuals early',
            estimatedImpact: '+20% success rate',
            timeframe: '4 weeks'
          },
          {
            id: 2,
            priority: 'medium',
            title: 'Expand Industry Partnerships',
            description: 'Add 5 new companies to increase placement opportunities',
            estimatedImpact: '+15% placements',
            timeframe: '6 weeks'
          }
        ]
      },
      examiner: {
        insights: [
          {
            id: 1,
            type: 'evaluation',
            title: 'Evaluation Consistency Analysis',
            description: 'Your evaluation patterns show 94% consistency with peer reviewers',
            confidence: 96,
            impact: 'medium',
            data: {
              consistencyScore: 94,
              peerAverage: 87,
              evaluationCount: 45,
              averageRating: 82
            },
            recommendations: ['Maintain current standards', 'Share best practices', 'Mentor new examiners']
          },
          {
            id: 2,
            type: 'student_performance',
            title: 'Student Performance Trends',
            description: 'Students under your supervision show 18% above-average performance',
            confidence: 89,
            impact: 'high',
            data: {
              supervisedStudents: 12,
              averagePerformance: 82,
              departmentAverage: 69,
              improvementRate: 18
            },
            recommendations: ['Document mentoring approach', 'Expand supervision capacity', 'Develop training materials']
          }
        ],
        predictions: [
          {
            id: 1,
            type: 'workload',
            title: 'Evaluation Workload Forecast',
            probability: 88,
            timeframe: 'Next month',
            factors: ['Internship cycles', 'Report submissions', 'Review capacity']
          },
          {
            id: 2,
            type: 'quality',
            title: 'Evaluation Quality Score',
            probability: 92,
            timeframe: 'Current semester',
            factors: ['Experience level', 'Student feedback', 'Peer reviews']
          }
        ],
        recommendations: [
          {
            id: 1,
            priority: 'medium',
            title: 'Implement AI-Assisted Evaluation',
            description: 'Use AI to identify patterns and suggest evaluation criteria',
            estimatedImpact: '+20% efficiency',
            timeframe: '6 weeks'
          },
          {
            id: 2,
            priority: 'low',
            title: 'Create Evaluation Templates',
            description: 'Standardize evaluation process for better consistency',
            estimatedImpact: '+15% consistency',
            timeframe: '4 weeks'
          }
        ]
      },
      admin: {
        insights: [
          {
            id: 1,
            type: 'system_health',
            title: 'System Health Analysis',
            description: 'Overall system performance at 92% efficiency',
            confidence: 95,
            impact: 'high',
            data: {
              uptime: 99.8,
              responseTime: 1.2,
              userSatisfaction: 91,
              errorRate: 0.3
            },
            recommendations: ['Monitor server capacity', 'Optimize database queries', 'Implement caching']
          },
          {
            id: 2,
            type: 'growth',
            title: 'Growth Metrics Analysis',
            description: 'System usage increased by 45% in the last quarter',
            confidence: 93,
            impact: 'high',
            data: {
              userGrowth: 45,
              internshipGrowth: 32,
              companyGrowth: 28,
              reportGrowth: 67
            },
            recommendations: ['Scale infrastructure', 'Optimize user experience', 'Expand support team']
          },
          {
            id: 3,
            type: 'risk',
            title: 'Risk Assessment',
            description: 'AI identifies 3 potential risks requiring attention',
            confidence: 87,
            impact: 'high',
            data: {
              risks: ['Data security', 'System scalability', 'User training'],
              riskLevels: ['medium', 'high', 'low'],
              mitigationPlans: 2
            },
            recommendations: ['Implement security audit', 'Plan infrastructure upgrade', 'Create training programs']
          }
        ],
        predictions: [
          {
            id: 1,
            type: 'adoption',
            title: 'System Adoption Rate',
            probability: 88,
            timeframe: 'Next 6 months',
            factors: ['User satisfaction', 'Feature completeness', 'Market conditions']
          },
          {
            id: 2,
            type: 'performance',
            title: 'System Performance Forecast',
            probability: 91,
            timeframe: 'Next quarter',
            factors: ['Current load', 'Infrastructure capacity', 'Team expertise']
          }
        ],
        recommendations: [
          {
            id: 1,
            priority: 'high',
            title: 'Implement Predictive Analytics',
            description: 'Add AI-powered forecasting for better decision making',
            estimatedImpact: '+30% strategic planning',
            timeframe: '8 weeks'
          },
          {
            id: 2,
            priority: 'medium',
            title: 'Enhance Security Measures',
            description: 'Implement advanced security protocols and monitoring',
            estimatedImpact: '+40% security',
            timeframe: '6 weeks'
          }
        ]
      }
    };

    return baseInsights[role] || baseInsights.student;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#28a745';
    if (confidence >= 80) return '#ffc107';
    if (confidence >= 70) return '#fd7e14';
    return '#dc3545';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="ai-insights-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing data with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <h2>🤖 AI-Powered Insights</h2>
        <p>Real-time analytics and predictions powered by machine learning</p>
      </div>

      <div className="insights-grid">
        {/* Key Insights */}
        <div className="insights-section">
          <h3>📊 Key Insights</h3>
          <div className="insights-cards">
            {insights.map(insight => (
              <div key={insight.id} className="insight-card" onClick={() => setSelectedInsight(insight)}>
                <div className="insight-header">
                  <h4>{insight.title}</h4>
                  <div className="insight-badges">
                    <span 
                      className="confidence-badge"
                      style={{ backgroundColor: getConfidenceColor(insight.confidence) }}
                    >
                      {insight.confidence}% confidence
                    </span>
                    <span 
                      className="impact-badge"
                      style={{ backgroundColor: getImpactColor(insight.impact) }}
                    >
                      {insight.impact} impact
                    </span>
                  </div>
                </div>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-data">
                  {Object.entries(insight.data).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="data-point">
                      <span className="data-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="data-value">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="predictions-section">
          <h3>🔮 Predictions</h3>
          <div className="predictions-cards">
            {predictions.map(prediction => (
              <div key={prediction.id} className="prediction-card">
                <div className="prediction-header">
                  <h4>{prediction.title}</h4>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill"
                      style={{ 
                        width: `${prediction.probability}%`,
                        backgroundColor: getConfidenceColor(prediction.probability)
                      }}
                    ></div>
                    <span className="probability-text">{prediction.probability}%</span>
                  </div>
                </div>
                <p className="prediction-timeframe">{prediction.timeframe}</p>
                <div className="prediction-factors">
                  <strong>Key factors:</strong>
                  <ul>
                    {prediction.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <h3>💡 AI Recommendations</h3>
          <div className="recommendations-cards">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="recommendation-header">
                  <h4>{rec.title}</h4>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(rec.priority) }}
                  >
                    {rec.priority} priority
                  </span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-meta">
                  <div className="estimated-impact">
                    <span className="meta-label">Estimated Impact:</span>
                    <span className="meta-value">{rec.estimatedImpact}</span>
                  </div>
                  <div className="timeframe">
                    <span className="meta-label">Timeframe:</span>
                    <span className="meta-value">{rec.timeframe}</span>
                  </div>
                </div>
                <button className="action-btn">Take Action</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="insight-modal-overlay" onClick={() => setSelectedInsight(null)}>
          <div className="insight-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedInsight.title}</h3>
              <button className="close-btn" onClick={() => setSelectedInsight(null)}>✕</button>
            </div>
            <div className="modal-content">
              <p>{selectedInsight.description}</p>
              <div className="detailed-data">
                <h4>Detailed Analysis</h4>
                {Object.entries(selectedInsight.data).map(([key, value]) => (
                  <div key={key} className="data-detail">
                    <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>
                    <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                  </div>
                ))}
              </div>
              <div className="recommendations-list">
                <h4>Recommendations</h4>
                <ul>
                  {selectedInsight.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
