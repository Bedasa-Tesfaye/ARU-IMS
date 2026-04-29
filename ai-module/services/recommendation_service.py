import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import json
import os

class RecommendationService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.scaler = MinMaxScaler()
        self.internship_data = None
        self.company_data = None
        self.feature_matrix = None
        self.company_feature_matrix = None
        
    def load_data(self):
        """Load and preprocess data for recommendations"""
        try:
            # In a real implementation, this would fetch from database
            # For now, we'll use sample data
            self.internship_data = self._load_sample_internships()
            self.company_data = self._load_sample_companies()
            
            # Create feature matrices
            self._create_feature_matrices()
            
        except Exception as e:
            print(f"Error loading data: {e}")
            
    def _load_sample_internships(self):
        """Load sample internship data"""
        return [
            {
                'id': 1,
                'title': 'Software Development Intern',
                'description': 'Develop web applications using modern frameworks',
                'requirements': 'JavaScript, React, Node.js',
                'type': 'full-time',
                'location': 'Remote',
                'industry': 'Technology',
                'skills_required': ['javascript', 'react', 'node.js', 'git'],
                'difficulty_level': 3
            },
            {
                'id': 2,
                'title': 'Data Science Intern',
                'description': 'Analyze data and build machine learning models',
                'requirements': 'Python, Machine Learning, Statistics',
                'type': 'full-time',
                'location': 'Hybrid',
                'industry': 'Technology',
                'skills_required': ['python', 'machine-learning', 'statistics', 'sql'],
                'difficulty_level': 4
            },
            {
                'id': 3,
                'title': 'Marketing Intern',
                'description': 'Create marketing campaigns and social media content',
                'requirements': 'Marketing, Social Media, Content Creation',
                'type': 'part-time',
                'location': 'On-site',
                'industry': 'Marketing',
                'skills_required': ['marketing', 'social-media', 'content-creation', 'analytics'],
                'difficulty_level': 2
            }
        ]
        
    def _load_sample_companies(self):
        """Load sample company data"""
        return [
            {
                'id': 1,
                'name': 'TechCorp',
                'industry': 'Technology',
                'description': 'Leading software development company',
                'size': 'Large',
                'culture': 'Innovative',
                'benefits': ['health-insurance', 'remote-work', 'training'],
                'rating': 4.5
            },
            {
                'id': 2,
                'name': 'DataAnalytics Inc',
                'industry': 'Data Science',
                'description': 'Data analytics and machine learning solutions',
                'size': 'Medium',
                'culture': 'Research-oriented',
                'benefits': ['health-insurance', 'flexible-hours', 'conferences'],
                'rating': 4.2
            },
            {
                'id': 3,
                'name': 'Creative Agency',
                'industry': 'Marketing',
                'description': 'Full-service marketing and advertising agency',
                'size': 'Small',
                'culture': 'Creative',
                'benefits': ['creative-freedom', 'casual-dress', 'team-events'],
                'rating': 4.0
            }
        ]
        
    def _create_feature_matrices(self):
        """Create feature matrices for similarity calculations"""
        if self.internship_data:
            # Combine text features for internships
            internship_texts = []
            for internship in self.internship_data:
                text = f"{internship['title']} {internship['description']} {internship['requirements']} {' '.join(internship['skills_required'])}"
                internship_texts.append(text)
            
            self.feature_matrix = self.vectorizer.fit_transform(internship_texts)
            
        if self.company_data:
            # Combine text features for companies
            company_texts = []
            for company in self.company_data:
                text = f"{company['name']} {company['description']} {company['industry']} {company['culture']} {' '.join(company['benefits'])}"
                company_texts.append(text)
            
            self.company_feature_matrix = self.vectorizer.fit_transform(company_texts)
    
    def recommend_internships(self, student_id, student_profile):
        """Recommend internships based on student profile"""
        try:
            if not self.internship_data:
                self.load_data()
            
            # Extract student preferences and skills
            student_skills = student_profile.get('skills', [])
            preferred_industries = student_profile.get('preferred_industries', [])
            experience_level = student_profile.get('experience_level', 1)
            
            # Create student profile text
            student_text = f"{' '.join(student_skills)} {' '.join(preferred_industries)} experience_level_{experience_level}"
            
            # Calculate similarity scores
            student_vector = self.vectorizer.transform([student_text])
            similarity_scores = cosine_similarity(student_vector, self.feature_matrix)[0]
            
            # Get recommendations with scores
            recommendations = []
            for i, internship in enumerate(self.internship_data):
                score = similarity_scores[i]
                
                # Apply additional scoring factors
                adjusted_score = self._adjust_internship_score(
                    internship, student_profile, score
                )
                
                recommendations.append({
                    'internship_id': internship['id'],
                    'title': internship['title'],
                    'company': 'Sample Company',  # Would be fetched from DB
                    'score': round(adjusted_score * 100, 2),
                    'match_reasons': self._get_match_reasons(internship, student_profile),
                    'difficulty_match': self._check_difficulty_match(internship, experience_level)
                })
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:5]  # Return top 5 recommendations
            
        except Exception as e:
            print(f"Error generating internship recommendations: {e}")
            return []
    
    def recommend_companies(self, student_id, student_profile):
        """Recommend companies based on student profile"""
        try:
            if not self.company_data:
                self.load_data()
            
            # Extract student preferences
            preferred_industries = student_profile.get('preferred_industries', [])
            company_size_preference = student_profile.get('company_size_preference', 'any')
            culture_preference = student_profile.get('culture_preference', [])
            
            # Create student preference text
            student_text = f"{' '.join(preferred_industries)} {company_size_preference} {' '.join(culture_preference)}"
            
            # Calculate similarity scores
            student_vector = self.vectorizer.transform([student_text])
            similarity_scores = cosine_similarity(student_vector, self.company_feature_matrix)[0]
            
            # Get recommendations with scores
            recommendations = []
            for i, company in enumerate(self.company_data):
                score = similarity_scores[i]
                
                # Apply additional scoring factors
                adjusted_score = self._adjust_company_score(
                    company, student_profile, score
                )
                
                recommendations.append({
                    'company_id': company['id'],
                    'name': company['name'],
                    'industry': company['industry'],
                    'size': company['size'],
                    'culture': company['culture'],
                    'rating': company['rating'],
                    'score': round(adjusted_score * 100, 2),
                    'match_reasons': self._get_company_match_reasons(company, student_profile),
                    'benefits': company['benefits']
                })
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:5]  # Return top 5 recommendations
            
        except Exception as e:
            print(f"Error generating company recommendations: {e}")
            return []
    
    def _adjust_internship_score(self, internship, student_profile, base_score):
        """Adjust internship score based on various factors"""
        score = base_score
        
        # Skills match bonus
        student_skills = set(skill.lower() for skill in student_profile.get('skills', []))
        required_skills = set(skill.lower() for skill in internship['skills_required'])
        
        skills_match = len(student_skills.intersection(required_skills)) / len(required_skills)
        score += skills_match * 0.3
        
        # Industry preference bonus
        preferred_industries = [ind.lower() for ind in student_profile.get('preferred_industries', [])]
        if internship['industry'].lower() in preferred_industries:
            score += 0.2
        
        # Experience level match
        experience_level = student_profile.get('experience_level', 1)
        if abs(internship['difficulty_level'] - experience_level) <= 1:
            score += 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _adjust_company_score(self, company, student_profile, base_score):
        """Adjust company score based on various factors"""
        score = base_score
        
        # Industry preference bonus
        preferred_industries = [ind.lower() for ind in student_profile.get('preferred_industries', [])]
        if company['industry'].lower() in preferred_industries:
            score += 0.3
        
        # Company size preference
        size_preference = student_profile.get('company_size_preference', 'any')
        if size_preference != 'any' and company['size'].lower() == size_preference.lower():
            score += 0.2
        
        # Culture preference
        culture_preference = student_profile.get('culture_preference', [])
        if company['culture'].lower() in [pref.lower() for pref in culture_preference]:
            score += 0.2
        
        # Rating bonus
        score += (company['rating'] / 5.0) * 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _get_match_reasons(self, internship, student_profile):
        """Get reasons why internship matches student profile"""
        reasons = []
        
        student_skills = set(skill.lower() for skill in student_profile.get('skills', []))
        required_skills = set(skill.lower() for skill in internship['skills_required'])
        
        matching_skills = student_skills.intersection(required_skills)
        if matching_skills:
            reasons.append(f"Skills match: {', '.join(matching_skills)}")
        
        preferred_industries = [ind.lower() for ind in student_profile.get('preferred_industries', [])]
        if internship['industry'].lower() in preferred_industries:
            reasons.append(f"Industry preference: {internship['industry']}")
        
        return reasons
    
    def _get_company_match_reasons(self, company, student_profile):
        """Get reasons why company matches student profile"""
        reasons = []
        
        preferred_industries = [ind.lower() for ind in student_profile.get('preferred_industries', [])]
        if company['industry'].lower() in preferred_industries:
            reasons.append(f"Industry preference: {company['industry']}")
        
        culture_preference = student_profile.get('culture_preference', [])
        if company['culture'].lower() in [pref.lower() for pref in culture_preference]:
            reasons.append(f"Culture match: {company['culture']}")
        
        if company['rating'] >= 4.0:
            reasons.append(f"High rating: {company['rating']}/5.0")
        
        return reasons
    
    def _check_difficulty_match(self, internship, experience_level):
        """Check if internship difficulty matches student experience"""
        diff = abs(internship['difficulty_level'] - experience_level)
        
        if diff == 0:
            return 'Perfect match'
        elif diff == 1:
            return 'Good match'
        elif diff == 2:
            return 'Challenging but achievable'
        else:
            return 'May be too difficult'
