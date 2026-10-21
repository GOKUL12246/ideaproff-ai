import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple
import jwt
import bcrypt
from bson import ObjectId
from rest_framework import authentication, permissions
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .db import users_col, to_object_id

JWT_SECRET = getattr(settings, 'SECRET_KEY', 'default-ideaproof-secret')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_LIFETIME = timedelta(days=1)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_tokens(user_doc: Dict[str, Any]) -> Dict[str, str]:
    now = datetime.utcnow()
    user_id = str(user_doc['_id'])
    
    access_payload = {
        'user_id': user_id,
        'email': user_doc.get('email'),
        'role': user_doc.get('role', 'Startup Founder'),
        'exp': now + ACCESS_TOKEN_LIFETIME,
        'iat': now,
        'type': 'access'
    }
    
    refresh_payload = {
        'user_id': user_id,
        'exp': now + REFRESH_TOKEN_LIFETIME,
        'iat': now,
        'type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }

class MongoUser:
    """Wrapper class providing standard Django authentication user interface for MongoDB user doc."""
    def __init__(self, doc: Dict[str, Any]):
        self._doc = doc
        self.id = str(doc.get('_id', ''))
        self.email = doc.get('email', '')
        self.name = doc.get('name', '')
        self.role = doc.get('role', 'Startup Founder')
        self.created_at = doc.get('created_at', None)

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    def __str__(self):
        return f"{self.email} ({self.role})"


class MongoJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request) -> Optional[Tuple[MongoUser, str]]:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        
        token = parts[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        
        if payload.get('type') != 'access':
            raise AuthenticationFailed('Token type is not access')
        
        user_id = payload.get('user_id')
        obj_id = to_object_id(user_id)
        if not obj_id:
            raise AuthenticationFailed('User ID in token is invalid')
        
        user_doc = users_col().find_one({'_id': obj_id})
        if not user_doc:
            raise AuthenticationFailed('User not found')
        
        return (MongoUser(user_doc), token)


class IsAuthenticatedMongo(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))
