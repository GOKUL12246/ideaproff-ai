import os
import logging
from datetime import datetime
from typing import Any, Dict, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

def dispatch_startup_stability_alerts(
    idea_title: str,
    overall_score: float,
    recommendation_band: str,
    confidence_level: str,
    target_customers: str = "",
    idea_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatches automated startup stability notifications via Twilio SMS to the founder's 
    and caretaker's mobile numbers (+916369067138) and formats a Gmail alert digest.
    
    Triggered when an idea reaches STABLE / Proceed to MVP status (Score >= 75/80).
    """
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '') or os.getenv('TWILIO_ACCOUNT_SID', '')
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '') or os.getenv('TWILIO_AUTH_TOKEN', '')
    api_key_sid = getattr(settings, 'TWILIO_API_KEY_SID', '') or os.getenv('TWILIO_API_KEY_SID', '')
    api_key_secret = getattr(settings, 'TWILIO_API_KEY_SECRET', '') or os.getenv('TWILIO_API_KEY_SECRET', '')
    from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', '') or os.getenv('TWILIO_PHONE_NUMBER', '')
    receiver_number = getattr(settings, 'NOTIFICATION_RECEIVER_PHONE', '') or os.getenv('NOTIFICATION_RECEIVER_PHONE', '+916369067138')
    caretaker_number = getattr(settings, 'CARETAKER_PHONE', '') or os.getenv('CARETAKER_PHONE', '+916369067138')

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    sms_body = (
        f"🚀 [IdeaProof AI] STABILITY ALERT!\n"
        f"Startup Idea: '{idea_title}'\n"
        f"Score: {overall_score:.1f}/100 ({confidence_level} Confidence)\n"
        f"Status: {recommendation_band}\n"
        f"Empirical validation confirms market readiness! Next: Proceed to MVP.\n"
        f"Timestamp: {timestamp}"
    )

    gmail_digest = {
        "subject": f"🚀 [IdeaProof AI] Startup Stable for Launch: '{idea_title}' (Score: {overall_score:.1f}/100)",
        "recipient": "Founder & Caretaker Team",
        "sender": "IdeaProof AI Notifications <notifications@ideaproof.ai>",
        "headline": "Empirical Startup Validation: Status Stable",
        "body_html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0B132B 0%, #1C2541 100%); color: #FFFFFF; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">IdeaProof AI — Startup Stability Confirmed</h1>
                <p style="margin: 6px 0 0; color: #38BDF8; font-size: 14px;">Automated Decision Engine Alert</p>
            </div>
            <div style="padding: 24px; background: #FFFFFF; color: #1E293B;">
                <p style="font-size: 16px; line-height: 1.5;">Great news! Your startup idea <strong>'{idea_title}'</strong> has satisfied the quantitative validation criteria and is officially deemed <strong>STABLE FOR STARTUP</strong>.</p>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 6px 0; color: #64748B;">Overall Score:</td><td style="padding: 6px 0; font-weight: bold; color: #059669; font-size: 18px;">{overall_score:.1f} / 100</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748B;">Decision Band:</td><td style="padding: 6px 0; font-weight: bold;">{recommendation_band}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748B;">Confidence Level:</td><td style="padding: 6px 0; font-weight: bold;">{confidence_level}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748B;">Target Segment:</td><td style="padding: 6px 0;">{target_customers or 'Primary Customer Cohort'}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748B;">Timestamp:</td><td style="padding: 6px 0;">{timestamp}</td></tr>
                    </table>
                </div>
                <h3 style="color: #0F172A; margin-top: 20px;">Key Strategic Next Steps:</h3>
                <ul style="color: #334155; line-height: 1.6;">
                    <li>Freeze customer problem definition and initiate MVP sprint.</li>
                    <li>Conduct founder-led pre-sales with target cohort respondents.</li>
                    <li>Download your official ReportLab PDF validation dossier from the platform.</li>
                </ul>
            </div>
            <div style="background: #F1F5F9; padding: 16px; text-align: center; color: #64748B; font-size: 12px;">
                IdeaProof AI Autonomous Agent Platform &bull; Mobile alerts to {receiver_number}
            </div>
        </div>
        """,
        "body_text": sms_body
    }

    twilio_results = []
    # Recipients to notify via Twilio
    recipients = list(dict.fromkeys([receiver_number, caretaker_number])) # remove duplicates

    for recipient in recipients:
        if not recipient:
            continue
        dispatch_status = {
            "recipient": recipient,
            "channel": "Twilio SMS",
            "dispatched": False,
            "message_sid": None,
            "status": "pending",
            "error_detail": None
        }

        has_creds = bool((api_key_sid and api_key_secret) or (account_sid and auth_token))
        if has_creds and from_number:
            try:
                from twilio.rest import Client
                if api_key_sid and api_key_secret:
                    # Authenticate via Twilio API Key & Secret
                    client = Client(api_key_sid, api_key_secret, account_sid=account_sid)
                else:
                    # Fallback to Account SID & Auth Token
                    client = Client(account_sid, auth_token)

                msg = client.messages.create(
                    body=sms_body,
                    from_=from_number,
                    to=recipient
                )
                dispatch_status["dispatched"] = True
                dispatch_status["message_sid"] = msg.sid
                dispatch_status["status"] = msg.status or "sent"
                logger.info(f"Twilio SMS dispatched to {recipient}, SID: {msg.sid}")
            except Exception as e:
                err_msg = str(e)
                logger.warning(f"Twilio SMS dispatch to {recipient} failed: {err_msg}")
                dispatch_status["status"] = "failed"
                
                if "70004" in err_msg or "permissions" in err_msg.lower():
                    dispatch_status["error_detail"] = (
                        f"Twilio Error 70004: API Key ({api_key_sid[:8]}...) does not have permission to access the SMS Messages endpoint. "
                        f"In Twilio Console -> Account -> API Keys, create a 'Standard' API Key with Full/Messaging permissions under Account SID ({account_sid[:8]}...)."
                    )
                elif "status 4" in err_msg.lower() or "401" in err_msg:
                    dispatch_status["error_detail"] = (
                        "Twilio Authentication Notice: Account is inactive or suspended (Status 4). "
                        "Please verify your active trial balance or phone verification in Twilio Console."
                    )
                else:
                    dispatch_status["error_detail"] = err_msg
        else:
            dispatch_status["status"] = "unconfigured"
            dispatch_status["error_detail"] = "Twilio credentials missing in backend environment"

        twilio_results.append(dispatch_status)

    return {
        "timestamp": timestamp,
        "is_stable": overall_score >= 60.0,
        "overall_score": overall_score,
        "recommendation_band": recommendation_band,
        "sms_body": sms_body,
        "twilio_dispatches": twilio_results,
        "gmail_digest": gmail_digest
    }
