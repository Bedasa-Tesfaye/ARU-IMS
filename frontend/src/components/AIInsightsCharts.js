import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter
} from 'recharts';
import './AIInsightsCharts.css';

const AIInsightsCharts = ({ userRole, userId }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    // Simulate AI API call for chart data
    setTimeout(() => {
      const aiChartData = generateChartData(userRole, userId);
      setChartData(aiChartData);
      setLoading(false);
    }, 1500);
  }, [userRole, userId, timeRange]);

  const generateChartData = (role, id) => {
    const baseData = {
      student: {
        performanceTrend: [
          { month: 'Jan', score: 65, reports: 4, evaluations: 85 },
          { month: 'Feb', score: 68, reports: 4, evaluations: 82 },
          { month: 'Mar', score: 72, reports: 5, evaluations: 88 },
          { month: 'Apr', score: 78, reports: 4, evaluations: 90 },
          { month: 'May', score: 82, reports: 5, evaluations: 92 },
          { month: 'Jun', score: 85, reports: 4, evaluations: 94 }
        ],
        skillRadar: [
          { skill: 'Technical', current: 85, target: 90 },
          { skill: 'Communication', current: 78, target: 85 },
          { skill: 'Problem Solving', current: 82, target: 88 },
          { skill: 'Teamwork', current: 88, target: 92 },
          { skill: 'Leadership', current: 72, target: 80 },
          { skill: 'Creativity', current: 76, target: 85 }
        ],
        skillProgress: [
          { skill: 'JavaScript', progress: 75, difficulty: 'Advanced' },
          { skill: 'React', progress: 82, difficulty: 'Advanced' },
          { skill: 'Python', progress: 68, difficulty: 'Intermediate' },
          { skill: 'Database', progress: 60, difficulty: 'Intermediate' },
          { skill: 'DevOps', progress: 45, difficulty: 'Beginner' }
        ],
        timeDistribution: [
          { activity: 'Coding', hours: 120, percentage: 35 },
          { activity: 'Learning', hours: 80, percentage: 23 },
          { activity: 'Meetings', hours: 60, percentage: 18 },
          { activity: 'Documentation', hours: 50, percentage: 15 },
          { activity: 'Testing', hours: 30, percentage: 9 }
        ],
        companyMatches: [
          { company: 'Ethio Telecom', match: 92, salary: '25k', positions: 3 },
          { company: 'Commercial Bank', match: 88, salary: '22k', positions: 2 },
          { company: 'Ethiopian Airlines', match: 85, salary: '28k', positions: 4 },
          { company: 'Huawei', match: 82, salary: '30k', positions: 2 },
          { company: 'Safaricom', match: 78, salary: '27k', positions: 3 }
        ],
        predictions: [
          { week: 'Week 1', actual: 65, predicted: 68, confidence: 85 },
          { week: 'Week 2', actual: 68, predicted: 70, confidence: 87 },
          { week: 'Week 3', actual: 72, predicted: 73, confidence: 89 },
          { week: 'Week 4', actual: 78, predicted: 76, confidence: 91 },
          { week: 'Week 5', actual: 82, predicted: 84, confidence: 92 },
          { week: 'Week 6', actual: 85, predicted: 87, confidence: 93 }
        ]
      },
      company: {
        talentPipeline: [
          { month: 'Jan', applicants: 45, interviewed: 12, hired: 3 },
          { month: 'Feb', applicants: 52, interviewed: 15, hired: 4 },
          { month: 'Mar', applicants: 48, interviewed: 18, hired: 5 },
          { month: 'Apr', applicants: 58, interviewed: 20, hired: 6 },
          { month: 'May', applicants: 62, interviewed: 22, hired: 7 },
          { month: 'Jun', applicants: 55, interviewed: 19, hired: 5 }
        ],
        skillDemand: [
          { skill: 'JavaScript', demand: 85, supply: 70, gap: 15 },
          { skill: 'Python', demand: 78, supply: 65, gap: 13 },
          { skill: 'React', demand: 82, supply: 60, gap: 22 },
          { skill: 'Database', demand: 70, supply: 55, gap: 15 },
          { skill: 'DevOps', demand: 65, supply: 45, gap: 20 }
        ],
        internPerformance: [
          { intern: 'Student A', performance: 92, potential: 95, retention: 88 },
          { intern: 'Student B', performance: 88, potential: 90, retention: 85 },
          { intern: 'Student C', performance: 85, potential: 88, retention: 92 },
          { intern: 'Student D', performance: 90, potential: 92, retention: 78 },
          { intern: 'Student E', performance: 87, potential: 91, retention: 90 }
        ],
        departmentDistribution: [
          { department: 'Engineering', interns: 8, satisfaction: 92 },
          { department: 'Marketing', interns: 4, satisfaction: 88 },
          { department: 'Sales', interns: 3, satisfaction: 85 },
          { department: 'HR', interns: 2, satisfaction: 90 },
          { department: 'Finance', interns: 3, satisfaction: 87 }
        ],
        roiAnalysis: [
          { quarter: 'Q1', investment: 45000, returns: 68000, roi: 151 },
          { quarter: 'Q2', investment: 52000, returns: 79000, roi: 152 },
          { quarter: 'Q3', investment: 48000, returns: 74000, roi: 154 },
          { quarter: 'Q4', investment: 55000, returns: 86000, roi: 156 }
        ],
        hiringFunnel: [
          { stage: 'Applied', count: 245, conversion: 100 },
          { stage: 'Screened', count: 180, conversion: 73 },
          { stage: 'Interviewed', count: 85, conversion: 35 },
          { stage: 'Offered', count: 35, conversion: 14 },
          { stage: 'Hired', count: 25, conversion: 10 }
        ]
      },
      coordinator: {
        placementTrends: [
          { year: '2020', placed: 45, total: 120, rate: 38 },
          { year: '2021', placed: 58, total: 135, rate: 43 },
          { year: '2022', placed: 72, total: 140, rate: 51 },
          { year: '2023', placed: 85, total: 145, rate: 59 },
          { year: '2024', placed: 98, total: 150, rate: 65 }
        ],
        companyPartnerships: [
          { company: 'Ethio Telecom', students: 15, satisfaction: 92, growth: 12 },
          { company: 'Commercial Bank', students: 12, satisfaction: 88, growth: 8 },
          { company: 'Ethiopian Airlines', students: 18, satisfaction: 95, growth: 15 },
          { company: 'Huawei', students: 8, satisfaction: 85, growth: 20 },
          { company: 'Safaricom', students: 10, satisfaction: 90, growth: 10 }
        ],
        studentProgress: [
          { month: 'Jan', onTrack: 85, atRisk: 10, excellent: 5 },
          { month: 'Feb', onTrack: 82, atRisk: 12, excellent: 6 },
          { month: 'Mar', onTrack: 88, atRisk: 8, excellent: 4 },
          { month: 'Apr', onTrack: 90, atRisk: 7, excellent: 3 },
          { month: 'May', onTrack: 87, atRisk: 9, excellent: 4 },
          { month: 'Jun', onTrack: 91, atRisk: 6, excellent: 3 }
        ],
        skillMarketAlignment: [
          { skill: 'Web Development', demand: 85, supply: 78, alignment: 92 },
          { skill: 'Mobile Dev', demand: 78, supply: 65, alignment: 83 },
          { skill: 'Data Science', demand: 92, supply: 58, alignment: 63 },
          { skill: 'Cloud Computing', demand: 88, supply: 62, alignment: 70 },
          { skill: 'AI/ML', demand: 95, supply: 45, alignment: 47 }
        ],
        departmentPerformance: [
          { dept: 'CS', students: 45, placed: 38, avgSalary: 25 },
          { dept: 'IT', students: 32, placed: 25, avgSalary: 22 },
          { dept: 'SE', students: 28, placed: 24, avgSalary: 28 },
          { dept: 'IS', students: 25, placed: 18, avgSalary: 20 },
          { dept: 'CE', students: 20, placed: 15, avgSalary: 24 }
        ]
      },
      examiner: {
        evaluationQuality: [
          { month: 'Jan', evaluations: 15, avgScore: 82, consistency: 88 },
          { month: 'Feb', evaluations: 18, avgScore: 85, consistency: 90 },
          { month: 'Mar', evaluations: 20, avgScore: 83, consistency: 92 },
          { month: 'Apr', evaluations: 22, avgScore: 87, consistency: 94 },
          { month: 'May', evaluations: 19, avgScore: 86, consistency: 93 },
          { month: 'Jun', evaluations: 25, avgScore: 89, consistency: 95 }
        ],
        studentPerformance: [
          { student: 'Student A', technical: 88, communication: 85, teamwork: 90, problemSolving: 82 },
          { student: 'Student B', technical: 92, communication: 78, teamwork: 85, problemSolving: 88 },
          { student: 'Student C', technical: 85, communication: 90, teamwork: 88, problemSolving: 86 },
          { student: 'Student D', technical: 90, communication: 82, teamwork: 87, problemSolving: 91 },
          { student: 'Student E', technical: 87, communication: 88, teamwork: 92, problemSolving: 84 }
        ],
        categoryDistribution: [
          { category: 'Technical Skills', avgScore: 86, weight: 40 },
          { category: 'Communication', avgScore: 84, weight: 20 },
          { category: 'Problem Solving', avgScore: 87, weight: 25 },
          { category: 'Teamwork', avgScore: 88, weight: 15 }
        ],
        workloadAnalysis: [
          { week: 'Week 1', reports: 8, evaluations: 5, hours: 12 },
          { week: 'Week 2', reports: 10, evaluations: 6, hours: 15 },
          { week: 'Week 3', reports: 9, evaluations: 7, hours: 14 },
          { week: 'Week 4', reports: 12, evaluations: 8, hours: 18 },
          { week: 'Week 5', reports: 11, evaluations: 6, hours: 16 },
          { week: 'Week 6', reports: 13, evaluations: 9, hours: 20 }
        ],
        feedbackPatterns: [
          { aspect: 'Code Quality', positive: 85, negative: 15, neutral: 0 },
          { aspect: 'Documentation', positive: 78, negative: 12, neutral: 10 },
          { aspect: 'Innovation', positive: 82, negative: 8, neutral: 10 },
          { aspect: 'Collaboration', positive: 90, negative: 5, neutral: 5 }
        ]
      },
      admin: {
        systemUsage: [
          { month: 'Jan', users: 450, sessions: 1200, dataProcessed: 850 },
          { month: 'Feb', users: 480, sessions: 1350, dataProcessed: 920 },
          { month: 'Mar', users: 520, sessions: 1450, dataProcessed: 1100 },
          { month: 'Apr', users: 580, sessions: 1600, dataProcessed: 1250 },
          { month: 'May', users: 620, sessions: 1750, dataProcessed: 1400 },
          { month: 'Jun', users: 680, sessions: 1900, dataProcessed: 1650 }
        ],
        performanceMetrics: [
          { metric: 'Response Time', current: 1.2, target: 1.0, status: 'Good' },
          { metric: 'Uptime', current: 99.8, target: 99.5, status: 'Excellent' },
          { metric: 'Error Rate', current: 0.3, target: 0.5, status: 'Excellent' },
          { metric: 'User Satisfaction', current: 91, target: 85, status: 'Excellent' }
        ],
        userGrowth: [
          { role: 'Student', current: 450, growth: 15, projection: 520 },
          { role: 'Company', current: 85, growth: 12, projection: 95 },
          { role: 'Coordinator', current: 12, growth: 8, projection: 13 },
          { role: 'Examiner', current: 8, growth: 25, projection: 10 },
          { role: 'Admin', current: 3, growth: 0, projection: 3 }
        ],
        resourceUtilization: [
          { resource: 'Server CPU', used: 65, available: 35, capacity: 100 },
          { resource: 'Database', used: 78, available: 22, capacity: 100 },
          { resource: 'Storage', used: 45, available: 55, capacity: 100 },
          { resource: 'Bandwidth', used: 82, available: 18, capacity: 100 }
        ],
        costAnalysis: [
          { category: 'Infrastructure', current: 15000, projected: 18000, savings: 2000 },
          { category: 'Support', current: 8000, projected: 9500, savings: 500 },
          { category: 'Development', current: 12000, projected: 14000, savings: 1000 },
          { category: 'Training', current: 5000, projected: 6000, savings: 800 }
        ]
      }
    };

    return baseData[role] || baseData.student;
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

  if (loading) {
    return (
      <div className="ai-charts-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Generating AI-powered visualizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-charts">
      <div className="charts-header">
        <h2>📊 AI-Powered Analytics Dashboard</h2>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="export-btn">
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Performance Trend Chart */}
        {chartData.performanceTrend && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>📈 Performance Trend Analysis</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#667eea' }}></div>
                  Performance Score
                </span>
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#764ba2' }}></div>
                  Evaluation Score
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  labelStyle={{ color: '#333', fontWeight: 'bold' }}
                />
                <Legend />
                <Area type="monotone" dataKey="score" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                <Line type="monotone" dataKey="evaluations" stroke="#764ba2" strokeWidth={3} dot={{ fill: '#764ba2', r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skill Radar Chart */}
        {chartData.skillRadar && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>🎯 Skills Assessment</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData.skillRadar}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="skill" stroke="#666" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                <Radar name="Current Level" dataKey="current" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                <Radar name="Target Level" dataKey="target" stroke="#764ba2" fill="#764ba2" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skill Progress Bars */}
        {chartData.skillProgress && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>💪 Skill Development Progress</h3>
            </div>
            <div className="skill-progress-bars">
              {chartData.skillProgress.map((skill, index) => (
                <div key={skill.skill} className="skill-progress-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-difficulty">{skill.difficulty}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${skill.progress}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                    <span className="progress-text">{skill.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Distribution Pie Chart */}
        {chartData.timeDistribution && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>⏰ Time Distribution Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.timeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ activity, percentage }) => `${activity}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {chartData.timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Company Matches Bar Chart */}
        {chartData.companyMatches && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🏢 Company Match Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.companyMatches}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="company" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  labelStyle={{ color: '#333', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar dataKey="match" fill="#667eea" name="Match Score %" />
                <Bar dataKey="positions" fill="#764ba2" name="Available Positions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Predictions vs Actual */}
        {chartData.predictions && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🔮 AI Predictions vs Actual Performance</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#667eea' }}></div>
                  Actual Score
                </span>
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#764ba2' }}></div>
                  Predicted Score
                </span>
                <span className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#43e97b' }}></div>
                  Confidence %
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#667eea" strokeWidth={3} dot={{ fill: '#667eea', r: 6 }} />
                <Line type="monotone" dataKey="predicted" stroke="#764ba2" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#764ba2', r: 6 }} />
                <Area type="monotone" dataKey="confidence" stroke="#43e97b" fill="#43e97b" fillOpacity={0.3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Talent Pipeline */}
        {chartData.talentPipeline && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>👥 Talent Pipeline Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.talentPipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="applicants" stackId="1" stroke="#667eea" fill="#667eea" />
                <Area type="monotone" dataKey="interviewed" stackId="2" stroke="#764ba2" fill="#764ba2" />
                <Area type="monotone" dataKey="hired" stackId="3" stroke="#43e97b" fill="#43e97b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skill Demand vs Supply */}
        {chartData.skillDemand && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>📊 Skill Demand vs Supply Gap</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.skillDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="skill" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="demand" fill="#667eea" name="Demand %" />
                <Bar dataKey="supply" fill="#764ba2" name="Supply %" />
                <Bar dataKey="gap" fill="#fa709a" name="Gap %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ROI Analysis */}
        {chartData.roiAnalysis && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>💰 ROI Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.roiAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="investment" fill="#667eea" name="Investment ($)" />
                <Bar yAxisId="left" dataKey="returns" fill="#43e97b" name="Returns ($)" />
                <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#fa709a" strokeWidth={3} name="ROI %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* System Usage Metrics */}
        {chartData.systemUsage && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🖥️ System Usage Metrics</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.systemUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#667eea" fill="#667eea" fillOpacity={0.6} name="Active Users" />
                <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#764ba2" strokeWidth={3} name="Sessions" />
                <Line yAxisId="right" type="monotone" dataKey="dataProcessed" stroke="#43e97b" strokeWidth={3} name="Data Processed (GB)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Resource Utilization */}
        {chartData.resourceUtilization && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>📊 Resource Utilization</h3>
            </div>
            <div className="resource-bars">
              {chartData.resourceUtilization.map((resource, index) => (
                <div key={resource.resource} className="resource-item">
                  <div className="resource-info">
                    <span className="resource-name">{resource.resource}</span>
                    <span className="resource-usage">{resource.used}% used</span>
                  </div>
                  <div className="resource-bar-container">
                    <div className="resource-bar">
                      <div 
                        className="resource-used"
                        style={{ 
                          width: `${resource.used}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                      <div 
                        className="resource-available"
                        style={{ 
                          width: `${resource.available}%`,
                          backgroundColor: '#e0e0e0'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCharts;
