import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from django.conf import settings

_mongo_client: Optional[MongoClient] = None
_db: Optional[Database] = None

def get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is None:
        uri = getattr(settings, 'MONGODB_URI', '') or os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        _mongo_client = MongoClient(
            uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            maxPoolSize=50
        )
    return _mongo_client

def get_db() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        db_name = getattr(settings, 'MONGODB_DATABASE', '') or os.getenv('MONGODB_DATABASE', 'ideaproof_ai')
        _db = client[db_name]
    return _db

# Collection accessors
def get_collection(name: str) -> Collection:
    return get_db()[name]

def users_col() -> Collection:
    return get_collection('users')

def startup_ideas_col() -> Collection:
    return get_collection('startup_ideas')

def market_research_col() -> Collection:
    return get_collection('market_research')

def research_sources_col() -> Collection:
    return get_collection('research_sources')

def surveys_col() -> Collection:
    return get_collection('surveys')

def survey_responses_col() -> Collection:
    return get_collection('survey_responses')

def competitors_col() -> Collection:
    return get_collection('competitors')

def financial_assumptions_col() -> Collection:
    return get_collection('financial_assumptions')

def sharemarket_analysis_col() -> Collection:
    return get_collection('sharemarket_analysis')

def validation_runs_col() -> Collection:
    return get_collection('validation_runs')

def validation_scores_col() -> Collection:
    return get_collection('validation_scores')

def evidence_records_col() -> Collection:
    return get_collection('evidence_records')

def risks_col() -> Collection:
    return get_collection('risks')

def roadmap_tasks_col() -> Collection:
    return get_collection('roadmap_tasks')

def reports_col() -> Collection:
    return get_collection('reports')

def teams_col() -> Collection:
    return get_collection('teams')

def team_memberships_col() -> Collection:
    return get_collection('team_memberships')

def activity_logs_col() -> Collection:
    return get_collection('activity_logs')

def init_db_indexes():
    """Initializes collections indexes for optimal query performance and uniqueness"""
    try:
        users_col().create_index([("email", ASCENDING)], unique=True)
        startup_ideas_col().create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        surveys_col().create_index([("idea_id", ASCENDING)])
        surveys_col().create_index([("token", ASCENDING)], unique=True)
        survey_responses_col().create_index([("survey_id", ASCENDING), ("submitted_at", DESCENDING)])
        competitors_col().create_index([("idea_id", ASCENDING)])
        financial_assumptions_col().create_index([("idea_id", ASCENDING)])
        validation_scores_col().create_index([("idea_id", ASCENDING), ("created_at", DESCENDING)])
        evidence_records_col().create_index([("idea_id", ASCENDING)])
        risks_col().create_index([("idea_id", ASCENDING)])
        roadmap_tasks_col().create_index([("idea_id", ASCENDING)])
        reports_col().create_index([("idea_id", ASCENDING), ("created_at", DESCENDING)])
        activity_logs_col().create_index([("idea_id", ASCENDING), ("created_at", DESCENDING)])
        activity_logs_col().create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        return True
    except Exception as e:
        print(f"Warning initializing DB indexes: {e}")
        return False

def to_object_id(id_str: Any) -> Optional[ObjectId]:
    if isinstance(id_str, ObjectId):
        return id_str
    if not id_str or not isinstance(id_str, str):
        return None
    try:
        return ObjectId(id_str)
    except Exception:
        return None

def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Converts MongoDB BSON types to JSON serializable Python types."""
    if doc is None:
        return None
    res = {}
    for k, v in doc.items():
        if k == '_id':
            res['id'] = str(v)
        elif isinstance(v, ObjectId):
            res[k] = str(v)
        elif isinstance(v, datetime):
            res[k] = v.isoformat()
        elif isinstance(v, dict):
            res[k] = serialize_doc(v)
        elif isinstance(v, list):
            res[k] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in v
            ]
        else:
            res[k] = v
    return res

def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_doc(d) for d in docs if d is not None]

def log_activity(user_id: str, action: str, details: str, idea_id: Optional[str] = None):
    try:
        activity_logs_col().insert_one({
            "user_id": str(user_id),
            "idea_id": str(idea_id) if idea_id else None,
            "action": action,
            "details": details,
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        print(f"Failed to log activity: {e}")
