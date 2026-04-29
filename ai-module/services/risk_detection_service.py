import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import json

class RiskDetectionService:
    def __init__(self):
        self.risk_model = None
        self.scaler = StandardScaler()
        self.risk_thresholds = {
            'high': 0.8,
            'medium': 0.6,
            'low': 0.3
        }
        
    def analyze_application_risk(self, application_data, student_profile):
        """Analyze risk factors for internship applications"""
        try:
            risk_factors = {}
            overall_risk_score = 0
            
            # Academic performance risk
            academic_risk = self._analyze_academic_risk(student_profile)
            risk_factors['academic'] = academic_risk
            
            # Experience mismatch risk
            experience_risk = self._analyze_experience_risk(application_data, student_profile)
            risk_factors['experience'] = experience_risk
            
            # Application quality risk
            quality_risk = self._analyze_application_quality(application_data)
            risk_factors['quality'] = quality_risk
            
            # Timeline risk
            timeline_risk = self._analyze_timeline_risk(application_data)
            risk_factors['timeline'] = timeline_risk
            
            # Competition risk
            competition_risk = self._analyze_competition_risk(application_data)
            risk_factors['competition'] = competition_risk
            
            # Calculate overall risk score
            overall_risk_score = self._calculate_overall_risk(risk_factors)
            
            # Generate risk level and recommendations
            risk_level = self._determine_risk_level(overall_risk_score)
            recommendations = self._generate_risk_recommendations(risk_factors, risk_level)
            
            return {
                'overall_risk_score': round(overall_risk_score * 100, 2),
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error analyzing application risk: {e}")
            return {
                'overall_risk_score': 0,
                'risk_level': 'unknown',
                'risk_factors': {},
                'recommendations': [],
                'error': str(e)
            }
    
    def generate_risk_alerts(self, internship_data, student_progress):
        """Generate risk alerts for ongoing internships"""
        try:
            alerts = []
            
            # Performance alerts
            performance_alerts = self._check_performance_risks(student_progress)
            alerts.extend(performance_alerts)
            
            # Engagement alerts
            engagement_alerts = self._check_engagement_risks(student_progress)
            alerts.extend(engagement_alerts)
            
            # Timeline alerts
            timeline_alerts = self._check_timeline_risks(internship_data, student_progress)
            alerts.extend(timeline_alerts)
            
            # Communication alerts
            communication_alerts = self._check_communication_risks(student_progress)
            alerts.extend(communication_alerts)
            
            return {
                'alerts': alerts,
                'total_alerts': len(alerts),
                'alert_summary': self._summarize_alerts(alerts),
                'generated_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating risk alerts: {e}")
            return {
                'alerts': [],
                'total_alerts': 0,
                'error': str(e)
            }
    
    def _analyze_academic_risk(self, student_profile):
        """Analyze academic performance risk"""
        risk_score = 0
        factors = []
        
        # GPA analysis
        gpa = student_profile.get('gpa', 0)
        if gpa < 2.0:
            risk_score += 0.4
            factors.append('Low GPA (< 2.0)')
        elif gpa < 3.0:
            risk_score += 0.2
            factors.append('Moderate GPA (< 3.0)')
        
        # Academic standing
        academic_standing = student_profile.get('academic_standing', 'good')
        if academic_standing == 'probation':
            risk_score += 0.3
            factors.append('Academic probation')
        elif academic_standing == 'warning':
            risk_score += 0.15
            factors.append('Academic warning')
        
        # Major relevance
        major_relevance = student_profile.get('major_relevance', 0.5)
        if major_relevance < 0.3:
            risk_score += 0.2
            factors.append('Low major relevance')
        
        return {
            'score': min(risk_score, 1.0),
            'factors': factors,
            'assessment': 'High academic risk' if risk_score > 0.5 else 'Moderate academic risk' if risk_score > 0.2 else 'Low academic risk'
        }
    
    def _analyze_experience_risk(self, application_data, student_profile):
        """Analyze experience mismatch risk"""
        risk_score = 0
        factors = []
        
        # Required experience vs student experience
        required_experience = application_data.get('required_experience_years', 0)
        student_experience = student_profile.get('total_experience_years', 0)
        
        if student_experience < required_experience:
            experience_gap = required_experience - student_experience
            risk_score += min(experience_gap * 0.2, 0.4)
            factors.append(f'Experience gap: {experience_gap} years')
        
        # Skills match
        required_skills = set(application_data.get('required_skills', []))
        student_skills = set(student_profile.get('skills', []))
        
        if required_skills:
            skill_match_ratio = len(student_skills.intersection(required_skills)) / len(required_skills)
            if skill_match_ratio < 0.3:
                risk_score += 0.3
                factors.append('Low skills match (< 30%)')
            elif skill_match_ratio < 0.6:
                risk_score += 0.15
                factors.append('Moderate skills match (< 60%)')
        
        return {
            'score': min(risk_score, 1.0),
            'factors': factors,
            'assessment': 'High experience risk' if risk_score > 0.5 else 'Moderate experience risk' if risk_score > 0.2 else 'Low experience risk'
        }
    
    def _analyze_application_quality(self, application_data):
        """Analyze application quality risk"""
        risk_score = 0
        factors = []
        
        # Cover letter quality
        cover_letter = application_data.get('cover_letter', '')
        if len(cover_letter) < 100:
            risk_score += 0.2
            factors.append('Short cover letter')
        elif len(cover_letter) < 300:
            risk_score += 0.1
            factors.append('Brief cover letter')
        
        # Resume quality indicators
        has_resume = application_data.get('resume_path') is not None
        if not has_resume:
            risk_score += 0.3
            factors.append('No resume provided')
        
        # Application completeness
        required_fields = ['cover_letter', 'resume_path', 'portfolio_url']
        missing_fields = [field for field in required_fields if not application_data.get(field)]
        if missing_fields:
            risk_score += len(missing_fields) * 0.1
            factors.append(f'Missing fields: {", ".join(missing_fields)}')
        
        return {
            'score': min(risk_score, 1.0),
            'factors': factors,
            'assessment': 'High quality risk' if risk_score > 0.5 else 'Moderate quality risk' if risk_score > 0.2 else 'Low quality risk'
        }
    
    def _analyze_timeline_risk(self, application_data):
        """Analyze timeline-related risk"""
        risk_score = 0
        factors = []
        
        # Application submission timing
        applied_date = application_data.get('applied_date')
        deadline = application_data.get('deadline')
        
        if applied_date and deadline:
            days_to_deadline = (deadline - applied_date).days
            if days_to_deadline < 7:
                risk_score += 0.2
                factors.append('Last-minute application')
            elif days_to_deadline < 3:
                risk_score += 0.3
                factors.append('Very late application')
        
        # Internship start date proximity
        start_date = application_data.get('start_date')
        if start_date:
            days_until_start = (start_date - datetime.now().date()).days
            if days_until_start < 30:
                risk_score += 0.15
                factors.append('Short preparation time')
        
        return {
            'score': min(risk_score, 1.0),
            'factors': factors,
            'assessment': 'High timeline risk' if risk_score > 0.5 else 'Moderate timeline risk' if risk_score > 0.2 else 'Low timeline risk'
        }
    
    def _analyze_competition_risk(self, application_data):
        """Analyze competition-related risk"""
        risk_score = 0
        factors = []
        
        # Number of applicants
        total_applicants = application_data.get('total_applicants', 0)
        max_positions = application_data.get('max_positions', 1)
        
        if total_applicants > 0 and max_positions > 0:
            competition_ratio = total_applicants / max_positions
            if competition_ratio > 50:
                risk_score += 0.4
                factors.append('Very high competition')
            elif competition_ratio > 20:
                risk_score += 0.2
                factors.append('High competition')
            elif competition_ratio > 10:
                risk_score += 0.1
                factors.append('Moderate competition')
        
        return {
            'score': min(risk_score, 1.0),
            'factors': factors,
            'assessment': 'High competition risk' if risk_score > 0.5 else 'Moderate competition risk' if risk_score > 0.2 else 'Low competition risk'
        }
    
    def _calculate_overall_risk(self, risk_factors):
        """Calculate overall risk score from individual factors"""
        weights = {
            'academic': 0.25,
            'experience': 0.30,
            'quality': 0.20,
            'timeline': 0.10,
            'competition': 0.15
        }
        
        overall_score = 0
        for factor_name, factor_data in risk_factors.items():
            weight = weights.get(factor_name, 0.2)
            score = factor_data.get('score', 0)
            overall_score += weight * score
        
        return min(overall_score, 1.0)
    
    def _determine_risk_level(self, risk_score):
        """Determine risk level based on score"""
        if risk_score >= self.risk_thresholds['high']:
            return 'high'
        elif risk_score >= self.risk_thresholds['medium']:
            return 'medium'
        elif risk_score >= self.risk_thresholds['low']:
            return 'low'
        else:
            return 'very_low'
    
    def _generate_risk_recommendations(self, risk_factors, risk_level):
        """Generate recommendations based on risk analysis"""
        recommendations = []
        
        # Academic recommendations
        if risk_factors['academic']['score'] > 0.3:
            recommendations.append({
                'category': 'academic',
                'priority': 'high' if risk_factors['academic']['score'] > 0.5 else 'medium',
                'action': 'Improve academic performance',
                'details': 'Focus on maintaining good grades and academic standing'
            })
        
        # Experience recommendations
        if risk_factors['experience']['score'] > 0.3:
            recommendations.append({
                'category': 'experience',
                'priority': 'high' if risk_factors['experience']['score'] > 0.5 else 'medium',
                'action': 'Gain relevant experience',
                'details': 'Consider internships, projects, or certifications to build required skills'
            })
        
        # Application quality recommendations
        if risk_factors['quality']['score'] > 0.3:
            recommendations.append({
                'category': 'application',
                'priority': 'high' if risk_factors['quality']['score'] > 0.5 else 'medium',
                'action': 'Improve application materials',
                'details': 'Enhance your resume and cover letter to better showcase your qualifications'
            })
        
        # Timeline recommendations
        if risk_factors['timeline']['score'] > 0.3:
            recommendations.append({
                'category': 'timeline',
                'priority': 'medium',
                'action': 'Apply earlier',
                'details': 'Submit applications well before deadlines to improve chances'
            })
        
        return recommendations
    
    def _check_performance_risks(self, student_progress):
        """Check for performance-related risks"""
        alerts = []
        
        # Report submission delays
        reports = student_progress.get('reports', [])
        for report in reports:
            if report.get('overdue_days', 0) > 3:
                alerts.append({
                    'type': 'performance',
                    'severity': 'high',
                    'message': f'Report "{report.get("title", "Unknown")}" is {report.get("overdue_days", 0)} days overdue',
                    'recommendation': 'Submit overdue reports immediately and communicate with supervisor'
                })
        
        # Low evaluation scores
        evaluations = student_progress.get('evaluations', [])
        for evaluation in evaluations:
            if evaluation.get('overall_score', 0) < 6:
                alerts.append({
                    'type': 'performance',
                    'severity': 'medium',
                    'message': f'Low evaluation score: {evaluation.get("overall_score", 0)}/10',
                    'recommendation': 'Discuss performance with supervisor and create improvement plan'
                })
        
        return alerts
    
    def _check_engagement_risks(self, student_progress):
        """Check for engagement-related risks"""
        alerts = []
        
        # Low activity
        activity_level = student_progress.get('activity_level', 0)
        if activity_level < 0.3:
            alerts.append({
                'type': 'engagement',
                'severity': 'medium',
                'message': 'Low engagement detected',
                'recommendation': 'Increase participation and communication with team'
            })
        
        return alerts
    
    def _check_timeline_risks(self, internship_data, student_progress):
        """Check for timeline-related risks"""
        alerts = []
        
        # Internship end date approaching
        end_date = internship_data.get('end_date')
        if end_date:
            days_until_end = (end_date - datetime.now().date()).days
            if days_until_end < 30 and days_until_end > 0:
                alerts.append({
                    'type': 'timeline',
                    'severity': 'low',
                    'message': f'Internship ends in {days_until_end} days',
                    'recommendation': 'Ensure all deliverables are completed and prepare final report'
                })
        
        return alerts
    
    def _check_communication_risks(self, student_progress):
        """Check for communication-related risks"""
        alerts = []
        
        # Infrequent check-ins
        last_checkin = student_progress.get('last_checkin')
        if last_checkin:
            days_since_checkin = (datetime.now().date() - last_checkin).days
            if days_since_checkin > 14:
                alerts.append({
                    'type': 'communication',
                    'severity': 'medium',
                    'message': f'No check-in for {days_since_checkin} days',
                    'recommendation': 'Schedule regular check-ins with supervisor'
                })
        
        return alerts
    
    def _summarize_alerts(self, alerts):
        """Summarize alerts by type and severity"""
        summary = {
            'high': 0,
            'medium': 0,
            'low': 0,
            'by_type': {}
        }
        
        for alert in alerts:
            severity = alert.get('severity', 'low')
            summary[severity] += 1
            
            alert_type = alert.get('type', 'unknown')
            if alert_type not in summary['by_type']:
                summary['by_type'][alert_type] = 0
            summary['by_type'][alert_type] += 1
        
        return summary
