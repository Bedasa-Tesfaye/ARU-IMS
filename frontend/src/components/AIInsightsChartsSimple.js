import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import './AIInsightsCharts.css';

const AIInsightsChartsSimple = ({ userRole, userId }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI API call for chart data
    setTimeout(() => {
      const aiChartData = generateChartData(userRole, userId);
      setChartData(aiChartData);
      setLoading(false);
    }, 1000);
  }, [userRole, userId]);

  const generateChartData = (role, id) => {
    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

    const baseData = {
      student: {
        performanceTrend: [
          { month: 'Jan', score: 65, evaluations: 85 },
          { month: 'Feb', score: 68, evaluations: 82 },
          { month: 'Mar', score: 72, evaluations: 88 },
          { month: 'Apr', score: 78, evaluations: 90 },
          { month: 'May', score: 82, evaluations: 92 },
          { month: 'Jun', score: 85, evaluations: 94 }
        ],
        skillProgress: [
          { skill: 'JavaScript', progress: 75 },
          { skill: 'React', progress: 82 },
          { skill: 'Python', progress: 68 },
          { skill: 'Database', progress: 60 },
          { skill: 'DevOps', progress: 45 }
        ],
        timeDistribution: [
          { activity: 'Coding', hours: 120 },
          { activity: 'Learning', hours: 80 },
          { activity: 'Meetings', hours: 60 },
          { activity: 'Documentation', hours: 50 }
        ]
      },
      company: {
        talentPipeline: [
          { month: 'Jan', applicants: 45, hired: 3 },
          { month: 'Feb', applicants: 52, hired: 4 },
          { month: 'Mar', applicants: 48, hired: 5 },
          { month: 'Apr', applicants: 58, hired: 6 },
          { month: 'May', applicants: 62, hired: 7 },
          { month: 'Jun', applicants: 55, hired: 5 }
        ],
        skillDemand: [
          { skill: 'JavaScript', demand: 85, supply: 70 },
          { skill: 'Python', demand: 78, supply: 65 },
          { skill: 'React', demand: 82, supply: 60 },
          { skill: 'Database', demand: 70, supply: 55 }
        ]
      },
      coordinator: {
        placementTrends: [
          { year: '2020', placed: 45, rate: 38 },
          { year: '2021', placed: 58, rate: 43 },
          { year: '2022', placed: 72, rate: 51 },
          { year: '2023', placed: 85, rate: 59 },
          { year: '2024', placed: 98, rate: 65 }
        ],
        departmentPerformance: [
          { dept: 'CS', students: 45, placed: 38 },
          { dept: 'IT', students: 32, placed: 25 },
          { dept: 'SE', students: 28, placed: 24 },
          { dept: 'IS', students: 25, placed: 18 }
        ]
      },
      examiner: {
        evaluationQuality: [
          { month: 'Jan', evaluations: 15, avgScore: 82 },
          { month: 'Feb', evaluations: 18, avgScore: 85 },
          { month: 'Mar', evaluations: 20, avgScore: 83 },
          { month: 'Apr', evaluations: 22, avgScore: 87 },
          { month: 'May', evaluations: 19, avgScore: 86 },
          { month: 'Jun', evaluations: 25, avgScore: 89 }
        ],
        workloadAnalysis: [
          { week: 'Week 1', reports: 8, hours: 12 },
          { week: 'Week 2', reports: 10, hours: 15 },
          { week: 'Week 3', reports: 9, hours: 14 },
          { week: 'Week 4', reports: 12, hours: 18 },
          { week: 'Week 5', reports: 11, hours: 16 },
          { week: 'Week 6', reports: 13, hours: 20 }
        ]
      },
      admin: {
        systemUsage: [
          { month: 'Jan', users: 450, sessions: 1200 },
          { month: 'Feb', users: 480, sessions: 1350 },
          { month: 'Mar', users: 520, sessions: 1450 },
          { month: 'Apr', users: 580, sessions: 1600 },
          { month: 'May', users: 620, sessions: 1750 },
          { month: 'Jun', users: 680, sessions: 1900 }
        ],
        userGrowth: [
          { role: 'Student', current: 450, growth: 15 },
          { role: 'Company', current: 85, growth: 12 },
          { role: 'Coordinator', current: 12, growth: 8 },
          { role: 'Examiner', current: 8, growth: 25 },
          { role: 'Admin', current: 3, growth: 0 }
        ]
      }
    };

    return baseData[role] || baseData.student;
  };

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
      </div>

      <div className="charts-grid">
        {/* Performance Trend Chart */}
        {chartData.performanceTrend && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>📈 Performance Trend Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={3} name="Performance Score" />
                <Line type="monotone" dataKey="evaluations" stroke="#764ba2" strokeWidth={3} name="Evaluation Score" />
              </LineChart>
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
                    <span className="skill-percentage">{skill.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${skill.progress}%`,
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][index]
                      }}
                    ></div>
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
                  label={({ activity, hours }) => `${activity}: ${hours}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {chartData.timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#667eea', '#764ba2', '#f093fb', '#4facfe'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
                <Area type="monotone" dataKey="applicants" stackId="1" stroke="#667eea" fill="#667eea" name="Applicants" />
                <Area type="monotone" dataKey="hired" stackId="2" stroke="#43e97b" fill="#43e97b" name="Hired" />
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Placement Trends */}
        {chartData.placementTrends && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>📈 Placement Trends Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.placementTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="placed" stroke="#667eea" strokeWidth={3} name="Students Placed" />
                <Line type="monotone" dataKey="rate" stroke="#764ba2" strokeWidth={3} name="Placement Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department Performance */}
        {chartData.departmentPerformance && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🏫 Department Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dept" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#667eea" name="Total Students" />
                <Bar dataKey="placed" fill="#43e97b" name="Placed Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Evaluation Quality */}
        {chartData.evaluationQuality && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>📊 Evaluation Quality Metrics</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.evaluationQuality}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="evaluations" fill="#667eea" name="Evaluations" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#764ba2" strokeWidth={3} name="Avg Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Workload Analysis */}
        {chartData.workloadAnalysis && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>⏰ Workload Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.workloadAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="reports" stroke="#667eea" fill="#667eea" name="Reports" />
                <Area type="monotone" dataKey="hours" stroke="#764ba2" fill="#764ba2" name="Hours" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* System Usage */}
        {chartData.systemUsage && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>🖥️ System Usage Metrics</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.systemUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={3} name="Active Users" />
                <Line type="monotone" dataKey="sessions" stroke="#764ba2" strokeWidth={3} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Growth */}
        {chartData.userGrowth && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>👥 User Growth Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="role" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#667eea" name="Current Users" />
                <Bar dataKey="growth" fill="#43e97b" name="Growth %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsChartsSimple;
