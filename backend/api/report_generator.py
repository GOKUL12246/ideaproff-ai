import io
from typing import Any, Dict, List
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)

NAVY = colors.HexColor('#0f172a')
PRIMARY_BLUE = colors.HexColor('#2563eb')
TEAL = colors.HexColor('#0d9488')
LIGHT_GRAY = colors.HexColor('#f8fafc')
BORDER_GRAY = colors.HexColor('#e2e8f0')
DARK_GRAY = colors.HexColor('#475569')
ALERT_RED = colors.HexColor('#dc2626')
SUCCESS_GREEN = colors.HexColor('#16a34a')

def generate_pdf_report(
    idea: Dict[str, Any],
    validation_report: Dict[str, Any],
    scoring: Dict[str, Any],
    evidence_coverage: Dict[str, Any]
) -> bytes:
    """Generates an executive-grade PDF validation dossier using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=NAVY
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=DARK_GRAY
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=PRIMARY_BLUE,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=NAVY
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=DARK_GRAY
    )

    story = []

    # Title & Header
    story.append(Paragraph("IDEAPROOF AI — VALIDATION REPORT", subtitle_style))
    story.append(Paragraph(idea.get('title', 'Startup Idea').upper(), title_style))
    story.append(Paragraph(f"Industry: {idea.get('industry', 'Technology')} | Geography: {idea.get('target_geography', 'Global')} | Stage: {idea.get('development_stage', 'Idea')}", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY_BLUE, spaceBefore=4, spaceAfter=12))

    # Executive Summary & Score Banner
    overall_score = scoring.get('overall_score', 0)
    band = scoring.get('recommendation_band', 'Under Evaluation')
    coverage_pct = evidence_coverage.get('coverage_percentage', 0)
    confidence = evidence_coverage.get('confidence_level', 'Low')

    score_color = SUCCESS_GREEN if overall_score >= 70 else (PRIMARY_BLUE if overall_score >= 50 else ALERT_RED)

    score_data = [
        [
            Paragraph(f"<b>VALIDATION READINESS SCORE</b><br/><font size=22 color='{score_color}'><b>{overall_score}/100</b></font><br/><b>Band:</b> {band}", body_style),
            Paragraph(f"<b>EVIDENCE COVERAGE</b><br/><font size=22 color='{PRIMARY_BLUE}'><b>{coverage_pct}%</b></font><br/><b>Confidence:</b> {confidence}", body_style)
        ]
    ]
    score_table = Table(score_data, colWidths=[270, 270])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_GRAY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))

    # Executive Summary Text
    story.append(Paragraph("1. Executive Summary", h1_style))
    exec_summary = validation_report.get('executive_summary', 'Comprehensive validation analysis for the startup idea.')
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 8))

    # Problem & Proposed Solution
    story.append(Paragraph("2. Problem & Proposed Solution", h1_style))
    p_data = [
        [Paragraph("<b>Problem Statement (User Assumption):</b>", body_style), Paragraph(idea.get('problem_statement', 'N/A'), body_style)],
        [Paragraph("<b>Proposed Solution (Architecture):</b>", body_style), Paragraph(idea.get('proposed_solution', 'N/A'), body_style)],
        [Paragraph("<b>Unique Value Proposition:</b>", body_style), Paragraph(idea.get('unique_value_proposition', 'N/A'), body_style)],
        [Paragraph("<b>Target Customers:</b>", body_style), Paragraph(idea.get('target_customers', 'N/A'), body_style)]
    ]
    p_table = Table(p_data, colWidths=[160, 380])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), LIGHT_GRAY),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 10))

    # Validation Score Criterion Breakdown
    story.append(Paragraph("3. Deterministic Validation Breakdown (100% Weight Total)", h1_style))
    scores_breakdown = scoring.get('criterion_scores', {})
    weights = scoring.get('scoring_weights', {})
    
    crit_rows = [["Evaluation Criterion", "Weight", "Score / 100", "Weighted Impact"]]
    for k, weight in weights.items():
        s = scores_breakdown.get(k, 0)
        weighted = (s * weight) / 100.0
        label = k.replace('_', ' ').title()
        crit_rows.append([label, f"{weight}%", f"{s:.1f}", f"{weighted:.1f} pts"])
    
    crit_table = Table(crit_rows, colWidths=[240, 80, 100, 120])
    crit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_GRAY]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(crit_table)
    story.append(Spacer(1, 10))

    # Supporting Evidence & Missing Evidence
    story.append(Paragraph("4. Supporting Evidence vs Missing Evidence", h1_style))
    support = scoring.get('supporting_evidence', [])
    missing = scoring.get('missing_evidence', [])

    ev_data = [
        [
            Paragraph("<b>SUPPORTING EVIDENCE (VERIFIED)</b><br/>" + "<br/>".join([f"• {item}" for item in (support or ['Initial parameters defined.'])]), body_style),
            Paragraph("<b>CRITICAL GAPS (MISSING EVIDENCE)</b><br/>" + "<br/>".join([f"• {item}" for item in (missing or ['None identified.'])]), body_style)
        ]
    ]
    ev_table = Table(ev_data, colWidths=[270, 270])
    ev_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#fef2f2')),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(ev_table)
    story.append(Spacer(1, 12))

    # Market Intelligence & Sizing
    story.append(Paragraph("5. Market Intelligence & Sizing (Bottom-Up Model)", h1_style))
    market_data = validation_report.get('market_analysis', {})
    tam_info = market_data.get('tam_sam_som_analysis', {})
    m_data = [
        ["Market Tier", "Estimated Size (USD)", "Definition & Methodology"],
        ["Total Addressable Market (TAM)", f"${tam_info.get('estimated_tam_usd', 0):,}", tam_info.get('tam_explanation', 'Total global potential demand')],
        ["Serviceable Addressable Market (SAM)", f"${tam_info.get('estimated_sam_usd', 0):,}", tam_info.get('sam_explanation', 'Directly reachable within target geography')],
        ["Serviceable Obtainable Market (SOM)", f"${tam_info.get('estimated_som_usd', 0):,}", tam_info.get('som_explanation', 'Realistic 24-36 month capture target')]
    ]
    m_table = Table(m_data, colWidths=[170, 130, 240])
    m_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), TEAL),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_GRAY]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(m_table)
    story.append(Spacer(1, 10))

    # Financial Feasibility Summary
    story.append(Paragraph("6. Financial Feasibility Simulation (Python Calculated)", h1_style))
    fin_sim = validation_report.get('financial_simulation', {})
    base_fin = fin_sim.get('base', {})
    f_data = [
        ["Metric", "Base Value", "Metric", "Base Value"],
        ["Upfront Investment", f"${base_fin.get('upfront_investment', 0):,}", "Monthly Fixed Costs", f"${base_fin.get('fixed_monthly_costs', 0):,}"],
        ["Unit Contribution", f"${base_fin.get('unit_contribution', 0):,}", "Contribution Margin", f"{base_fin.get('contribution_margin_percentage', 0)}%"],
        ["Break-Even Customers", f"{base_fin.get('break_even_customers', 0)} accounts", "Break-Even Month", f"{base_fin.get('estimated_break_even_month', 'N/A')}"],
        ["Year 1 Gross Revenue", f"${base_fin.get('year_total_revenue', 0):,}", "Year 1 Net Result", f"${base_fin.get('year_net_profit', 0):,}"]
    ]
    f_table = Table(f_data, colWidths=[140, 130, 140, 130])
    f_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_GRAY]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(f_table)
    story.append(Spacer(1, 10))

    # Actionable Startup Roadmap
    story.append(Paragraph("7. Actionable Startup Roadmap (Next Milestones)", h1_style))
    tasks = validation_report.get('roadmap_tasks', [])[:6]
    r_rows = [["Timeframe", "Task Title", "Priority", "Owner", "Expected Outcome"]]
    for t in tasks:
        r_rows.append([
            t.get('timeframe', 'Next 7 days'),
            t.get('title', 'Task'),
            t.get('priority', 'Medium'),
            t.get('assigned_user', 'Founder'),
            t.get('expected_outcome', 'Complete milestone')[:38] + "..."
        ])
    r_table = Table(r_rows, colWidths=[90, 160, 60, 80, 150])
    r_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_GRAY]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(r_table)
    story.append(Spacer(1, 14))

    # Disclaimer Footer
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_GRAY, spaceBefore=6, spaceAfter=8))
    story.append(Paragraph(
        "<b>DATA PROVENANCE & LIMITATIONS NOTICE:</b> This dossier was generated by IdeaProof AI. "
        "Verified customer survey data and user-provided parameters are analyzed using deterministic mathematical models. "
        "AI agents provide strategic syntheses and hypotheses. Forward projections represent estimates and do not guarantee commercial success.",
        meta_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def export_survey_responses_to_csv(responses: List[Dict[str, Any]], questions: List[Dict[str, Any]]) -> str:
    """Exports survey responses into a structured CSV string using Pandas."""
    if not responses:
        df = pd.DataFrame(columns=["Response ID", "Submitted At", "Status"])
        return df.to_csv(index=False)

    rows = []
    # Build question lookup
    q_map = {q.get('id', str(i)): q.get('question_text', f'Question {i+1}') for i, q in enumerate(questions)}

    for r in responses:
        row = {
            'Response ID': r.get('id') or str(r.get('_id', '')),
            'Submitted At': r.get('submitted_at', ''),
            'Token': r.get('token', ''),
        }
        answers = r.get('answers', {})
        for q_id, q_text in q_map.items():
            ans_val = answers.get(q_id, '')
            if isinstance(ans_val, list):
                row[q_text] = "; ".join(str(x) for x in ans_val)
            else:
                row[q_text] = str(ans_val)
        rows.append(row)

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
