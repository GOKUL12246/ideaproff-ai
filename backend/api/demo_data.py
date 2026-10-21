import uuid
from datetime import datetime, timedelta
from typing import Any, Dict
from bson import ObjectId
from .db import (
    startup_ideas_col,
    surveys_col,
    survey_responses_col,
    competitors_col,
    financial_assumptions_col,
    risks_col,
    roadmap_tasks_col,
    market_research_col,
    sharemarket_analysis_col,
    reports_col,
    validation_scores_col,
    log_activity
)
from .ai_agents import AIOrchestrator, SharemarketAnalysisAgent

def seed_demo_startup_idea(user_id: str) -> Dict[str, Any]:
    """
    Populates an end-to-end validated demo startup idea ('CampusCart')
    with surveys, real responses, competitors, financials, risks, and roadmap.
    """
    now = datetime.utcnow()
    
    # 1. Startup Idea
    idea_doc = {
        "user_id": str(user_id),
        "title": "CampusCart — Hyperlocal Campus Marketplace & Micro-Rentals",
        "industry": "E-Commerce & Student Services",
        "problem_statement": (
            "University students spend an average of $650 per semester on dorm essentials, textbooks, and lab gear, "
            "but struggle to resell them at semester end. Existing generalist platforms like Facebook Marketplace lack "
            "campus identity verification, leading to safety fears, high rates of no-shows, and awkward off-campus handoffs."
        ),
        "proposed_solution": (
            "A verified .edu-only peer-to-peer campus marketplace and micro-rental platform featuring dorm drop-off points, "
            "instant peer escrow payments, and end-of-semester guaranteed buyback matching."
        ),
        "target_customers": "Undergraduate and graduate university students living on or near campus (ages 18-24)",
        "target_geography": "United States Collegiate Campuses (Pilot: 3 Midwest Universities)",
        "current_alternatives": "Facebook Marketplace, Campus Free & For Sale group chats, Craigslist, flyer bulletin boards",
        "unique_value_proposition": "The only verified student marketplace with 10-minute dorm-to-dorm handoffs, zero stranger danger, and automated peer escrow.",
        "available_budget": "$7,500 bootstrapping capital and student entrepreneurship micro-grant",
        "team_skills": "2 Student Co-Founders: Full-Stack React/Node developer & Campus Marketing Ambassador lead",
        "business_model": "10% peer transaction commission + $1.99 priority campus buyer protection",
        "development_stage": "Validation & Prototype",
        "is_demo": True,
        "created_at": now - timedelta(days=12),
        "updated_at": now
    }
    
    res = startup_ideas_col().insert_one(idea_doc)
    idea_id = str(res.inserted_id)

    # 2. Market Sizing Data
    market_doc = {
        "idea_id": idea_id,
        "tam_usd": 4200000000.0,  # $4.2B student spending on campus goods
        "sam_usd": 850000000.0,   # $850M addressable across 4-year residential universities
        "som_usd": 28000000.0,    # $28M realistic 3-year target capturing 25 universities
        "growth_cagr": 11.4,
        "trends": [
            "Collegiate students prioritize peer circular economy and sustainable reuse",
            "Demand for verified institutional identity (.edu single sign-on)",
            "Preference for mobile payment wallets (Venmo, Apple Pay, CashApp)"
        ],
        "sources": [
            {"name": "National Center for Education Statistics (NCES)", "data": "20M collegiate students in USA"},
            {"name": "Student Public Interest Research Groups", "data": "Students spend $600-$1,200 annually on course materials & furnishings"}
        ],
        "created_at": now - timedelta(days=10)
    }
    market_research_col().insert_one(market_doc)

    # 3. Customer Survey
    survey_token = f"demo-campuscart-{uuid.uuid4().hex[:6]}"
    survey_doc = {
        "idea_id": idea_id,
        "user_id": str(user_id),
        "title": "Campus Marketplace & Resale Habits Survey",
        "description": "Help us evaluate the biggest frustrations with buying and reselling dorm items and textbooks on campus.",
        "token": survey_token,
        "status": "published",
        "questions": [
            {
                "id": "q1",
                "question_text": "How often do you buy or resell used items (books, furniture, electronics) on campus?",
                "question_type": "single_choice",
                "is_required": True,
                "options": ["Every semester", "Once a year", "Rarely", "Never"]
            },
            {
                "id": "q2",
                "question_text": "What is your biggest frustration with current buy/sell groups (e.g. Facebook Groups, GroupMe)?",
                "question_type": "multiple_choice",
                "is_required": True,
                "options": [
                    "Unreliable buyers who ghost or don't show up",
                    "Safety concerns meeting unknown people",
                    "Difficulty searching and filtering items",
                    "Cash payment awkwardness"
                ]
            },
            {
                "id": "q3",
                "question_text": "How important is having a verified .edu student-only community for safety?",
                "question_type": "rating_scale",
                "is_required": True,
                "scale_min": 1,
                "scale_max": 5
            },
            {
                "id": "q4",
                "question_text": "Would you pay a small $1.50 - $2.50 fee for instant escrow and safe campus pickup?",
                "question_type": "single_choice",
                "is_required": True,
                "options": ["Definitely yes", "Probably yes", "Only for high-value items", "No, prefer free cash handoffs"]
            },
            {
                "id": "q5",
                "question_text": "What specific item did you struggle to sell or buy on campus this past year?",
                "question_type": "long_answer",
                "is_required": False
            }
        ],
        "created_at": now - timedelta(days=9)
    }
    s_res = surveys_col().insert_one(survey_doc)
    survey_id = str(s_res.inserted_id)

    # 4. Realistic Survey Responses (10 responses)
    sample_answers = [
        {"q1": "Every semester", "q2": ["Unreliable buyers who ghost or don't show up", "Safety concerns meeting unknown people"], "q3": 5, "q4": "Definitely yes", "q5": "My mini-fridge and microwave during freshman dorm moveout. Had to dump the fridge."},
        {"q1": "Every semester", "q2": ["Unreliable buyers who ghost or don't show up", "Difficulty searching and filtering items"], "q3": 5, "q4": "Definitely yes", "q5": "Organic chemistry textbook. Bookstore offered $12 for a $240 book."},
        {"q1": "Once a year", "q2": ["Safety concerns meeting unknown people", "Cash payment awkwardness"], "q3": 4, "q4": "Probably yes", "q5": "A desk chair. No one wanted to carry it across campus."},
        {"q1": "Every semester", "q2": ["Unreliable buyers who ghost or don't show up"], "q3": 5, "q4": "Definitely yes", "q5": "TI-84 calculator. Found a buyer after 2 weeks of spamming 4 GroupMe chats."},
        {"q1": "Once a year", "q2": ["Difficulty searching and filtering items"], "q3": 4, "q4": "Only for high-value items", "q5": "Dorm floor rug and floor lamp."},
        {"q1": "Every semester", "q2": ["Safety concerns meeting unknown people", "Unreliable buyers who ghost or don't show up"], "q3": 5, "q4": "Definitely yes", "q5": "Lab coat and goggles. Would rather rent than buy new."},
        {"q1": "Once a year", "q2": ["Cash payment awkwardness"], "q3": 3, "q4": "Probably yes", "q5": "Guitar amp. Took forever to find an on-campus buyer."},
        {"q1": "Every semester", "q2": ["Unreliable buyers who ghost or don't show up", "Difficulty searching and filtering items"], "q3": 5, "q4": "Definitely yes", "q5": "Winter jacket and snow boots before break."},
        {"q1": "Rarely", "q2": ["Safety concerns meeting unknown people"], "q3": 4, "q4": "Only for high-value items", "q5": "Computer monitor."},
        {"q1": "Every semester", "q2": ["Unreliable buyers who ghost or don't show up", "Safety concerns meeting unknown people"], "q3": 5, "q4": "Definitely yes", "q5": "Psychology and biology textbooks."}
    ]
    
    for i, ans in enumerate(sample_answers):
        survey_responses_col().insert_one({
            "survey_id": survey_id,
            "token": survey_token,
            "answers": ans,
            "ip_address": f"192.168.1.{10+i}",
            "submitted_at": now - timedelta(days=7 - (i // 2))
        })

    # 5. Competitors
    competitors_list = [
        {
            "idea_id": idea_id,
            "name": "Facebook Marketplace",
            "website": "https://facebook.com/marketplace",
            "product_description": "General consumer peer-to-peer classifieds.",
            "features": "Broad local reach, Messenger integration, free listings",
            "pricing": "Free for local peer transactions",
            "target_customers": "General public of all ages",
            "strengths": "Massive existing user base and zero friction to list",
            "weaknesses": "Zero student verification, high spam/scam volume, rampant no-shows, safety concerns",
            "last_verified_date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
            "source_references": "Competitor teardown and user interviews",
            "created_at": now - timedelta(days=8)
        },
        {
            "idea_id": idea_id,
            "name": "Campus GroupMe & WhatsApp Chats",
            "website": "https://groupme.com",
            "product_description": "Informal student group messaging channels for buy/sell.",
            "features": "Real student members, push notifications",
            "pricing": "Free",
            "target_customers": "Students in specific residence halls or clubs",
            "strengths": "High trust among mutual student peers",
            "weaknesses": "Flooded chat history, impossible to search past messages, no payment security, no inventory management",
            "last_verified_date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
            "source_references": "Field observation on 3 campuses",
            "created_at": now - timedelta(days=8)
        },
        {
            "idea_id": idea_id,
            "name": "Chegg & University Bookstore Buyback",
            "website": "https://chegg.com",
            "product_description": "Corporate textbook rental and buyback.",
            "features": "Guaranteed buyback pricing, mail-in shipping labels",
            "pricing": "High markup (offers 10-20% of original price to buy back)",
            "target_customers": "College students needing textbooks",
            "strengths": "Established national brand, predictable process",
            "weaknesses": "Paucity of payout (predatory depreciation), limited only to textbooks, excludes dorm essentials",
            "last_verified_date": (now - timedelta(days=4)).strftime("%Y-%m-%d"),
            "source_references": "Bookstore pricing comparison sheet",
            "created_at": now - timedelta(days=8)
        }
    ]
    for c in competitors_list:
        competitors_col().insert_one(c)

    # 6. Financial Assumptions
    fin_doc = {
        "idea_id": idea_id,
        "initial_investment": 4500.0,
        "development_costs": 2000.0,
        "monthly_opex": 350.0,
        "product_price": 12.0,  # Average 10% commission on $120 item basket
        "expected_customers": 180,  # Monthly completed orders
        "variable_costs": 1.50,  # Payment gateway + SMS notification cost
        "marketing_expenses": 400.0, # Campus posters, pizza flyers, club sponsorships
        "staffing_costs": 800.0, # 2 part-time student campus managers ($400 each)
        "monthly_growth": 18.0, # 18% month-over-month viral word-of-mouth growth
        "created_at": now - timedelta(days=6)
    }
    financial_assumptions_col().insert_one(fin_doc)

    # 7. Risks
    risks_list = [
        {
            "idea_id": idea_id,
            "category": "Market demand",
            "description": "Seasonal cliff during summer breaks when students depart campus.",
            "likelihood": "High",
            "impact": "High",
            "severity": "High",
            "supporting_evidence": "Collegiate calendar has 3 months of low on-campus occupancy.",
            "mitigation_plan": "Introduce summer storage matching and sublease gear coordination to maintain activity.",
            "assigned_owner": "Co-Founder",
            "status": "Active",
            "created_at": now - timedelta(days=5)
        },
        {
            "idea_id": idea_id,
            "category": "Customer adoption",
            "description": "Chicken-and-egg marketplace problem (insufficient buyer liquidity prevents seller retention).",
            "likelihood": "High",
            "impact": "High",
            "severity": "Critical",
            "supporting_evidence": "Standard peer two-sided marketplace hurdle.",
            "mitigation_plan": "Seed initial supply by partnering with graduating seniors and offering guaranteed $10 gift cards for listing 3 items.",
            "assigned_owner": "Campus Marketing Lead",
            "status": "Active",
            "created_at": now - timedelta(days=5)
        },
        {
            "idea_id": idea_id,
            "category": "Data privacy",
            "description": "FERPA and student university credential verification compliance.",
            "likelihood": "Low",
            "impact": "High",
            "severity": "Medium",
            "supporting_evidence": "Institutions restrict unauthorized use of official university logos and SSO.",
            "mitigation_plan": "Authenticate via standard .edu email OTP verification rather than direct university SSO integration.",
            "assigned_owner": "Technical Co-Founder",
            "status": "Active",
            "created_at": now - timedelta(days=5)
        }
    ]
    for r in risks_list:
        risks_col().insert_one(r)

    # 8. Actionable Roadmap Tasks
    tasks_list = [
        {
            "idea_id": idea_id,
            "timeframe": "Next 7 days",
            "title": "Onboard 5 Student Club Presidents as Campus Ambassadors",
            "description": "Present the CampusCart beta program to campus Greek life, engineering society, and international student clubs.",
            "priority": "High",
            "deadline_days": 7,
            "assigned_user": "Marketing Lead",
            "status": "In Progress",
            "expected_outcome": "5 committed clubs promoting the beta launch to 600+ student members.",
            "created_at": now - timedelta(days=4)
        },
        {
            "idea_id": idea_id,
            "timeframe": "Next 7 days",
            "title": "Finalize Stripe Escrow & Payout Integration",
            "description": "Implement Stripe Connect Express for instant student bank and debit card disbursements.",
            "priority": "High",
            "deadline_days": 7,
            "assigned_user": "Tech Co-Founder",
            "status": "In Progress",
            "expected_outcome": "Seamless 2-click payout flow tested in sandbox.",
            "created_at": now - timedelta(days=4)
        },
        {
            "idea_id": idea_id,
            "timeframe": "Next 14 days",
            "title": "Establish 3 Dorm Lobby Drop-off & Verification Points",
            "description": "Coordinate with student housing coordinators for designated 24/7 video-monitored lobby lockers.",
            "priority": "Medium",
            "deadline_days": 14,
            "assigned_user": "Operations Lead",
            "status": "Pending",
            "expected_outcome": "Zero-friction physical safe pickup zones established.",
            "created_at": now - timedelta(days=4)
        },
        {
            "idea_id": idea_id,
            "timeframe": "Next 30 days",
            "title": "Execute 500-User Closed Beta Launch for Midterm Textbook Swaps",
            "description": "Release mobile web MVP to the 500 waitlist students with zero transaction fees for the first week.",
            "priority": "High",
            "deadline_days": 30,
            "assigned_user": "Founding Team",
            "status": "Pending",
            "expected_outcome": "150+ completed transactions and initial NPS calculation.",
            "created_at": now - timedelta(days=4)
        }
    ]
    for t in tasks_list:
        roadmap_tasks_col().insert_one(t)

    # 9. Sharemarket Public Comps Analysis
    sharemarket_output = SharemarketAnalysisAgent.analyze(idea_doc)
    sharemarket_doc = {
        "idea_id": idea_id,
        **sharemarket_output.model_dump(),
        "created_at": now - timedelta(days=2),
        "updated_at": now
    }
    sharemarket_analysis_col().insert_one(sharemarket_doc)

    # 10. Run full validation report and save scores
    all_surveys = list(surveys_col().find({"idea_id": idea_id}))
    all_responses = list(survey_responses_col().find({"survey_id": survey_id}))
    all_comps = list(competitors_col().find({"idea_id": idea_id}))
    
    from .db import serialize_doc, serialize_docs

    val_report = AIOrchestrator.run_full_validation(
        idea=serialize_doc(idea_doc),
        surveys=serialize_docs(all_surveys),
        responses=serialize_docs(all_responses),
        competitors=serialize_docs(all_comps),
        financial_inputs=serialize_doc(fin_doc),
        market_inputs=serialize_doc(market_doc)
    )
    
    validation_scores_col().insert_one({
        "idea_id": idea_id,
        "score_data": val_report['validation_score'],
        "created_at": now
    })

    reports_col().insert_one({
        "idea_id": idea_id,
        "title": f"Validation Report — {idea_doc['title']}",
        "report_data": val_report,
        "created_at": now
    })

    log_activity(user_id, "Seed Demo Data", "Loaded verified demo startup 'CampusCart' with full empirical dataset", idea_id)

    return {
        "idea_id": idea_id,
        "title": idea_doc['title'],
        "survey_token": survey_token,
        "responses_count": len(sample_answers),
        "validation_score": val_report['validation_score']['overall_score'],
        "recommendation_band": val_report['validation_score']['recommendation_band']
    }
