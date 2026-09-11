"""
Tests for Interview Prep from Job Description
"""

from dataclasses import dataclass, field
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.config import settings
from app.services.llm.llm_service import LLMService
from app.services.llm.exceptions import LLMResponseError
from app.services.llm.schemas import InterviewPrepResult


SAMPLE_JD = """
职位描述
1、负责需求调研、原型绘制、PRD 输出，参与页面、接口开发与联调，并完成系统部署上线；
2、跟进产品迭代、线上问题排查，通过数据分析优化产品体验；
3、参与内部商业项目实战，独立完成完整产品 Demo 并输出项目复盘。

职位要求
1、2027届应届生，计算机、软件工程等理工科专业；
2、具备产品 + 研发双向学习意愿；
3、会 Axure/Figma，掌握 HTML/CSS/JS，Python 或 Java，基础 SQL。
"""

MOCK_INTERVIEW_JSON = """
{
  "role_summary": "产品+研发双修实习生，需要独立完成需求到上线。",
  "self_intro": "我是2027届计算机专业学生，做过完整产品 Demo。",
  "must_have_skills": ["Figma", "HTML/CSS/JS", "SQL"],
  "nice_to_have_skills": ["Git", "RESTful"],
  "skill_gaps": [
    {
      "skill": "Figma",
      "status": "unverified",
      "why_it_matters": "JD 要求会画原型",
      "how_to_prepare": "准备一个可演示的原型"
    }
  ],
  "questions": [
    {
      "category": "product",
      "difficulty": "medium",
      "question": "如何写一份 PRD？",
      "intent": "考察产品表达能力",
      "suggested_answer": "先讲背景目标，再讲流程和指标。",
      "follow_ups": ["如何验收？"]
    }
  ],
  "project_stories": [
    {
      "title": "全栈 Demo",
      "situation": "独立做一个产品",
      "task": "完成需求到上线",
      "action": "调研、原型、开发、复盘",
      "result": "完成可演示 Demo",
      "jd_alignment": "独立完成完整产品 Demo"
    }
  ],
  "questions_to_ask": ["这个岗位入职后第一个月会做什么？"],
  "study_plan": [
    {
      "topic": "PRD 与原型",
      "priority": "high",
      "actions": ["用 Figma 画一个核心流程"]
    }
  ],
  "interview_format_tips": ["准备一个 3 分钟项目演示"]
}
"""


@dataclass
class MockInterviewResult:
    role_summary: str = "Role summary"
    self_intro: str = "Self intro"
    must_have_skills: list = field(default_factory=lambda: ["Python"])
    nice_to_have_skills: list = field(default_factory=lambda: ["Git"])
    skill_gaps: list = field(default_factory=list)
    questions: list = field(default_factory=list)
    project_stories: list = field(default_factory=list)
    questions_to_ask: list = field(default_factory=lambda: ["What does success look like?"])
    study_plan: list = field(default_factory=list)
    interview_format_tips: list = field(default_factory=lambda: ["Prepare a demo"])


def _full_mock_result():
    gap = MagicMock(
        skill="Figma",
        status="unverified",
        why_it_matters="Prototype required",
        how_to_prepare="Build one screen",
    )
    question = MagicMock(
        category="product",
        difficulty="medium",
        question="How do you write a PRD?",
        intent="Product thinking",
        suggested_answer="Start from user problem.",
        follow_ups=["How do you measure success?"],
    )
    story = MagicMock(
        title="Campus demo",
        situation="Needed a product demo",
        task="Ship end-to-end",
        action="Research, prototype, code",
        result="Launched a demo",
        jd_alignment="Independent product demo",
    )
    plan = MagicMock(
        topic="SQL",
        priority="high",
        actions=["Practice CRUD queries"],
    )
    return MockInterviewResult(
        skill_gaps=[gap],
        questions=[question],
        project_stories=[story],
        study_plan=[plan],
    )


@patch("app.api.routes.resumes.get_llm_service")
def test_interview_prep_without_resume(mock_get_llm, client):
    """JD-only interview prep should succeed without a session_id."""
    mock_service = MagicMock()
    mock_service.prepare_interview = AsyncMock(return_value=_full_mock_result())
    mock_get_llm.return_value = mock_service

    response = client.post(
        f"{settings.API_PREFIX}/resumes/interview-prep",
        json={"job_description": SAMPLE_JD, "job_title": "产品研发实习生"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["data"]["role_summary"]
    assert data["data"]["questions"][0]["question"] == "How do you write a PRD?"
    assert data["data"]["skill_gaps"][0]["status"] == "unverified"
    mock_service.prepare_interview.assert_awaited_once()


@patch("app.api.routes.resumes.get_llm_service")
@patch("app.api.routes.resumes.get_resume_content", new_callable=AsyncMock)
def test_interview_prep_with_resume(mock_get_content, mock_get_llm, client):
    """Personalized interview prep should load resume content when session_id is set."""
    mock_get_content.return_value = "Jane Doe\nBuilt a React + FastAPI campus project."
    mock_service = MagicMock()
    mock_service.prepare_interview = AsyncMock(return_value=_full_mock_result())
    mock_get_llm.return_value = mock_service

    response = client.post(
        f"{settings.API_PREFIX}/resumes/interview-prep",
        json={
            "session_id": "test-session-123",
            "job_description": SAMPLE_JD,
            "company_name": "Example Co",
        },
    )

    assert response.status_code == 200
    mock_get_content.assert_awaited_once_with("test-session-123")
    assert response.json()["data"]["self_intro"] == "Self intro"


def test_interview_prep_requires_job_description(client):
    response = client.post(
        f"{settings.API_PREFIX}/resumes/interview-prep",
        json={"job_description": "   "},
    )

    assert response.status_code == 400
    assert "Job description is required" in response.json()["detail"]


def test_interview_prep_rejects_short_jd(client):
    response = client.post(
        f"{settings.API_PREFIX}/resumes/interview-prep",
        json={"job_description": "too short"},
    )

    assert response.status_code == 400
    assert "too short" in response.json()["detail"]


class TestInterviewPrepParsing:
    def setup_method(self):
        self.service = LLMService(provider=MagicMock())

    def test_parse_valid_json(self):
        result = self.service._parse_interview_prep(MOCK_INTERVIEW_JSON)
        assert isinstance(result, InterviewPrepResult)
        assert "双修" in result.role_summary
        assert result.questions[0].category == "product"
        assert result.skill_gaps[0].status == "unverified"
        assert result.study_plan[0].priority == "high"

    def test_normalizes_unknown_enums(self):
        payload = """
        {
          "role_summary": "A role",
          "self_intro": "Hello",
          "skill_gaps": [{"skill": "SQL", "status": "maybe", "why_it_matters": "x", "how_to_prepare": "y"}],
          "questions": [{
            "category": "unknown",
            "difficulty": "extreme",
            "question": "What is REST?",
            "intent": "API knowledge",
            "suggested_answer": "Resources and verbs.",
            "follow_ups": []
          }],
          "study_plan": [{"topic": "Git", "priority": "urgent", "actions": ["learn commit"]}]
        }
        """
        result = self.service._parse_interview_prep(payload)
        assert result.skill_gaps[0].status == "unverified"
        assert result.questions[0].category == "behavioral"
        assert result.questions[0].difficulty == "medium"
        assert result.study_plan[0].priority == "medium"

    def test_empty_payload_raises(self):
        try:
            self.service._parse_interview_prep("not json at all")
            assert False, "Expected LLMResponseError"
        except LLMResponseError:
            pass
