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
    idea_id: Optional[str] = None,
    recipient_email: str = ""
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
                
                if "template" in err_msg.lower() or "trial" in err_msg.lower():
                    dispatch_status["error_detail"] = (
                        "Twilio Trial Policy Notice: Active Twilio Trial accounts restrict free-form SMS to India (+91) without a registered template or verified number. "
                        "To receive SMS: 1) Verify +916369067138 in Twilio Console under 'Phone Numbers -> Verified Caller IDs', or 2) Upgrade your Twilio account to enable unrestricted international delivery."
                    )
                elif "70004" in err_msg or "permissions" in err_msg.lower():
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

    import urllib.parse
    encoded_subject = urllib.parse.quote(gmail_digest.get("subject", ""))
    encoded_body = urllib.parse.quote(sms_body)
    rec_param = f"&to={urllib.parse.quote(recipient_email)}" if recipient_email else ""
    gmail_compose_url = f"https://mail.google.com/mail/?view=cm&fs=1{rec_param}&su={encoded_subject}&body={encoded_body}"
    mailto_url = f"mailto:{recipient_email}?subject={encoded_subject}&body={encoded_body}" if recipient_email else f"mailto:?subject={encoded_subject}&body={encoded_body}"

    gmail_digest["compose_url"] = gmail_compose_url
    gmail_digest["mailto_url"] = mailto_url
    gmail_digest["target_recipient"] = recipient_email

    # If recipient email provided, attempt direct SMTP delivery if configured
    email_dispatch_result = None
    if recipient_email:
        email_dispatch_result = send_direct_email_notification(
            recipient_email=recipient_email,
            idea_title=idea_title,
            overall_score=overall_score,
            recommendation_band=recommendation_band,
            confidence_level=confidence_level,
            target_customers=target_customers,
            idea_id=idea_id
        )

    return {
        "timestamp": timestamp,
        "is_stable": overall_score >= 60.0,
        "overall_score": overall_score,
        "recommendation_band": recommendation_band,
        "from_number": from_number or "+15732848417",
        "sms_body": sms_body,
        "twilio_dispatches": twilio_results,
        "gmail_digest": gmail_digest,
        "email_dispatch": email_dispatch_result
    }


def send_direct_email_notification(
    recipient_email: str,
    idea_title: str,
    overall_score: float,
    recommendation_band: str,
    confidence_level: str,
    target_customers: str = "",
    idea_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Directly dispatches an official Startup Stability dossier to the founder's Gmail address.
    Supports:
    1) Native Gmail SMTP (when EMAIL_HOST_USER and EMAIL_HOST_PASSWORD / App Password are set in .env)
    2) Direct 1-click Gmail Web compose link for instant, zero-setup browser delivery
    """
    import urllib.parse
    from django.core.mail import EmailMultiAlternatives

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    subject = f"🚀 [IdeaProof AI] Startup Stable for Launch: '{idea_title}' (Score: {overall_score:.1f}/100)"
    
    body_text = (
        f"IdeaProof AI — Startup Stability Confirmed\n\n"
        f"Startup Idea: {idea_title}\n"
        f"Overall Readiness Score: {overall_score:.1f} / 100\n"
        f"Recommendation Band: {recommendation_band}\n"
        f"Confidence Level: {confidence_level}\n"
        f"Target Customer Cohort: {target_customers or 'Primary Customer Segment'}\n"
        f"Timestamp: {timestamp}\n\n"
        f"Key Strategic Next Steps:\n"
        f"1. Freeze problem definition & scope the MVP sprint.\n"
        f"2. Initiate customer pre-sales with survey respondents.\n"
        f"3. Export your verified ReportLab PDF validation dossier from the IdeaProof AI dashboard.\n\n"
        f"Generated by IdeaProof AI Autonomous Validation Engine."
    )

    body_html = f"""
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #FFFFFF; padding: 28px 24px; text-align: center;">
            <span style="background: #2563EB; color: #FFFFFF; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Official Validation Alert</span>
            <h1 style="margin: 12px 0 6px; font-size: 22px; font-weight: 700;">Startup Stability Confirmed</h1>
            <p style="margin: 0; color: #38BDF8; font-size: 14px;">IdeaProof AI Autonomous Decision Engine</p>
        </div>
        <div style="padding: 24px; color: #1E293B; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0;">Congratulations! Quantitative empirical evaluation confirms that <strong>'{idea_title}'</strong> has achieved stability criteria and is ready to proceed to MVP development.</p>
            
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Readiness Score:</td>
                        <td style="padding: 8px 0; font-weight: 800; color: #059669; font-size: 20px;">{overall_score:.1f} <span style="font-size: 14px; color: #64748B; font-weight: normal;">/ 100</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Decision Band:</td>
                        <td style="padding: 8px 0; font-weight: 700; color: #0F172A;">{recommendation_band}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Confidence Level:</td>
                        <td style="padding: 8px 0; font-weight: 700; color: #2563EB;">{confidence_level}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Customer Cohort:</td>
                        <td style="padding: 8px 0; color: #334155;">{target_customers or 'Primary Target Segment'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Verified Timestamp:</td>
                        <td style="padding: 8px 0; color: #64748B; font-family: monospace; font-size: 12px;">{timestamp}</td>
                    </tr>
                </table>
            </div>

            <h3 style="color: #0F172A; font-size: 16px; margin: 22px 0 10px;">Recommended Founder Roadmap:</h3>
            <ol style="color: #334155; font-size: 14px; padding-left: 20px; margin: 0 0 20px;">
                <li style="margin-bottom: 8px;"><strong>Freeze Problem Scope:</strong> Solidify the core value proposition validated by customer surveys.</li>
                <li style="margin-bottom: 8px;"><strong>Launch Pre-Sales:</strong> Contact enthusiastic survey respondents for beta testing.</li>
                <li style="margin-bottom: 8px;"><strong>Review Public Comps:</strong> Reference the Sharemarket Analysis module for valuation multiple benchmarks.</li>
            </ol>
        </div>
        <div style="background: #F1F5F9; border-top: 1px solid #E2E8F0; padding: 14px; text-align: center; color: #64748B; font-size: 12px;">
            Delivered by IdeaProof AI &bull; Startup Intelligence Platform
        </div>
    </div>
    """

    encoded_subject = urllib.parse.quote(subject)
    encoded_body = urllib.parse.quote(body_text)
    compose_url = f"https://mail.google.com/mail/?view=cm&fs=1&to={urllib.parse.quote(recipient_email)}&su={encoded_subject}&body={encoded_body}"
    mailto_url = f"mailto:{recipient_email}?subject={encoded_subject}&body={encoded_body}"

    email_user = getattr(settings, 'EMAIL_HOST_USER', '') or os.getenv('EMAIL_HOST_USER', '')
    email_pass = getattr(settings, 'EMAIL_HOST_PASSWORD', '') or os.getenv('EMAIL_HOST_PASSWORD', '')
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or os.getenv('DEFAULT_FROM_EMAIL', 'IdeaProof AI <notifications@ideaproof.ai>')

    result = {
        "recipient": recipient_email,
        "subject": subject,
        "channel": "Gmail Delivery",
        "dispatched": False,
        "status": "pending",
        "compose_url": compose_url,
        "mailto_url": mailto_url,
        "error_detail": None,
        "message": ""
    }

    sendgrid_key = getattr(settings, 'SENDGRID_API_KEY', '') or os.getenv('SENDGRID_API_KEY', '')

    if sendgrid_key:
        try:
            import json, urllib.request
            payload = {
                "personalizations": [{"to": [{"email": recipient_email}]}],
                "from": {"email": "notifications@ideaproof.ai", "name": "IdeaProof AI"},
                "subject": subject,
                "content": [
                    {"type": "text/plain", "value": body_text},
                    {"type": "text/html", "value": body_html}
                ]
            }
            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json"
                }
            )
            urllib.request.urlopen(req)
            result["dispatched"] = True
            result["status"] = "sent"
            result["channel"] = "Twilio SendGrid"
            result["message"] = f"Successfully delivered stability report directly to {recipient_email} via Twilio SendGrid!"
            logger.info(f"Twilio SendGrid delivered to {recipient_email}")
            return result
        except Exception as e:
            err = str(e)
            logger.warning(f"Twilio SendGrid dispatch failed: {err}")
            result["error_detail"] = err

    if email_user and email_pass:
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=body_text,
                from_email=from_email,
                to=[recipient_email]
            )
            msg.attach_alternative(body_html, "text/html")
            msg.send(fail_silently=False)
            result["dispatched"] = True
            result["status"] = "sent"
            result["message"] = f"Successfully delivered stability report directly to {recipient_email} via Gmail SMTP!"
            logger.info(f"Gmail SMTP successfully delivered to {recipient_email}")
        except Exception as e:
            err = str(e)
            logger.warning(f"Gmail SMTP dispatch to {recipient_email} failed: {err}")
            result["status"] = "smtp_error"
            result["error_detail"] = err
            result["message"] = f"Gmail SMTP error: {err}. You can also use the 1-click 'Open in Gmail' link."
    else:
        result["status"] = "ready_for_web_dispatch"
        result["message"] = (
            "Gmail message ready! Click 'Open in Gmail' to send instantly with subject and body pre-filled, "
            "or configure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in backend/.env for fully background SMTP delivery."
        )

    return result


