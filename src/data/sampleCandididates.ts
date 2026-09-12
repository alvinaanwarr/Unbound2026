import { CandidateInput } from '../types';

export const SAMPLE_CANDIDATES: CandidateInput[] = [
  {
    id: 'sample-1',
    name: 'Marcus Vance',
    school_or_grade: '1st Year CS Undergrad',
    headline: 'Freshman exploring hardware and embedded systems | C++ Enthusiast',
    raw_projects_and_experience:
      'Built an automated soil moisture monitor using ESP32 and C++. No official hackathon participation yet; spends weekends tinkering with microcontrollers.',
    skills_and_interests: ['ESP32', 'C++', 'IoT', 'Hardware Prototyping', 'Embedded Systems'],
    mode: 'RECRUITER_OUTBOUND',
  },
  {
    id: 'sample-2',
    name: 'Maya Lin',
    school_or_grade: 'Grade 12 Senior',
    headline: 'Senior passionate about algorithmic math and competitive programming | Learning Python',
    raw_projects_and_experience:
      'Qualified for regional math contest, built a simple Discord study bot in Python. No startup or hackathon experience.',
    skills_and_interests: ['Python', 'Discord API', 'Competitive Math', 'Debate Club'],
    mode: 'RECRUITER_OUTBOUND',
  },
  {
    id: 'sample-3',
    name: 'Jordan K. Patel',
    school_or_grade: 'Grade 12 Senior (Incoming Freshman)',
    headline: 'Consumer tech enthusiast & viral distribution builder | Micro-SaaS Explorer',
    raw_projects_and_experience:
      'Scaled tech newsletter & TikTok channels to 42k followers, launched Notion workflow templates with 2,500+ downloads. Looking to pair up with technical builders.',
    skills_and_interests: ['Organic Growth', 'Notion', 'Distribution', 'Micro-SaaS', 'TikTok'],
    mode: 'PARTICIPANT_ALERT',
  },
  {
    id: 'sample-4',
    name: 'Chloe Zhang',
    school_or_grade: '1st Year Software Engineering',
    headline: "Dean's Honor List | 3.98 GPA | 280+ LeetCode Solved (Top 8% Contest Rating)",
    raw_projects_and_experience:
      'Mastered algorithmic data structures and competitive coding. Expressed hesitation about hackathons due to lack of deployed full-stack web applications.',
    skills_and_interests: ['Algorithms', 'Data Structures', 'C++', 'Python', 'Systems'],
    mode: 'OBJECTION_FOLLOWUP',
    objection_reason: 'Hesitant about attending: "I do not have deployed production web apps and feel unprepared for 48hr team building."',
  },
];
