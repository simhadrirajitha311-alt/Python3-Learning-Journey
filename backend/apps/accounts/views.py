from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
import os
import pymongo
from bson import ObjectId
import bcrypt

client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
db = client[os.getenv('MONGODB_DATABASE', 'careerbridge')]

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        role = request.data.get('role', 'student')
        full_name = request.data.get('fullName', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = db.users.find_one({'email': email})
        if existing:
            return Response({'error': 'User with this email already exists.'}, status=status.HTTP_409_CONFLICT)

        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        user_doc = {
            'email': email,
            'passwordHash': hashed,
            'role': role,
            'isVerified': True,
        }
        res = db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)

        # Initialize student profile if role is student
        if role == 'student':
            db.student_profiles.insert_one({
                'userId': user_id,
                'fullName': full_name,
                'email': email,
                'university': 'Computer Science Student',
                'degree': 'B.S. Computer Science',
                'technicalSkills': ['Python', 'Data Structures', 'Git'],
                'programmingLanguages': ['Python', 'TypeScript'],
                'projects': [],
                'careerInterests': ['Software Engineering', 'AI/ML'],
                'preferredCompanies': ['Google', 'Microsoft'],
                'completionPercentage': 45
            })

        user_data = {'id': user_id, 'email': email, 'role': role, 'fullName': full_name}
        return Response({
            'message': 'Registration successful.',
            'user': user_data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        user = db.users.find_one({'email': email})
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['passwordHash'].encode('utf-8')):
            return Response({'error': 'Invalid email or password credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = str(user['_id'])
        profile = db.student_profiles.find_one({'userId': user_id}) or {}

        return Response({
            'access': f'mock-jwt-access-{user_id}',
            'refresh': f'mock-jwt-refresh-{user_id}',
            'user': {
                'id': user_id,
                'email': user['email'],
                'role': user.get('role', 'student'),
                'fullName': profile.get('fullName', user['email'].split('@')[0])
            }
        })

class MeView(APIView):
    def get(self, request):
        user_id = getattr(request.user, 'id', None)
        user = db.users.find_one({'_id': ObjectId(user_id)}) if user_id else None
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'id': str(user['_id']),
            'email': user['email'],
            'role': user.get('role', 'student'),
        })
