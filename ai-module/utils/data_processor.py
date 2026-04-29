import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
from datetime import datetime

class DataProcessor:
    def __init__(self):
        self.models_dir = 'models'
        self.data_dir = 'data'
        self.ensure_directories()
        
    def ensure_directories(self):
        """Ensure necessary directories exist"""
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
    
    def train_models(self, model_type='all', training_data=None):
        """Train AI models with provided data"""
        results = {}
        
        try:
            if model_type in ['all', 'success_prediction']:
                success_result = self._train_success_model(training_data)
                results['success_prediction'] = success_result
            
            if model_type in ['all', 'performance_prediction']:
                performance_result = self._train_performance_model(training_data)
                results['performance_prediction'] = performance_result
            
            if model_type in ['all', 'risk_assessment']:
                risk_result = self._train_risk_model(training_data)
                results['risk_assessment'] = risk_result
            
            if model_type in ['all', 'recommendation']:
                recommendation_result = self._train_recommendation_model(training_data)
                results['recommendation'] = recommendation_result
            
            return {
                'status': 'success',
                'trained_models': list(results.keys()),
                'results': results,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _train_success_model(self, training_data):
        """Train success prediction model"""
        try:
            # Generate sample data if no training data provided
            if not training_data:
                training_data = self._generate_sample_success_data()
            
            # Prepare features and target
            X, y = self._prepare_success_data(training_data)
            
            if len(X) == 0:
                return {'status': 'error', 'message': 'No valid training data'}
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X, y, cv=5)
            
            # Save model
            model_path = os.path.join(self.models_dir, 'success_model.pkl')
            joblib.dump(model, model_path)
            
            return {
                'status': 'success',
                'accuracy': accuracy,
                'cv_score_mean': cv_scores.mean(),
                'cv_score_std': cv_scores.std(),
                'feature_importance': dict(zip(
                    ['gpa', 'experience', 'skills_match', 'application_quality', 'competition'],
                    model.feature_importances_
                )),
                'model_path': model_path
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def _train_performance_model(self, training_data):
        """Train performance prediction model"""
        try:
            # Generate sample data if no training data provided
            if not training_data:
                training_data = self._generate_sample_performance_data()
            
            # Prepare features and target
            X, y = self._prepare_performance_data(training_data)
            
            if len(X) == 0:
                return {'status': 'error', 'message': 'No valid training data'}
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            
            # Save model
            model_path = os.path.join(self.models_dir, 'performance_model.pkl')
            joblib.dump(model, model_path)
            
            return {
                'status': 'success',
                'mse': mse,
                'rmse': np.sqrt(mse),
                'model_path': model_path
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def _train_risk_model(self, training_data):
        """Train risk assessment model"""
        try:
            # Generate sample data if no training data provided
            if not training_data:
                training_data = self._generate_sample_risk_data()
            
            # Prepare features and target
            X, y = self._prepare_risk_data(training_data)
            
            if len(X) == 0:
                return {'status': 'error', 'message': 'No valid training data'}
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Save model
            model_path = os.path.join(self.models_dir, 'risk_model.pkl')
            joblib.dump(model, model_path)
            
            return {
                'status': 'success',
                'accuracy': accuracy,
                'model_path': model_path
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def _train_recommendation_model(self, training_data):
        """Train recommendation model"""
        try:
            # For recommendations, we'll use a simpler approach
            # In a real implementation, this would use collaborative filtering or content-based filtering
            
            # Generate sample similarity matrices
            similarity_data = self._generate_similarity_matrices(training_data)
            
            # Save similarity data
            similarity_path = os.path.join(self.models_dir, 'recommendation_data.pkl')
            joblib.dump(similarity_data, similarity_path)
            
            return {
                'status': 'success',
                'similarity_matrices_created': True,
                'data_path': similarity_path
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def _generate_sample_success_data(self):
        """Generate sample data for success prediction"""
        np.random.seed(42)
        n_samples = 1000
        
        data = {
            'gpa': np.random.normal(3.2, 0.5, n_samples),
            'experience_years': np.random.exponential(1.5, n_samples),
            'skills_match': np.random.beta(2, 2, n_samples),
            'application_quality': np.random.normal(0.7, 0.2, n_samples),
            'competition_level': np.random.randint(1, 100, n_samples),
            'success': np.random.randint(0, 2, n_samples)
        }
        
        # Make success correlated with features
        success_prob = (
            0.3 * (data['gpa'] / 4.0) +
            0.2 * np.minimum(1, data['experience_years'] / 3) +
            0.3 * data['skills_match'] +
            0.1 * data['application_quality'] +
            0.1 * (1 - data['competition_level'] / 100)
        )
        
        data['success'] = (success_prob + np.random.normal(0, 0.1, n_samples) > 0.5).astype(int)
        
        return pd.DataFrame(data)
    
    def _generate_sample_performance_data(self):
        """Generate sample data for performance prediction"""
        np.random.seed(42)
        n_samples = 500
        
        data = {
            'previous_scores': np.random.normal(7.5, 1.5, n_samples),
            'skill_improvement': np.random.beta(3, 2, n_samples),
            'engagement_level': np.random.beta(2, 1.5, n_samples),
            'mentor_rating': np.random.normal(8.0, 1.0, n_samples),
            'project_completion': np.random.beta(4, 1, n_samples),
            'future_performance': np.random.normal(7.8, 1.2, n_samples)
        }
        
        # Make future performance correlated with features
        data['future_performance'] = (
            0.4 * data['previous_scores'] +
            0.2 * data['skill_improvement'] * 10 +
            0.15 * data['engagement_level'] * 10 +
            0.15 * data['mentor_rating'] +
            0.1 * data['project_completion'] * 10 +
            np.random.normal(0, 0.5, n_samples)
        )
        
        return pd.DataFrame(data)
    
    def _generate_sample_risk_data(self):
        """Generate sample data for risk assessment"""
        np.random.seed(42)
        n_samples = 800
        
        data = {
            'gpa': np.random.normal(3.2, 0.5, n_samples),
            'academic_standing': np.random.choice([0, 1], n_samples, p=[0.2, 0.8]),
            'experience_gap': np.random.exponential(1, n_samples),
            'skills_match': np.random.beta(2, 2, n_samples),
            'application_completeness': np.random.beta(3, 1, n_samples),
            'competition_ratio': np.random.exponential(2, n_samples),
            'risk_level': np.random.choice([0, 1, 2], n_samples, p=[0.4, 0.4, 0.2])
        }
        
        # Calculate risk level based on features
        risk_score = (
            0.3 * (1 - data['gpa'] / 4.0) +
            0.2 * (1 - data['academic_standing']) +
            0.2 * np.minimum(1, data['experience_gap'] / 2) +
            0.15 * (1 - data['skills_match']) +
            0.1 * (1 - data['application_completeness']) +
            0.05 * np.minimum(1, data['competition_ratio'] / 10)
        )
        
        # Convert to risk levels
        data['risk_level'] = np.digitize(risk_score, [0.3, 0.6])
        
        return pd.DataFrame(data)
    
    def _prepare_success_data(self, data):
        """Prepare data for success prediction model"""
        if isinstance(data, dict):
            data = pd.DataFrame(data)
        
        # Select features
        feature_columns = ['gpa', 'experience_years', 'skills_match', 'application_quality', 'competition_level']
        
        # Ensure all required columns exist
        for col in feature_columns:
            if col not in data.columns:
                data[col] = 0
        
        X = data[feature_columns].fillna(0).values
        y = data.get('success', np.zeros(len(data))).values
        
        return X, y
    
    def _prepare_performance_data(self, data):
        """Prepare data for performance prediction model"""
        if isinstance(data, dict):
            data = pd.DataFrame(data)
        
        # Select features
        feature_columns = ['previous_scores', 'skill_improvement', 'engagement_level', 'mentor_rating', 'project_completion']
        
        # Ensure all required columns exist
        for col in feature_columns:
            if col not in data.columns:
                data[col] = 0
        
        X = data[feature_columns].fillna(0).values
        y = data.get('future_performance', np.zeros(len(data))).values
        
        return X, y
    
    def _prepare_risk_data(self, data):
        """Prepare data for risk assessment model"""
        if isinstance(data, dict):
            data = pd.DataFrame(data)
        
        # Select features
        feature_columns = ['gpa', 'academic_standing', 'experience_gap', 'skills_match', 'application_completeness', 'competition_ratio']
        
        # Ensure all required columns exist
        for col in feature_columns:
            if col not in data.columns:
                data[col] = 0
        
        X = data[feature_columns].fillna(0).values
        y = data.get('risk_level', np.zeros(len(data))).values
        
        return X, y
    
    def _generate_similarity_matrices(self, training_data):
        """Generate similarity matrices for recommendations"""
        # In a real implementation, this would calculate actual similarities
        # For now, return mock similarity data
        
        return {
            'internship_similarity': np.random.rand(100, 100),
            'company_similarity': np.random.rand(50, 50),
            'student_similarity': np.random.rand(200, 200),
            'feature_vectors': {
                'internships': np.random.rand(100, 50),
                'companies': np.random.rand(50, 30),
                'students': np.random.rand(200, 40)
            }
        }
    
    def get_model_status(self):
        """Get status of all trained models"""
        status = {
            'models': {},
            'last_updated': None,
            'total_models': 0
        }
        
        model_files = {
            'success_model': 'Success Prediction Model',
            'performance_model': 'Performance Prediction Model',
            'risk_model': 'Risk Assessment Model',
            'recommendation_data': 'Recommendation System'
        }
        
        for filename, display_name in model_files.items():
            model_path = os.path.join(self.models_dir, f'{filename}.pkl')
            
            if os.path.exists(model_path):
                file_stats = os.stat(model_path)
                status['models'][filename] = {
                    'name': display_name,
                    'status': 'trained',
                    'file_size': file_stats.st_size,
                    'last_modified': datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                    'path': model_path
                }
                status['total_models'] += 1
            else:
                status['models'][filename] = {
                    'name': display_name,
                    'status': 'not_trained',
                    'path': model_path
                }
        
        return status
    
    def load_model(self, model_name):
        """Load a trained model"""
        model_path = os.path.join(self.models_dir, f'{model_name}.pkl')
        
        if os.path.exists(model_path):
            return joblib.load(model_path)
        else:
            return None
    
    def update_model(self, model_name, new_data):
        """Update an existing model with new data"""
        try:
            # Load existing model if it exists
            existing_model = self.load_model(model_name)
            
            # Prepare new data
            if model_name == 'success_model':
                X, y = self._prepare_success_data(new_data)
            elif model_name == 'performance_model':
                X, y = self._prepare_performance_data(new_data)
            elif model_name == 'risk_model':
                X, y = self._prepare_risk_data(new_data)
            else:
                return {'status': 'error', 'message': 'Unknown model type'}
            
            if len(X) == 0:
                return {'status': 'error', 'message': 'No valid training data'}
            
            # Retrain model with combined data
            if model_name in ['success_model', 'risk_model']:
                model = RandomForestClassifier(n_estimators=100, random_state=42)
            else:
                model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            
            model.fit(X, y)
            
            # Save updated model
            model_path = os.path.join(self.models_dir, f'{model_name}.pkl')
            joblib.dump(model, model_path)
            
            return {
                'status': 'success',
                'message': f'Model {model_name} updated successfully',
                'samples_trained': len(X),
                'model_path': model_path
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def evaluate_model(self, model_name, test_data):
        """Evaluate a trained model with test data"""
        try:
            model = self.load_model(model_name)
            
            if model is None:
                return {'status': 'error', 'message': 'Model not found'}
            
            # Prepare test data
            if model_name == 'success_model':
                X, y = self._prepare_success_data(test_data)
            elif model_name == 'performance_model':
                X, y = self._prepare_performance_data(test_data)
            elif model_name == 'risk_model':
                X, y = self._prepare_risk_data(test_data)
            else:
                return {'status': 'error', 'message': 'Unknown model type'}
            
            if len(X) == 0:
                return {'status': 'error', 'message': 'No valid test data'}
            
            # Make predictions
            y_pred = model.predict(X)
            
            # Calculate metrics
            if model_name in ['success_model', 'risk_model']:
                accuracy = accuracy_score(y, y_pred)
                report = classification_report(y, y_pred, output_dict=True)
                
                return {
                    'status': 'success',
                    'accuracy': accuracy,
                    'classification_report': report,
                    'samples_tested': len(X)
                }
            else:
                mse = mean_squared_error(y, y_pred)
                rmse = np.sqrt(mse)
                
                return {
                    'status': 'success',
                    'mse': mse,
                    'rmse': rmse,
                    'samples_tested': len(X)
                }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
