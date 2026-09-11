import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'

const CATEGORY_LABELS = {
  product: 'Product',
  technical_frontend: 'Frontend',
  technical_backend: 'Backend',
  data: 'Data',
  behavioral: 'Behavioral',
  project: 'Project',
  system: 'System & Tools',
}

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
}

const STATUS_STYLES = {
  matched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  missing: 'bg-rose-50 text-rose-700 border-rose-200',
  unverified: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS = {
  matched: 'Matched',
  partial: 'Partial',
  missing: 'Missing',
  unverified: 'Unverified',
}

function formatPrepAsText(data) {
  const lines = ['# Interview Prep', '']
  if (data.role_summary) {
    lines.push('## Role Snapshot', data.role_summary, '')
  }
  if (data.self_intro) {
    lines.push('## Self Introduction', data.self_intro, '')
  }
  if (data.questions?.length) {
    lines.push('## Likely Questions')
    data.questions.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.question}`)
      if (item.intent) lines.push(`   Intent: ${item.intent}`)
      if (item.suggested_answer) lines.push(`   Answer: ${item.suggested_answer}`)
      lines.push('')
    })
  }
  if (data.questions_to_ask?.length) {
    lines.push('## Questions To Ask')
    data.questions_to_ask.forEach((item) => lines.push(`- ${item}`))
    lines.push('')
  }
  return lines.join('\n').trim()
}

function InterviewPrep({ data }) {
  const [copied, setCopied] = useState(false)
  const groupedQuestions = useMemo(() => {
    const groups = {}
    ;(data?.questions || []).forEach((question) => {
      const key = question.category || 'behavioral'
      if (!groups[key]) groups[key] = []
      groups[key].push(question)
    })
    return groups
  }, [data])

  if (!data) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatPrepAsText(data))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
        >
          {copied ? 'Copied' : 'Copy prep notes'}
        </button>
      </div>

      {data.role_summary && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Role Snapshot</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{data.role_summary}</p>
          {(data.must_have_skills?.length > 0 || data.nice_to_have_skills?.length > 0) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.must_have_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Must-have</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.must_have_skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.nice_to_have_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Nice-to-have</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.nice_to_have_skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {data.self_intro && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">1-Minute Self Introduction</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{data.self_intro}</p>
        </section>
      )}

      {data.skill_gaps?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Skill Checklist</h2>
          <div className="space-y-3">
            {data.skill_gaps.map((gap, index) => (
              <div key={`${gap.skill}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[gap.status] || STATUS_STYLES.unverified}`}>
                    {STATUS_LABELS[gap.status] || 'Unverified'}
                  </span>
                  <h3 className="text-sm font-medium text-gray-800">{gap.skill}</h3>
                </div>
                {gap.why_it_matters && <p className="text-sm text-gray-600 mb-1">{gap.why_it_matters}</p>}
                {gap.how_to_prepare && <p className="text-sm text-indigo-700">{gap.how_to_prepare}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.questions?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Likely Interview Questions</h2>
          <div className="space-y-5">
            {Object.entries(groupedQuestions).map(([category, questions]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="space-y-3">
                  {questions.map((item, index) => (
                    <details key={`${category}-${index}`} className="border border-gray-200 rounded-lg p-4 group" open={index === 0}>
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-gray-800">{item.question}</p>
                          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${DIFFICULTY_STYLES[item.difficulty] || DIFFICULTY_STYLES.medium}`}>
                            {item.difficulty || 'medium'}
                          </span>
                        </div>
                      </summary>
                      <div className="mt-3 space-y-2">
                        {item.intent && (
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-500 mb-1">Interviewer intent</p>
                            <p className="text-sm text-gray-700">{item.intent}</p>
                          </div>
                        )}
                        {item.suggested_answer && (
                          <div className="bg-indigo-50 rounded p-2">
                            <p className="text-xs text-indigo-600 mb-1">Suggested answer</p>
                            <p className="text-sm text-indigo-900 whitespace-pre-line">{item.suggested_answer}</p>
                          </div>
                        )}
                        {item.follow_ups?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Possible follow-ups</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {item.follow_ups.map((followUp) => (
                                <li key={followUp} className="text-sm text-gray-700">{followUp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.project_stories?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">STAR Project Stories</h2>
          <div className="space-y-4">
            {data.project_stories.map((story, index) => (
              <div key={`${story.title}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{story.title || `Story ${index + 1}`}</h3>
                <dl className="space-y-2 text-sm">
                  {story.situation && (
                    <div>
                      <dt className="font-medium text-gray-500">Situation</dt>
                      <dd className="text-gray-700">{story.situation}</dd>
                    </div>
                  )}
                  {story.task && (
                    <div>
                      <dt className="font-medium text-gray-500">Task</dt>
                      <dd className="text-gray-700">{story.task}</dd>
                    </div>
                  )}
                  {story.action && (
                    <div>
                      <dt className="font-medium text-gray-500">Action</dt>
                      <dd className="text-gray-700">{story.action}</dd>
                    </div>
                  )}
                  {story.result && (
                    <div>
                      <dt className="font-medium text-gray-500">Result</dt>
                      <dd className="text-gray-700">{story.result}</dd>
                    </div>
                  )}
                  {story.jd_alignment && (
                    <div className="bg-blue-50 rounded p-2">
                      <dt className="text-xs text-blue-600 mb-1">JD alignment</dt>
                      <dd className="text-sm text-blue-800">{story.jd_alignment}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.study_plan?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Study Plan</h2>
          <ol className="space-y-3">
            {data.study_plan.map((item, index) => (
              <li key={`${item.topic}-${index}`} className="flex items-start">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.topic}
                    {item.priority && (
                      <span className="ml-2 text-xs font-normal text-gray-500 capitalize">{item.priority} priority</span>
                    )}
                  </p>
                  {item.actions?.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      {item.actions.map((action) => (
                        <li key={action} className="text-sm text-gray-600">{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.questions_to_ask?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Questions To Ask Them</h2>
          <ul className="space-y-2">
            {data.questions_to_ask.map((item) => (
              <li key={item} className="text-sm text-gray-700 leading-relaxed">• {item}</li>
            ))}
          </ul>
        </section>
      )}

      {data.interview_format_tips?.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Interview Tips</h2>
          <ul className="space-y-2">
            {data.interview_format_tips.map((item) => (
              <li key={item} className="text-sm text-gray-700 leading-relaxed">• {item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

InterviewPrep.propTypes = {
  data: PropTypes.shape({
    role_summary: PropTypes.string,
    self_intro: PropTypes.string,
    must_have_skills: PropTypes.arrayOf(PropTypes.string),
    nice_to_have_skills: PropTypes.arrayOf(PropTypes.string),
    skill_gaps: PropTypes.arrayOf(PropTypes.shape({
      skill: PropTypes.string,
      status: PropTypes.string,
      why_it_matters: PropTypes.string,
      how_to_prepare: PropTypes.string,
    })),
    questions: PropTypes.arrayOf(PropTypes.shape({
      category: PropTypes.string,
      difficulty: PropTypes.string,
      question: PropTypes.string,
      intent: PropTypes.string,
      suggested_answer: PropTypes.string,
      follow_ups: PropTypes.arrayOf(PropTypes.string),
    })),
    project_stories: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      situation: PropTypes.string,
      task: PropTypes.string,
      action: PropTypes.string,
      result: PropTypes.string,
      jd_alignment: PropTypes.string,
    })),
    questions_to_ask: PropTypes.arrayOf(PropTypes.string),
    study_plan: PropTypes.arrayOf(PropTypes.shape({
      topic: PropTypes.string,
      priority: PropTypes.string,
      actions: PropTypes.arrayOf(PropTypes.string),
    })),
    interview_format_tips: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default InterviewPrep
