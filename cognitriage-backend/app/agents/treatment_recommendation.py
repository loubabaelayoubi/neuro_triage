"""
Treatment Recommendation Agent for NeuroTriage
Provides personalized treatment recommendations based on risk assessment, imaging findings, and evidence.
"""

from typing import Dict, List, Any, Optional
import json


def treatment_recommendation_agent(
    risk_tier: str, 
    imaging_findings: Dict[str, Any], 
    evidence: Dict[str, Any],
    patient_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate treatment recommendations based on patient risk profile and imaging findings.
    
    Args:
        risk_tier: Risk classification (LOW, MODERATE, HIGH, URGENT)
        imaging_findings: Neuroimaging analysis results
        evidence: Literature evidence and citations
        patient_info: Patient demographics and clinical data
        
    Returns:
        Dict containing treatment recommendations with confidence scores
    """
    
    age = patient_info.get("age", 70) if patient_info else 70
    sex = patient_info.get("sex", "U") if patient_info else "U"
    moca_score = patient_info.get("moca_total", 24) if patient_info else 24
    
    hippocampal_vols = imaging_findings.get("hippocampal_volumes", {})
    mta_score = imaging_findings.get("mta_score", 0)
    percentiles = imaging_findings.get("percentiles", {})
    
    min_hippocampal_vol = min(
        hippocampal_vols.get("left_ml", 3.5),
        hippocampal_vols.get("right_ml", 3.5)
    )
    
    recommendations = {
        "lifestyle_interventions": [],
        "medical_management": [],
        "monitoring_schedule": [],
        "referrals": [],
        "clinical_trials": [],
        "confidence_scores": {},
        "rationale": []
    }
    
    if risk_tier == "LOW":
        _add_low_risk_recommendations(recommendations, age, moca_score)
        base_confidence = 0.85
        
    elif risk_tier == "MODERATE":
        _add_moderate_risk_recommendations(recommendations, age, moca_score, min_hippocampal_vol)
        base_confidence = 0.80
        
    elif risk_tier == "HIGH":
        _add_high_risk_recommendations(recommendations, age, moca_score, mta_score)
        base_confidence = 0.75
        
    elif risk_tier == "URGENT":
        _add_urgent_risk_recommendations(recommendations, age, moca_score, mta_score)
        base_confidence = 0.70
        
    else:
        _add_default_recommendations(recommendations)
        base_confidence = 0.60
    
    if age >= 75:
        recommendations["medical_management"].append({
            "intervention": "Comprehensive geriatric assessment",
            "priority": "high",
            "evidence_level": "A",
            "rationale": "Advanced age warrants holistic evaluation"
        })
    
    if sex == "F" and age >= 65:
        recommendations["lifestyle_interventions"].append({
            "intervention": "Hormone replacement therapy evaluation",
            "priority": "moderate",
            "evidence_level": "B",
            "rationale": "Post-menopausal cognitive protection consideration"
        })
    
    if evidence.get("search_type") == "pubmed_live":
        citations_count = len(evidence.get("citations", []))
        if citations_count >= 3:
            recommendations["rationale"].append(
                f"Recommendations informed by {citations_count} recent publications"
            )
            base_confidence += 0.05
    
    recommendations["confidence_scores"] = {
        "lifestyle": min(0.95, base_confidence + 0.10),
        "medical": min(0.90, base_confidence),
        "monitoring": min(0.95, base_confidence + 0.05),
        "referrals": min(0.85, base_confidence - 0.05),
        "overall": min(0.90, base_confidence)
    }
    
    if mta_score >= 3:
        recommendations["rationale"].append(
            f"Elevated MTA score ({mta_score}) supports structured intervention"
        )
    
    if min_hippocampal_vol < 2.5:
        recommendations["rationale"].append(
            "Significant hippocampal volume loss detected"
        )
    
    recommendations["priority_score"] = _calculate_priority_score(
        risk_tier, mta_score, moca_score, age
    )
    
    return recommendations


def _add_low_risk_recommendations(recommendations: Dict, age: int, moca_score: int):
    """Add recommendations for low-risk patients"""
    
    recommendations["lifestyle_interventions"].extend([
        {
            "intervention": "Mediterranean diet adherence",
            "priority": "high",
            "evidence_level": "A",
            "rationale": "Proven neuroprotective benefits"
        },
        {
            "intervention": "Regular aerobic exercise (150 min/week)",
            "priority": "high", 
            "evidence_level": "A",
            "rationale": "Supports neuroplasticity and cognitive reserve"
        },
        {
            "intervention": "Cognitive training programs",
            "priority": "moderate",
            "evidence_level": "B",
            "rationale": "May help maintain cognitive function"
        }
    ])
    
    recommendations["monitoring_schedule"].extend([
        {
            "assessment": "Annual cognitive screening",
            "frequency": "12 months",
            "priority": "moderate"
        },
        {
            "assessment": "Lifestyle adherence check",
            "frequency": "6 months", 
            "priority": "low"
        }
    ])


def _add_moderate_risk_recommendations(recommendations: Dict, age: int, moca_score: int, min_vol: float):
    """Add recommendations for moderate-risk patients"""
    
    _add_low_risk_recommendations(recommendations, age, moca_score)
    
    recommendations["medical_management"].extend([
        {
            "intervention": "Vitamin D supplementation assessment",
            "priority": "moderate",
            "evidence_level": "B",
            "rationale": "Potential cognitive benefits in deficient patients"
        },
        {
            "intervention": "Sleep quality optimization",
            "priority": "high",
            "evidence_level": "A", 
            "rationale": "Sleep disturbances accelerate cognitive decline"
        }
    ])
    
    recommendations["monitoring_schedule"] = [
        {
            "assessment": "Cognitive assessment (MoCA/MMSE)",
            "frequency": "6 months",
            "priority": "high"
        },
        {
            "assessment": "Neuroimaging follow-up",
            "frequency": "12-18 months",
            "priority": "moderate"
        }
    ]
    
    recommendations["referrals"].append({
        "specialist": "Neuropsychology",
        "priority": "moderate",
        "rationale": "Detailed cognitive profiling recommended"
    })


def _add_high_risk_recommendations(recommendations: Dict, age: int, moca_score: int, mta_score: int):
    """Add recommendations for high-risk patients"""
    
    _add_moderate_risk_recommendations(recommendations, age, moca_score, 0)
    
    recommendations["medical_management"].extend([
        {
            "intervention": "Comprehensive metabolic panel",
            "priority": "high",
            "evidence_level": "A",
            "rationale": "Rule out reversible causes of cognitive decline"
        },
        {
            "intervention": "Cardiovascular risk optimization",
            "priority": "high",
            "evidence_level": "A",
            "rationale": "Vascular factors contribute to cognitive decline"
        }
    ])
    
    recommendations["referrals"].extend([
        {
            "specialist": "Memory clinic/Neurology",
            "priority": "high",
            "rationale": "Specialist evaluation for potential MCI/dementia"
        },
        {
            "specialist": "Geriatrician",
            "priority": "moderate",
            "rationale": "Comprehensive geriatric assessment"
        }
    ])
    
    recommendations["clinical_trials"].append({
        "consideration": "Alzheimer's prevention trials",
        "priority": "moderate",
        "rationale": "May benefit from early intervention studies"
    })


def _add_urgent_risk_recommendations(recommendations: Dict, age: int, moca_score: int, mta_score: int):
    """Add recommendations for urgent-risk patients"""
    
    _add_high_risk_recommendations(recommendations, age, moca_score, mta_score)
    
    recommendations["medical_management"].extend([
        {
            "intervention": "CSF biomarker evaluation",
            "priority": "high",
            "evidence_level": "A",
            "rationale": "Definitive Alzheimer's pathology assessment"
        },
        {
            "intervention": "PET amyloid imaging consideration",
            "priority": "moderate",
            "evidence_level": "B",
            "rationale": "Amyloid burden assessment if clinically indicated"
        }
    ])
    
    for referral in recommendations["referrals"]:
        if referral["specialist"] == "Memory clinic/Neurology":
            referral["priority"] = "urgent"
            referral["timeframe"] = "2-4 weeks"
    
    recommendations["monitoring_schedule"] = [
        {
            "assessment": "Cognitive assessment",
            "frequency": "3 months",
            "priority": "urgent"
        },
        {
            "assessment": "Functional assessment",
            "frequency": "3 months", 
            "priority": "high"
        }
    ]


def _add_default_recommendations(recommendations: Dict):
    """Add default recommendations for unknown risk"""
    
    recommendations["lifestyle_interventions"].append({
        "intervention": "General cognitive health maintenance",
        "priority": "moderate",
        "evidence_level": "C",
        "rationale": "Standard cognitive health practices"
    })
    
    recommendations["monitoring_schedule"].append({
        "assessment": "Baseline cognitive assessment",
        "frequency": "12 months",
        "priority": "moderate"
    })


def _calculate_priority_score(risk_tier: str, mta_score: int, moca_score: int, age: int) -> float:
    """Calculate overall priority score for treatment urgency"""
    
    base_scores = {
        "LOW": 0.3,
        "MODERATE": 0.5, 
        "HIGH": 0.7,
        "URGENT": 0.9
    }
    
    score = base_scores.get(risk_tier, 0.4)
    
    if mta_score >= 4:
        score += 0.15
    elif mta_score >= 3:
        score += 0.10
    
    if moca_score < 20:
        score += 0.15
    elif moca_score < 24:
        score += 0.10
    
    if age >= 80:
        score += 0.10
    elif age >= 75:
        score += 0.05
    
    return min(1.0, score)
