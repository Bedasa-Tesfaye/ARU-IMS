import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.preprocessing import StandardScaler, LabelEncoder
import json
from datetime import datetime, timedelta

class AnalyticsService:
    def __init__(self):
        self.success_model = None
        self.performance_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def analyze_student_performance(self, student_id, performance_data):
        """Analyze student performance trends and patterns"""
        try:
            if not performance_data:
                return {'error': 'No performance data provided'}
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(performance_data)
            
            # Calculate performance metrics
            metrics = self._calculate_performance_metrics(df)
            
            # Identify trends
            trends = self._identify_performance_trends(df)
            
            # Generate insights
            insights = self._generate_performance_insights(metrics, trends)
            
            # Predict future performance
            predictions = self._predict_future_performance(df)
            
            # Compare with peers
            peer_comparison = self._compare_with_peers(student_id, metrics)
            
            return {
                'student_id': student_id,
                'analysis_date': datetime.now().isoformat(),
                'metrics': metrics,
                'trends': trends,
                'insights': insights,
                'predictions': predictions,
                'peer_comparison': peer_comparison,
                'recommendations': self._generate_performance_recommendations(metrics, trends)
            }
            
        except Exception as e:
            print(f"Error analyzing student performance: {e}")
            return {'error': str(e)}
    
    def predict_internship_success(self, application_data, student_profile):
        """Predict success probability for internship applications"""
        try:
            # Extract features for prediction
            features = self._extract_success_features(application_data, student_profile)
            
            # Load or train success prediction model
            if self.success_model is None:
                self._train_success_model()
            
            # Make prediction
            if self.success_model is not None:
                success_probability = self.success_model.predict_proba([features])[0][1]
                feature_importance = self._get_feature_importance(features)
            else:
                # Fallback to rule-based prediction
                success_probability = self._rule_based_success_prediction(features)
                feature_importance = {}
            
            # Generate success factors
            success_factors = self._identify_success_factors(features, student_profile)
            
            # Improvement suggestions
            improvement_suggestions = self._generate_improvement_suggestions(features, feature_importance)
            
            return {
                'success_probability': round(success_probability * 100, 2),
                'confidence_level': self._calculate_confidence_level(features),
                'success_factors': success_factors,
                'risk_factors': self._identify_risk_factors(features),
                'improvement_suggestions': improvement_suggestions,
                'feature_importance': feature_importance,
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error predicting internship success: {e}")
            return {'error': str(e)}
    
    def get_company_insights(self, company_id):
        """Get insights about company performance and patterns"""
        try:
            # In a real implementation, this would fetch data from database
            # For now, we'll use sample data
            company_data = self._get_sample_company_data(company_id)
            
            # Analyze application patterns
            application_patterns = self._analyze_company_application_patterns(company_data)
            
            # Analyze success rates
            success_analysis = self._analyze_company_success_rates(company_data)
            
            # Identify top performing interns
            top_performers = self._identify_top_performers(company_data)
            
            # Generate recommendations
            recommendations = self._generate_company_recommendations(company_data, success_analysis)
            
            return {
                'company_id': company_id,
                'analysis_date': datetime.now().isoformat(),
                'application_patterns': application_patterns,
                'success_analysis': success_analysis,
                'top_performers': top_performers,
                'recommendations': recommendations,
                'key_metrics': self._calculate_company_metrics(company_data)
            }
            
        except Exception as e:
            print(f"Error getting company insights: {e}")
            return {'error': str(e)}
    
    def _calculate_performance_metrics(self, df):
        """Calculate various performance metrics"""
        metrics = {}
        
        # Evaluation scores
        if 'evaluation_score' in df.columns:
            metrics['average_evaluation_score'] = df['evaluation_score'].mean()
            metrics['evaluation_score_trend'] = self._calculate_trend(df['evaluation_score'])
            metrics['evaluation_score_variance'] = df['evaluation_score'].var()
        
        # Report submission timeliness
        if 'report_submission_delay' in df.columns:
            metrics['average_report_delay'] = df['report_submission_delay'].mean()
            metrics['on_time_submission_rate'] = (df['report_submission_delay'] <= 0).mean() * 100
        
        # Skill development
        if 'skill_improvement' in df.columns:
            metrics['skill_development_rate'] = df['skill_improvement'].mean()
        
        # Overall performance score
        metrics['overall_performance'] = self._calculate_overall_performance_score(metrics)
        
        return metrics
    
    def _identify_performance_trends(self, df):
        """Identify trends in performance data"""
        trends = {}
        
        # Sort by date if available
        if 'date' in df.columns:
            df = df.sort_values('date')
        
        # Calculate trends for numeric columns
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if len(df[col]) > 1:
                trend = self._calculate_trend(df[col])
                trends[col] = {
                    'direction': 'improving' if trend > 0.1 else 'declining' if trend < -0.1 else 'stable',
                    'slope': trend,
                    'significance': abs(trend) > 0.05
                }
        
        return trends
    
    def _generate_performance_insights(self, metrics, trends):
        """Generate insights based on performance metrics and trends"""
        insights = []
        
        # Overall performance insights
        if metrics.get('overall_performance', 0) > 0.8:
            insights.append({
                'type': 'positive',
                'message': 'Excellent overall performance',
                'detail': 'Student is performing in the top 20% of metrics'
            })
        elif metrics.get('overall_performance', 0) < 0.4:
            insights.append({
                'type': 'concern',
                'message': 'Performance needs improvement',
                'detail': 'Student is performing below average in multiple areas'
            })
        
        # Trend-based insights
        for metric, trend_data in trends.items():
            if trend_data['direction'] == 'declining' and trend_data['significance']:
                insights.append({
                    'type': 'warning',
                    'message': f'Declining trend in {metric}',
                    'detail': f'Significant negative trend detected with slope {trend_data["slope"]:.3f}'
                })
            elif trend_data['direction'] == 'improving' and trend_data['significance']:
                insights.append({
                    'type': 'positive',
                    'message': f'Improving trend in {metric}',
                    'detail': f'Significant positive trend detected with slope {trend_data["slope"]:.3f}'
                })
        
        return insights
    
    def _predict_future_performance(self, df):
        """Predict future performance based on historical data"""
        predictions = {}
        
        # Simple linear trend prediction
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if len(df[col]) >= 3:
                # Calculate trend
                x = np.arange(len(df[col]))
                slope, intercept = np.polyfit(x, df[col], 1)
                
                # Predict next value
                next_prediction = slope * len(df[col]) + intercept
                predictions[col] = {
                    'next_period': round(next_prediction, 2),
                    'confidence': self._calculate_prediction_confidence(df[col]),
                    'trend': 'increasing' if slope > 0 else 'decreasing'
                }
        
        return predictions
    
    def _compare_with_peers(self, student_id, metrics):
        """Compare student performance with peers"""
        # In a real implementation, this would fetch peer data from database
        # For now, we'll use simulated peer comparison
        peer_metrics = {
            'average_evaluation_score': np.random.normal(7.5, 1.5),
            'on_time_submission_rate': np.random.normal(85, 10),
            'skill_development_rate': np.random.normal(0.7, 0.2),
            'overall_performance': np.random.normal(0.65, 0.15)
        }
        
        comparison = {}
        for metric, student_value in metrics.items():
            if metric in peer_metrics:
                peer_avg = peer_metrics[metric]
                percentile = self._calculate_percentile(student_value, peer_avg, 0.15)
                comparison[metric] = {
                    'student_value': student_value,
                    'peer_average': peer_avg,
                    'percentile': percentile,
                    'ranking': 'above average' if percentile > 50 else 'below average'
                }
        
        return comparison
    
    def _extract_success_features(self, application_data, student_profile):
        """Extract features for success prediction"""
        features = []
        
        # Academic features
        features.append(student_profile.get('gpa', 3.0))
        features.append(1 if student_profile.get('academic_standing') == 'good' else 0)
        
        # Experience features
        features.append(student_profile.get('total_experience_years', 0))
        features.append(len(student_profile.get('skills', [])))
        
        # Application features
        features.append(len(application_data.get('cover_letter', '')))
        features.append(1 if application_data.get('resume_path') else 0)
        
        # Competition features
        features.append(application_data.get('total_applicants', 0))
        features.append(application_data.get('max_positions', 1))
        
        # Skills match
        required_skills = set(application_data.get('required_skills', []))
        student_skills = set(student_profile.get('skills', []))
        skills_match = len(student_skills.intersection(required_skills)) / len(required_skills) if required_skills else 0
        features.append(skills_match)
        
        return features
    
    def _train_success_model(self):
        """Train the success prediction model"""
        try:
            # In a real implementation, this would use historical data
            # For now, we'll create a simple mock model
            self.success_model = RandomForestClassifier(n_estimators=10, random_state=42)
            
            # Mock training data
            X_train = np.random.rand(100, 8)  # 8 features
            y_train = np.random.randint(0, 2, 100)
            
            self.success_model.fit(X_train, y_train)
            
        except Exception as e:
            print(f"Error training success model: {e}")
            self.success_model = None
    
    def _rule_based_success_prediction(self, features):
        """Fallback rule-based success prediction"""
        score = 0.5  # Base score
        
        # GPA impact
        if features[0] > 3.5:
            score += 0.2
        elif features[0] > 3.0:
            score += 0.1
        elif features[0] < 2.5:
            score -= 0.2
        
        # Experience impact
        if features[2] > 2:
            score += 0.15
        elif features[2] > 1:
            score += 0.1
        
        # Skills match impact
        if features[7] > 0.7:
            score += 0.2
        elif features[7] > 0.5:
            score += 0.1
        elif features[7] < 0.3:
            score -= 0.15
        
        return max(0, min(1, score))
    
    def _identify_success_factors(self, features, student_profile):
        """Identify factors contributing to success"""
        factors = []
        
        if features[0] > 3.5:
            factors.append('Strong academic performance')
        
        if features[2] > 1:
            factors.append('Relevant experience')
        
        if features[7] > 0.6:
            factors.append('Good skills match')
        
        if len(student_profile.get('skills', [])) > 5:
            factors.append('Diverse skill set')
        
        return factors
    
    def _identify_risk_factors(self, features):
        """Identify risk factors for success"""
        risks = []
        
        if features[0] < 2.5:
            risks.append('Low GPA may impact success')
        
        if features[2] < 0.5:
            risks.append('Limited experience')
        
        if features[7] < 0.3:
            risks.append('Poor skills match')
        
        if features[5] > 50:  # High competition
            risks.append('High competition for position')
        
        return risks
    
    def _generate_improvement_suggestions(self, features, feature_importance):
        """Generate suggestions for improving success probability"""
        suggestions = []
        
        if features[0] < 3.0:
            suggestions.append({
                'area': 'Academic Performance',
                'suggestion': 'Focus on improving GPA through better study habits',
                'impact': 'High'
            })
        
        if features[2] < 1:
            suggestions.append({
                'area': 'Experience',
                'suggestion': 'Gain relevant experience through projects or internships',
                'impact': 'High'
            })
        
        if features[7] < 0.5:
            suggestions.append({
                'area': 'Skills',
                'suggestion': 'Develop required skills through courses or self-study',
                'impact': 'High'
            })
        
        if features[4] < 200:
            suggestions.append({
                'area': 'Application Quality',
                'suggestion': 'Improve cover letter quality and detail',
                'impact': 'Medium'
            })
        
        return suggestions
    
    def _calculate_trend(self, series):
        """Calculate trend slope for a series"""
        if len(series) < 2:
            return 0
        
        x = np.arange(len(series))
        slope, _ = np.polyfit(x, series, 1)
        return slope
    
    def _calculate_overall_performance_score(self, metrics):
        """Calculate overall performance score from metrics"""
        weights = {
            'average_evaluation_score': 0.4,
            'on_time_submission_rate': 0.3,
            'skill_development_rate': 0.3
        }
        
        score = 0
        total_weight = 0
        
        for metric, weight in weights.items():
            if metric in metrics:
                # Normalize metric to 0-1 scale
                normalized_value = min(1, max(0, metrics[metric] / 10)) if 'score' in metric else min(1, max(0, metrics[metric] / 100))
                score += normalized_value * weight
                total_weight += weight
        
        return score / total_weight if total_weight > 0 else 0
    
    def _calculate_percentile(self, value, mean, std):
        """Calculate percentile rank given value, mean, and standard deviation"""
        z_score = (value - mean) / std
        # Convert z-score to approximate percentile
        percentile = (1 + np.sign(z_score) * (1 - np.exp(-2 * np.abs(z_score) / np.pi))) * 50
        return max(0, min(100, percentile))
    
    def _calculate_prediction_confidence(self, series):
        """Calculate confidence level for predictions"""
        if len(series) < 3:
            return 0.3
        
        # Higher confidence with more data points and lower variance
        data_points_factor = min(1, len(series) / 10)
        variance_factor = max(0.3, 1 - (series.var() / (series.mean() + 0.1)))
        
        return (data_points_factor + variance_factor) / 2
    
    def _calculate_confidence_level(self, features):
        """Calculate confidence level for success prediction"""
        # Higher confidence with complete feature data
        completeness = sum(1 for f in features if f is not None and f != 0) / len(features)
        return min(0.95, completeness * 0.8 + 0.15)
    
    def _get_feature_importance(self, features):
        """Get feature importance for prediction"""
        # Simplified feature importance
        feature_names = ['gpa', 'academic_standing', 'experience_years', 'skills_count', 
                        'cover_letter_length', 'has_resume', 'total_applicants', 'skills_match']
        
        importance_scores = [0.25, 0.1, 0.2, 0.15, 0.1, 0.05, 0.1, 0.05]
        
        return dict(zip(feature_names, importance_scores))
    
    def _get_sample_company_data(self, company_id):
        """Get sample company data for analysis"""
        return {
            'company_id': company_id,
            'total_applications': 150,
            'total_hires': 45,
            'average_internship_rating': 4.2,
            'common_skills': ['javascript', 'python', 'communication'],
            'top_performing_interns': [1, 2, 3],
            'application_trends': 'increasing'
        }
    
    def _analyze_company_application_patterns(self, company_data):
        """Analyze application patterns for a company"""
        return {
            'peak_application_months': ['January', 'February', 'September'],
            'average_applications_per_internship': 25,
            'application_to_hire_ratio': 3.3,
            'most_common_skills_requested': ['javascript', 'python', 'communication'],
            'application_trend': 'increasing'
        }
    
    def _analyze_company_success_rates(self, company_data):
        """Analyze success rates for a company"""
        total_apps = company_data.get('total_applications', 100)
        total_hires = company_data.get('total_hires', 30)
        
        return {
            'overall_success_rate': (total_hires / total_apps) * 100,
            'internship_completion_rate': 92,
            'average_internship_rating': company_data.get('average_internship_rating', 4.0),
            'return_intern_rate': 15,
            'post_internship_hire_rate': 35
        }
    
    def _identify_top_performers(self, company_data):
        """Identify top performing interns"""
        return {
            'top_performers': [
                {'intern_id': 1, 'rating': 4.8, 'skills': ['leadership', 'problem-solving']},
                {'intern_id': 2, 'rating': 4.6, 'skills': ['communication', 'technical']},
                {'intern_id': 3, 'rating': 4.5, 'skills': ['creativity', 'teamwork']}
            ],
            'common_traits': ['strong communication', 'technical skills', 'proactive attitude']
        }
    
    def _generate_company_recommendations(self, company_data, success_analysis):
        """Generate recommendations for company improvement"""
        recommendations = []
        
        if success_analysis.get('overall_success_rate', 0) < 30:
            recommendations.append({
                'category': 'recruitment',
                'priority': 'high',
                'recommendation': 'Improve job descriptions to attract better candidates'
            })
        
        if success_analysis.get('internship_completion_rate', 100) < 85:
            recommendations.append({
                'category': 'internship_program',
                'priority': 'medium',
                'recommendation': 'Enhance internship support and mentorship'
            })
        
        return recommendations
    
    def _calculate_company_metrics(self, company_data):
        """Calculate key metrics for company"""
        return {
            'total_applications': company_data.get('total_applications', 0),
            'total_hires': company_data.get('total_hires', 0),
            'conversion_rate': (company_data.get('total_hires', 0) / max(1, company_data.get('total_applications', 1))) * 100,
            'average_rating': company_data.get('average_internship_rating', 0),
            'program_effectiveness': 'high' if company_data.get('average_internship_rating', 0) > 4.0 else 'medium'
        }
    
    def _generate_performance_recommendations(self, metrics, trends):
        """Generate recommendations based on performance analysis"""
        recommendations = []
        
        if metrics.get('overall_performance', 0) < 0.5:
            recommendations.append({
                'type': 'improvement',
                'priority': 'high',
                'action': 'Focus on improving overall performance',
                'details': 'Consider additional training or mentorship'
            })
        
        # Check for declining trends
        for metric, trend_data in trends.items():
            if trend_data['direction'] == 'declining' and trend_data['significance']:
                recommendations.append({
                    'type': 'trend_correction',
                    'priority': 'medium',
                    'action': f'Address declining {metric}',
                    'details': f'Investigate causes and implement corrective measures'
                })
        
        return recommendations
