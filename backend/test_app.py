import json
import unittest
from types import SimpleNamespace

from app import (
    Analysis,
    AnalysisReportRequest,
    _request_analysis,
    download_report,
)


class AnalysisRetryTests(unittest.TestCase):
    def test_accepts_usable_response_when_tail_sections_are_missing(self):
        response = {
            'match_score': 74,
            'score_summary': 'A strong match with minor gaps.',
            'score_reasons': [
                {'category': 'Skills', 'points': 30, 'maximum': 40, 'reason': 'Most skills match.'},
                {'category': 'Experience', 'points': 20, 'maximum': 25, 'reason': 'Relevant experience.'},
                {'category': 'Education', 'points': 12, 'maximum': 15, 'reason': 'Relevant education.'},
                {'category': 'Evidence', 'points': 7, 'maximum': 10, 'reason': 'Clear evidence.'},
                {'category': 'Alignment', 'points': 5, 'maximum': 10, 'reason': 'Partial alignment.'},
            ],
            'matching_skills': ['Python', 'Docker'],
            'skill_gaps': [],
            'rewritten_bullets': [],
            'rewrite_warnings': [],
            'strengths': ['Strong technical foundation'],
            'education_match': {
                'status': 'partial',
                'summary': 'Education is relevant.',
                'evidence': 'The resume mentions a degree.',
                'role_requirement': 'Relevant degree',
            },
            'experience_match': {
                'status': 'matched',
                'summary': 'Experience is relevant.',
                'evidence': 'The resume lists relevant projects.',
                'role_requirement': 'Relevant experience',
            },
            'education_gaps': [],
            'education_alternatives': [],
            'priority_improvements': ['Clarify project outcomes'] * 5,
            'resume_section_feedback': [],
        }

        class FakeCompletions:
            def create(self, **kwargs):
                return SimpleNamespace(
                    choices=[SimpleNamespace(
                        message=SimpleNamespace(content=json.dumps(response))
                    )]
                )

        client = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))
        analysis = _request_analysis(client, 'test-model', [])

        self.assertEqual(analysis.match_score, 74)
        self.assertEqual(analysis.interview_questions, [])
        self.assertEqual(analysis.application_checklist, [])
        self.assertEqual(analysis.next_steps, [])
        self.assertIn('Verify the source resume', analysis.honesty_check)

    def test_retries_when_required_fields_are_missing(self):
        incomplete = {
            'match_score': 68,
            'score_summary': 'A reasonable match.',
            'score_reasons': [
                {'category': 'Skills', 'points': 27, 'maximum': 40, 'reason': 'Some overlap.'},
                {'category': 'Experience', 'points': 17, 'maximum': 25, 'reason': 'Relevant projects.'},
                {'category': 'Education', 'points': 12, 'maximum': 15, 'reason': 'Relevant degree.'},
                {'category': 'Evidence', 'points': 6, 'maximum': 10, 'reason': 'Some evidence.'},
                {'category': 'Alignment', 'points': 6, 'maximum': 10, 'reason': 'Partial alignment.'},
            ],
            'matching_skills': [],
            'skill_gaps': [],
            'rewritten_bullets': [],
        }
        complete = {
            **incomplete,
            'rewrite_warnings': ['Do not add metrics that are not present in the resume.'],
            'strengths': ['Relevant project experience'],
            'education_match': {
                'status': 'partial',
                'summary': 'Degree area is relevant but the exact requirement needs verification.',
                'evidence': 'The resume lists a degree.',
                'role_requirement': 'Relevant degree',
            },
            'experience_match': {
                'status': 'matched',
                'summary': 'Projects provide relevant experience.',
                'evidence': 'The resume lists a relevant project.',
                'role_requirement': 'Relevant project experience',
            },
            'education_gaps': [],
            'education_alternatives': ['Consider a relevant certification only if the student chooses to complete it.'],
            'priority_improvements': [
                'Add evidence for required tools',
                'Clarify project outcomes',
                'Improve keyword alignment',
                'Strengthen education evidence',
                'Prepare interview examples',
            ],
            'resume_section_feedback': [
                {
                    'section': 'Skills',
                    'assessment': 'The skills section is present.',
                    'recommendation': 'Map skills directly to the job description.',
                }
            ],
            'interview_questions': [
                {
                    'question': 'Describe a project that demonstrates relevant skills.',
                    'why_it_may_be_asked': 'The role emphasizes practical experience.',
                    'answer_focus': 'Use the STAR format and focus on a real project.',
                }
            ],
            'application_checklist': [
                {
                    'item': 'Tailor the resume summary',
                    'completed': False,
                    'priority': 'high',
                }
            ],
            'next_steps': ['Add evidence for required tools'],
            'honesty_check': 'No unsupported qualifications were added.',
        }

        class FakeCompletions:
            def __init__(self):
                self.responses = [incomplete, complete]
                self.requests = []

            def create(self, **kwargs):
                self.requests.append(kwargs)
                response = self.responses.pop(0)
                return SimpleNamespace(
                    choices=[
                        SimpleNamespace(
                            message=SimpleNamespace(content=json.dumps(response))
                        )
                    ]
                )

        completions = FakeCompletions()
        client = SimpleNamespace(chat=SimpleNamespace(completions=completions))

        analysis = _request_analysis(client, 'test-model', [])

        self.assertEqual(len(completions.requests), 2)
        self.assertEqual(analysis.strengths, complete['strengths'])
        self.assertEqual(analysis.next_steps, complete['next_steps'])
        self.assertEqual(analysis.honesty_check, complete['honesty_check'])
        self.assertEqual(len(analysis.priority_improvements), 5)
        self.assertEqual(analysis.education_match.status, 'partial')
        self.assertEqual(len(analysis.interview_questions), 1)
        self.assertIn('strengths', completions.requests[1]['messages'][-1]['content'])

    def test_report_endpoint_creates_pdf_response(self):
        analysis = Analysis.model_validate({
            'match_score': 68,
            'score_summary': 'A reasonable match.',
            'score_reasons': [
                {'category': 'Skills', 'points': 27, 'maximum': 40, 'reason': 'Some overlap.'},
                {'category': 'Experience', 'points': 17, 'maximum': 25, 'reason': 'Relevant projects.'},
                {'category': 'Education', 'points': 12, 'maximum': 15, 'reason': 'Relevant degree.'},
                {'category': 'Evidence', 'points': 6, 'maximum': 10, 'reason': 'Some evidence.'},
                {'category': 'Alignment', 'points': 6, 'maximum': 10, 'reason': 'Partial alignment.'},
            ],
            'matching_skills': ['Python'],
            'skill_gaps': [],
            'rewritten_bullets': [],
            'rewrite_warnings': [],
            'strengths': ['Relevant project experience'],
            'education_match': {
                'status': 'matched',
                'summary': 'Degree appears relevant.',
                'evidence': 'Resume lists a relevant degree.',
                'role_requirement': 'Relevant degree',
            },
            'experience_match': {
                'status': 'matched',
                'summary': 'Projects demonstrate relevant experience.',
                'evidence': 'Resume lists a relevant project.',
                'role_requirement': 'Relevant project experience',
            },
            'education_gaps': [],
            'education_alternatives': [],
            'priority_improvements': ['Clarify outcomes'] * 5,
            'resume_section_feedback': [],
            'interview_questions': [],
            'application_checklist': [],
            'next_steps': ['Prepare examples'],
            'honesty_check': 'No unsupported facts were added.',
        })
        response = download_report(AnalysisReportRequest(
            analysis=analysis,
            job_title='Software Engineer',
            company='Example Company',
        ))
        self.assertEqual(response.media_type, 'application/pdf')
        self.assertIn('careerfit-analysis.pdf', response.headers['content-disposition'])


if __name__ == '__main__':
    unittest.main()
