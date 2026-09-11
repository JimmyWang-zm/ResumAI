import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Sidebar from '../components/Sidebar'

describe('Sidebar interview prep action', () => {
  const baseProps = {
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    onCompanyNameChange: jest.fn(),
    onJobTitleChange: jest.fn(),
    onJobDescriptionChange: jest.fn(),
    onFileSelect: jest.fn(),
    onRemoveFile: jest.fn(),
    onUpload: jest.fn(),
    onAnalyze: jest.fn(),
    onPrepareInterview: jest.fn(),
    onClearSession: jest.fn(),
    isOpen: true,
  }

  test('disables prepare interview until a JD is present', () => {
    render(<Sidebar {...baseProps} canPrepareInterview={false} />)

    expect(screen.getByRole('button', { name: /Prepare Interview/i })).toBeDisabled()
    expect(screen.getByText(/Paste a job description to generate interview prep/i)).toBeInTheDocument()
  })

  test('calls onPrepareInterview when enabled', () => {
    render(<Sidebar {...baseProps} canPrepareInterview />)

    fireEvent.click(screen.getByRole('button', { name: /Prepare Interview/i }))
    expect(baseProps.onPrepareInterview).toHaveBeenCalled()
  })
})
