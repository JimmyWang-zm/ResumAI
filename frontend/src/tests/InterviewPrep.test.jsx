import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InterviewPrep from '../components/InterviewPrep'

const sampleData = {
  role_summary: '产品+研发双修实习生，需要独立完成需求到上线。',
  self_intro: '我是2027届计算机专业学生。',
  must_have_skills: ['Figma', 'SQL'],
  nice_to_have_skills: ['Git'],
  skill_gaps: [
    {
      skill: 'Figma',
      status: 'unverified',
      why_it_matters: 'JD 要求会画原型',
      how_to_prepare: '准备一个可演示的原型',
    },
  ],
  questions: [
    {
      category: 'product',
      difficulty: 'medium',
      question: '如何写一份 PRD？',
      intent: '考察产品表达能力',
      suggested_answer: '先讲背景目标，再讲流程和指标。',
      follow_ups: ['如何验收？'],
    },
  ],
  project_stories: [
    {
      title: '全栈 Demo',
      situation: '独立做一个产品',
      task: '完成需求到上线',
      action: '调研、原型、开发、复盘',
      result: '完成可演示 Demo',
      jd_alignment: '独立完成完整产品 Demo',
    },
  ],
  questions_to_ask: ['这个岗位入职后第一个月会做什么？'],
  study_plan: [
    {
      topic: 'PRD 与原型',
      priority: 'high',
      actions: ['用 Figma 画一个核心流程'],
    },
  ],
  interview_format_tips: ['准备一个 3 分钟项目演示'],
}

describe('InterviewPrep Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })
  })

  test('renders role snapshot, questions, and study plan', () => {
    render(<InterviewPrep data={sampleData} />)

    expect(screen.getByText(/Role Snapshot/i)).toBeInTheDocument()
    expect(screen.getByText(/产品\+研发双修实习生/i)).toBeInTheDocument()
    expect(screen.getByText(/如何写一份 PRD/i)).toBeInTheDocument()
    expect(screen.getByText(/Study Plan/i)).toBeInTheDocument()
    expect(screen.getByText(/Questions To Ask Them/i)).toBeInTheDocument()
  })

  test('copies prep notes to clipboard', async () => {
    render(<InterviewPrep data={sampleData} />)

    fireEvent.click(screen.getByRole('button', { name: /Copy prep notes/i }))

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(await screen.findByText(/Copied/i)).toBeInTheDocument()
  })
})
