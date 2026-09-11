"""
Resume Schemas - Strictly following Design Doc 4.2
"""

from typing import Optional, List
from pydantic import BaseModel, Field


# --- Shared Components ---

class AnalyzeSuggestion(BaseModel):
    """Suggestion structure for Analyze API"""
    category: str = Field(..., description="e.g., 'content', 'format'")
    priority: str = Field(..., description="e.g., 'high', 'medium', 'low'")
    title: str = Field(..., description="Short title of the suggestion")
    description: str = Field(..., description="Detailed explanation")
    example: str = Field(..., description="Before/After example")


class MatchBreakdown(BaseModel):
    """Scoring breakdown for Match API"""
    skills_match: int = Field(..., ge=0, le=100)
    experience_match: int = Field(..., ge=0, le=100)
    education_match: int = Field(..., ge=0, le=100)
    keywords_match: int = Field(..., ge=0, le=100)


class MatchSuggestion(BaseModel):
    """Suggestion structure for Match API (includes 'action' field)"""
    category: str
    priority: str
    title: str
    description: str
    action: str = Field(..., description="Specific action to improve match")


# --- RA-24: Parsing Models (Kept for internal use) ---

class ContactInfo(BaseModel):
    """Contact information extracted from resume"""
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL")
    location: Optional[str] = Field(None, description="Location/Address")


class Education(BaseModel):
    """Education entry from resume"""
    institution: Optional[str] = Field(None, description="School/University name")
    degree: Optional[str] = Field(None, description="Degree/Qualification")
    field: Optional[str] = Field(None, description="Field of study")
    graduation_year: Optional[str] = Field(None, description="Graduation year")


class WorkExperience(BaseModel):
    """Work experience entry from resume"""
    company: Optional[str] = Field(None, description="Company name")
    position: Optional[str] = Field(None, description="Job title/Position")
    duration: Optional[str] = Field(None, description="Duration (e.g., '2020-2023')")
    description: Optional[str] = Field(None, description="Job responsibilities")


class ResumeData(BaseModel):
    """Parsed resume data structure (RA-24)"""
    full_name: Optional[str] = Field(None, description="Full name of candidate")
    contact_info: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = Field(None, description="Professional summary")
    skills: List[str] = Field(default_factory=list, description="List of skills")
    education: List[Education] = Field(default_factory=list)
    work_experience: List[WorkExperience] = Field(default_factory=list)
    raw_text: str = Field(..., description="Full extracted text from resume")


# --- 4.2.1 Upload & Parse Resume ---

class ResumeUploadData(BaseModel):
    """Inner data for resume upload response (Design Doc 4.2.1)"""
    session_id: str = Field(..., description="Unique session/file identifier")
    expire_at: str = Field(..., description="ISO timestamp when the session expires")


class ResumeUploadResponse(BaseModel):
    """Response schema for resume upload (Design Doc 4.2.1)"""
    code: int = 201
    status: str = "ok"
    data: ResumeUploadData


# --- 4.2.2 Analyze Resume ---

class ResumeAnalyzeRequest(BaseModel):
    """Request schema for resume analysis (Design Doc 4.2.2)"""
    session_id: str


class AnalyzeResponseData(BaseModel):
    """Inner data for analyze response"""
    suggestions: List[AnalyzeSuggestion]


class ResumeAnalyzeResponse(BaseModel):
    """Response schema for analyze response (Design Doc 4.2.2)"""
    code: int = 200
    status: str = "ok"
    data: AnalyzeResponseData


# --- 4.2.3 Match Resume with JD ---

class ResumeMatchRequest(BaseModel):
    """Request schema for resume matching (Design Doc 4.2.3)"""
    session_id: str
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class MatchResponseData(BaseModel):
    """Inner data for match response"""
    match_score: int = Field(..., ge=0, le=100)
    match_breakdown: MatchBreakdown
    suggestions: List[MatchSuggestion]


class ResumeMatchResponse(BaseModel):
    """Response schema for match response (Design Doc 4.2.3)"""
    code: int = 200
    status: str = "ok"
    data: MatchResponseData


# --- 4.2.4 Optimize Resume ---

class ResumeOptimizeRequest(BaseModel):
    """Request schema for resume optimization (Design Doc 4.2.4)"""
    session_id: str
    job_description: Optional[str] = None
    template: str = "modern"


class OptimizeResponseData(BaseModel):
    """Inner data for optimize response"""
    encoded_file: str = Field(..., description="Base64 encoded optimized file")


class ResumeOptimizeResponse(BaseModel):
    """Response schema for optimize response (Design Doc 4.2.4)"""
    code: int = 200
    status: str = "ok"
    data: OptimizeResponseData


# --- 4.2.5 Interview Prep from JD ---

class ResumeInterviewPrepRequest(BaseModel):
    """Request schema for interview preparation"""
    session_id: Optional[str] = None
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None


class InterviewSkillGap(BaseModel):
    """Skill gap item for interview prep"""
    skill: str
    status: str = Field(..., description="matched | partial | missing | unverified")
    why_it_matters: str
    how_to_prepare: str


class InterviewQuestion(BaseModel):
    """Likely interview question with coaching notes"""
    category: str = Field(..., description="product | technical_frontend | technical_backend | data | behavioral | project | system")
    difficulty: str = Field(..., description="easy | medium | hard")
    question: str
    intent: str
    suggested_answer: str
    follow_ups: List[str] = Field(default_factory=list)


class InterviewProjectStory(BaseModel):
    """STAR story aligned to the JD"""
    title: str
    situation: str
    task: str
    action: str
    result: str
    jd_alignment: str


class InterviewStudyPlanItem(BaseModel):
    """Short study-plan action for interview prep"""
    topic: str
    priority: str = Field(..., description="high | medium | low")
    actions: List[str] = Field(default_factory=list)


class InterviewPrepResponseData(BaseModel):
    """Inner data for interview prep response"""
    role_summary: str
    self_intro: str
    must_have_skills: List[str] = Field(default_factory=list)
    nice_to_have_skills: List[str] = Field(default_factory=list)
    skill_gaps: List[InterviewSkillGap] = Field(default_factory=list)
    questions: List[InterviewQuestion] = Field(default_factory=list)
    project_stories: List[InterviewProjectStory] = Field(default_factory=list)
    questions_to_ask: List[str] = Field(default_factory=list)
    study_plan: List[InterviewStudyPlanItem] = Field(default_factory=list)
    interview_format_tips: List[str] = Field(default_factory=list)


class ResumeInterviewPrepResponse(BaseModel):
    """Response schema for interview preparation"""
    code: int = 200
    status: str = "ok"
    data: InterviewPrepResponseData
