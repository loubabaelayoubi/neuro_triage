# CogniTriage - AI-Powered Neuroimaging Triage System

**Intelligent brain scan analysis for rapid cognitive decline screening and clinical decision support**

---
## Live Demo

**Deployed:** [https://neurotriage-r8qaeaopd-loubabaelayoubi-3117s-projects.vercel.app](https://neurotriage-r8qaeaopd-loubabaelayoubi-3117s-projects.vercel.app)

**GitHub:** [https://github.com/loubabaelayoubi/neuro_triage](https://github.com/loubabaelayoubi/neuro_triage)

---

## Problem statement

Healthcare systems worldwide face a critical bottleneck: **neuroimaging analysis for cognitive decline screening**. Radiologists are overwhelmed with scan volumes, diagnostic delays can span weeks, and early-stage cognitive decline often goes undetected until irreversible damage occurs.

Current challenges:
- **Diagnostic Delays**: 2-4 week wait times for neuroimaging reports
- **Expertise Shortage**: Limited neuroradiologists for growing scan volumes  
- **Missed Early Signs**: Subtle cognitive decline indicators overlooked in routine screening
- **Inconsistent Analysis**: Variability in interpretation across different radiologists

**CogniTriage transforms this workflow** with AI-powered instant analysis, automated volume measurements, and intelligent risk stratification—enabling immediate clinical decision support.

---

## AI-Powered analysis pipeline

CogniTriage implements a comprehensive **Upload → Process → Analyze → Visualize → Report** architecture:

### **Neuroimaging processing engine** (`cognitriage-backend/app/neuroimaging.py`)
- **Multi-Format Support**: Handles NIfTI (.nii.gz), DICOM, and compressed neuroimaging formats
- **Automated Brain Extraction**: Skull-stripping and tissue segmentation using advanced algorithms
- **Volume Quantification**: Precise hippocampal and cortical volume measurements
- **Quality Assessment**: Automated scan quality metrics (SNR, motion artifacts, contrast)

### **Volumetric analysis** 
- **Hippocampal Volume**: Critical for early Alzheimer's detection
- **Cortical Thickness**: Gray matter analysis for cognitive assessment  
- **Ventricular Size**: CSF volume changes indicating atrophy
- **Age-Normalized Percentiles**: Population-based reference comparisons

### **Risk stratification**
- **Multi-Modal Assessment**: Combines volumetric, intensity, and morphological features
- **Cognitive Decline Probability**: ML-based risk scoring (0-100%)
- **Clinical Recommendations**: Automated triage decisions (urgent/routine/follow-up)
- **Uncertainty Quantification**: Confidence intervals for all measurements

### **Advanced visualization**
- **3D Brain Rendering**: Interactive axial, coronal, and sagittal views
- **Heatmap Overlays**: Abnormality localization with color-coded intensity
- **Comparative Analysis**: Side-by-side normal vs. patient comparisons
- **Thumbnail Generation**: Automated key slice selection for reports

---

## Technical architecture

### **Full-Stack Implementation**
- **Frontend**: React 18 + TypeScript + Vite for responsive clinical interface
- **Backend**: FastAPI + Python for high-performance neuroimaging processing
- **UI Framework**: shadcn/ui + Tailwind CSS for professional medical interface
- **Visualization**: Custom D3.js components for brain rendering

### **Neuroimaging stack**
```python
# Core neuroimaging libraries
nibabel==5.3.2          # NIfTI file handling
nilearn==0.10.4         # Brain analysis and visualization  
scikit-image==0.24.0    # Image processing algorithms
scipy==1.14.0           # Scientific computing
numpy==2.3.2            # Numerical operations
```

### **Processing pipeline**
```python
# Automated analysis workflow
class NeuroimagingProcessor:
    def process_scan(self, nifti_file):
        # 1. Load and validate neuroimaging data
        # 2. Extract brain tissue (skull stripping)
        # 3. Register to standard atlas space
        # 4. Segment tissue types (GM/WM/CSF)
        # 5. Calculate volumetric measurements
        # 6. Generate quality metrics
        # 7. Create visualization thumbnails
        # 8. Compute risk stratification
```

### **Deployment architecture**
- **Vercel**: Production deployment with serverless functions
- **FastAPI Backend**: Python-based neuroimaging processing
- **React Frontend**: Modern SPA with client-side routing
- **File Upload**: Secure handling of large neuroimaging files (up to 100MB)

---

## Key Features

### **Instant Analysis**
- Upload brain scan → Results in under 60 seconds
- Real-time processing status with progress indicators
- Automated quality control and error handling

### **Clinical Metrics**
- Hippocampal volume measurements (mm³)
- Age-adjusted percentile rankings
- Cognitive decline probability scores
- Automated clinical recommendations

### **Interactive Visualization**
- Multi-planar brain views (axial/coronal/sagittal)
- Abnormality heatmaps with intensity scaling
- Comparative analysis with normative data
- Exportable reports for clinical documentation

### **Performance Optimized**
- Serverless architecture for scalability
- Optimized image processing algorithms
- Progressive loading for large datasets
- Mobile-responsive design for clinical workflows

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/loubabaelayoubi/neuro_triage
cd neuro_triage

# Frontend setup
cd cognitriage-frontend
npm install
npm run dev

# Backend setup (separate terminal)
cd cognitriage-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
```

---

## Project structure

```
neuro_triage/
├── cognitriage-frontend/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── BrainVisualization.tsx    # 3D brain rendering
│   │   │   ├── LoadingSpinner.tsx        # Processing indicators  
│   │   │   └── ui/                       # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx             # File upload interface
│   │   │   ├── Results.tsx               # Analysis results display
│   │   │   └── BrainView.tsx            # Interactive visualization
│   │   ├── context/
│   │   │   └── AppContext.tsx           # Global state management
│   │   └── lib/
│   │       └── utils.ts                 # Utility functions
├── cognitriage-backend/            # FastAPI Python backend  
│   ├── app/
│   │   ├── main.py                      # API endpoints
│   │   ├── neuroimaging.py              # Core processing engine
│   │   └── agents/                      # AI analysis modules
│   └── requirements.txt                 # Python dependencies
├── nii files/                      # Sample neuroimaging data
│   └── niivue-images/              # Test brain scans
├── vercel.json                     # Deployment configuration
└── README.md                       # This documentation
```

---

## Sample analysis output

```json
{
  "patient_id": "scan_12345",
  "analysis_timestamp": "2024-08-24T13:45:00Z",
  "volumetric_measurements": {
    "hippocampal_volume": {
      "left": 3245.7,
      "right": 3189.2,
      "total": 6434.9,
      "percentile_for_age": 15
    },
    "cortical_thickness": 2.34,
    "ventricular_volume": 23456.8
  },
  "quality_metrics": {
    "snr": 45.2,
    "motion_score": "minimal",
    "contrast_quality": "excellent"
  },
  "risk_assessment": {
    "cognitive_decline_probability": 0.73,
    "confidence_interval": [0.65, 0.81],
    "recommendation": "urgent_referral",
    "key_findings": [
      "Bilateral hippocampal atrophy (15th percentile)",
      "Enlarged ventricles suggesting cortical volume loss",
      "Pattern consistent with early-stage neurodegeneration"
    ]
  }
}
```

---

## Clinical impact

**CogniTriage addresses critical healthcare needs:**

- **Speed**: Instant analysis vs. weeks of waiting
- **Accuracy**: Consistent, quantitative measurements  
- **Objectivity**: Eliminates inter-reader variability
- **Accessibility**: Democratizes expert-level neuroimaging analysis
- **Cost-Effective**: Reduces need for specialized radiologist time

**Perfect for**: Emergency departments, primary care screening, research studies, and resource-limited healthcare settings requiring rapid neuroimaging triage.
