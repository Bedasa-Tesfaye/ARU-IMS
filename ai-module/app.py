from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Optional heavy dependencies (pandas/sklearn) may not be available on all machines.
# The chatbot + health endpoint should still run without them.
try:
    from services.recommendation_service import RecommendationService
    from services.risk_detection_service import RiskDetectionService
    from services.analytics_service import AnalyticsService
    from utils.data_processor import DataProcessor
except Exception:
    RecommendationService = None
    RiskDetectionService = None
    AnalyticsService = None
    DataProcessor = None

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize services
recommendation_service = RecommendationService() if RecommendationService else None
risk_service = RiskDetectionService() if RiskDetectionService else None
analytics_service = AnalyticsService() if AnalyticsService else None
data_processor = DataProcessor() if DataProcessor else None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ARU AI Module',
        'version': '1.0.0'
    })

@app.route('/api/recommendations/internships', methods=['POST'])
def get_internship_recommendations():
    """Get internship recommendations for a student"""
    try:
        if not recommendation_service:
            return jsonify({'error': 'Recommendation service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        student_id = data.get('student_id')
        student_profile = data.get('profile', {})
        
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        recommendations = recommendation_service.recommend_internships(
            student_id, student_profile
        )
        
        return jsonify({
            'recommendations': recommendations,
            'student_id': student_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/companies', methods=['POST'])
def get_company_recommendations():
    """Get company recommendations for students"""
    try:
        if not recommendation_service:
            return jsonify({'error': 'Recommendation service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        student_id = data.get('student_id')
        student_profile = data.get('profile', {})
        
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        recommendations = recommendation_service.recommend_companies(
            student_id, student_profile
        )
        
        return jsonify({
            'recommendations': recommendations,
            'student_id': student_id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/risk/analyze', methods=['POST'])
def analyze_risk():
    """Analyze risk factors for internship applications"""
    try:
        if not risk_service:
            return jsonify({'error': 'Risk service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        application_data = data.get('application', {})
        student_profile = data.get('profile', {})
        
        if not application_data:
            return jsonify({'error': 'Application data is required'}), 400
        
        risk_analysis = risk_service.analyze_application_risk(
            application_data, student_profile
        )
        
        return jsonify(risk_analysis)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/risk/alerts', methods=['POST'])
def generate_risk_alerts():
    """Generate risk alerts for ongoing internships"""
    try:
        if not risk_service:
            return jsonify({'error': 'Risk service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        internship_data = data.get('internship', {})
        student_progress = data.get('progress', {})
        
        if not internship_data:
            return jsonify({'error': 'Internship data is required'}), 400
        
        alerts = risk_service.generate_risk_alerts(
            internship_data, student_progress
        )
        
        return jsonify({'alerts': alerts})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/student-performance', methods=['POST'])
def analyze_student_performance():
    """Analyze student performance trends"""
    try:
        if not analytics_service:
            return jsonify({'error': 'Analytics service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        student_id = data.get('student_id')
        performance_data = data.get('performance_data', [])
        
        if not student_id or not performance_data:
            return jsonify({'error': 'Student ID and performance data are required'}), 400
        
        analysis = analytics_service.analyze_student_performance(
            student_id, performance_data
        )
        
        return jsonify(analysis)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/internship-success', methods=['POST'])
def predict_internship_success():
    """Predict success probability for internship applications"""
    try:
        if not analytics_service:
            return jsonify({'error': 'Analytics service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        application_data = data.get('application', {})
        student_profile = data.get('profile', {})
        
        if not application_data:
            return jsonify({'error': 'Application data is required'}), 400
        
        prediction = analytics_service.predict_internship_success(
            application_data, student_profile
        )
        
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/company-insights', methods=['POST'])
def get_company_insights():
    """Get insights about company performance and patterns"""
    try:
        if not analytics_service:
            return jsonify({'error': 'Analytics service unavailable (missing dependencies)'}), 503
        data = request.get_json()
        company_id = data.get('company_id')
        
        if not company_id:
            return jsonify({'error': 'Company ID is required'}), 400
        
        insights = analytics_service.get_company_insights(company_id)
        
        return jsonify(insights)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/train', methods=['POST'])
def train_models():
    """Train or retrain AI models with new data"""
    try:
        if not data_processor:
            return jsonify({'error': 'Model trainer unavailable (missing dependencies)'}), 503
        data = request.get_json()
        model_type = data.get('model_type', 'all')
        training_data = data.get('data', {})
        
        if not training_data:
            return jsonify({'error': 'Training data is required'}), 400
        
        results = data_processor.train_models(model_type, training_data)
        
        return jsonify({
            'message': 'Models trained successfully',
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/status', methods=['GET'])
def get_model_status():
    """Get status of AI models"""
    try:
        if not data_processor:
            return jsonify({'error': 'Model status unavailable (missing dependencies)'}), 503
        status = data_processor.get_model_status()
        return jsonify(status)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Simple FAQ-style chatbot endpoint (no external LLM required)."""
    try:
        data = request.get_json() or {}
        question = (data.get('question') or '').strip()
        role = (data.get('role') or '').strip().lower()
        context = (data.get('context') or '').strip().lower()

        if not question:
            return jsonify({'error': 'Question is required'}), 400

        q = question.lower()

        def answer_for(q_text: str) -> str:
            # Authentication / access
            if any(k in q_text for k in ['login', 'sign in', 'password', 'forgot']):
                return (
                    "To log in, use your email and password on the Login page. "
                    "If you forgot your password, contact the Super Admin to reset it."
                )

            # Navigation / dashboards
            if any(k in q_text for k in ['dashboard', 'where', 'navigate', 'menu', 'sidebar']):
                return (
                    "Use the left sidebar in the dashboard to open Internships, Applications, Reports, "
                    "Evaluations, and Profile. The available items depend on your role."
                )

            # Internships
            if any(k in q_text for k in ['internship', 'internships', 'apply']):
                return (
                    "To apply for an internship: go to Dashboard → Internships, open an internship card, "
                    "and click Apply (students only). You can track your application status in Applications."
                )

            # Applications
            if any(k in q_text for k in ['application', 'applications', 'approve', 'reject', 'withdraw']):
                if role == 'coordinator':
                    return (
                        "Coordinators can approve or reject pending applications from Dashboard → Applications. "
                        "Use the filters to show Pending first."
                    )
                if role == 'student':
                    return (
                        "Students can view all applications in Dashboard → Applications. "
                        "Pending applications can be withdrawn from the Actions column."
                    )
                return "Applications are managed in Dashboard → Applications. Use filters to find pending or approved items."

            # Reports
            if any(k in q_text for k in ['report', 'reports', 'submit report', 'weekly', 'monthly', 'final']):
                if role == 'student':
                    return (
                        "Students can submit reports in Dashboard → Reports. Click 'Submit New Report', choose type "
                        "(weekly/monthly/final), fill content, and submit."
                    )
                if role == 'examiner':
                    return (
                        "Examiners review submitted reports in Dashboard → Reports. Open a report and use Review to "
                        "approve/reject and add feedback."
                    )
                return "Reports are available in Dashboard → Reports. Students submit; examiners review; coordinators monitor."

            # Evaluations
            if any(k in q_text for k in ['evaluation', 'evaluations', 'midterm', 'final evaluation']):
                if role == 'examiner':
                    return "Examiners create evaluations in Dashboard → Evaluations. Use 'Create Evaluation' and submit ratings and feedback."
                return "Evaluations can be viewed in Dashboard → Evaluations. Examiners create them; students can view results."

            # Admin user management
            if any(k in q_text for k in ['admin', 'user', 'users', 'activate', 'deactivate', 'register user', 'create user', 'delete user']):
                return (
                    "Admins manage users in Admin Dashboard → Users. You can create/register new users, "
                    "activate (approve) pending accounts, deactivate users, and delete a user profile when needed."
                )

            return (
                "I can help with internships, applications, reports, evaluations, and account usage. "
                "Please ask a specific question (e.g., 'How do I submit a weekly report?')."
            )

        return jsonify({
            'answer': answer_for(q),
            'meta': {'role': role, 'context': context}
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print(f"Starting ARU AI Module on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
