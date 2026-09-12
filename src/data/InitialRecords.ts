import { CandidateOutreachRecord } from '../types';

export const INITIAL_OUTREACH_RECORDS: CandidateOutreachRecord[] = [
  {
    candidate_name: 'Marcus Vance',
    processed_mode: 'RECRUITER_OUTBOUND',
    profile_analysis: {
      standout_project_or_signal:
        'Built an automated soil moisture monitor using ESP32 and C++',
      perceived_barrier:
        'Imposter syndrome around lack of official hackathon experience',
      persona_tag: 'Zero-Experience Aspiring Founder',
    },
    outreach_payload: {
      primary_linkedin_message:
        "Hey Marcus, saw your ESP32 soil monitor—most students wait around for classes instead of actually building hardware. We're hosting the NextGen Hardware Sprint this Saturday with free dev kits and founder mentors. Zero formal hackathon experience needed, and you can bring a friend or get paired with a builder buddy on arrival. Open to grabbing an invite?",
      connection_request_note:
        "Hey Marcus, loved your ESP32 project. We're gathering young builders for a sprint this weekend—would love to connect and share an invite!",
      plan_b_friction_dm:
        'Totally get it Marcus, zero worries! Just out of curiosity, is it bad timing with exams, or not quite the kind of projects you want to build right now?',
      recommended_platform_tag: 'Warm - Needs Buddy',
    },
  },
  {
    candidate_name: 'Maya Lin',
    processed_mode: 'RECRUITER_OUTBOUND',
    profile_analysis: {
      standout_project_or_signal:
        'Built a Python Discord study bot and qualified for regional math contest',
      perceived_barrier:
        'Zero startup experience; fears lack of production software background or CS degree',
      persona_tag: 'Zero-Experience Aspiring Founder',
    },
    outreach_payload: {
      primary_linkedin_message:
        "Hey Maya, saw your Discord study bot in Python—most seniors think you need 4 years of CS or a FAANG internship before building real tech. That's a myth. At NextGen Sprint, zero-experience builders team up with mentors to ship in 48 hours. Bring a friend or we'll pair you with an awesome peer buddy on day one. Want an invite?",
      connection_request_note:
        "Hey Maya, loved your Python Discord study bot! We're gathering young builders for a sprint this weekend—would love to connect and share an invite!",
      plan_b_friction_dm:
        "Totally get it Maya, zero pressure! Quick question if you don't mind—was it bad timing with school, or did it feel a bit outside your comfort zone? Would love your take.",
      recommended_platform_tag: 'Warm - Needs Buddy',
    },
  },
  {
    candidate_name: 'Jordan K. Patel',
    processed_mode: 'PARTICIPANT_ALERT',
    profile_analysis: {
      standout_project_or_signal:
        'Scaled tech newsletter & TikTok to 42k followers; 2,500+ Notion downloads',
      perceived_barrier:
        'Isolated from technical co-founders; hesitating on college vs immediate startup launch',
      persona_tag: 'Curious Explorer',
    },
    outreach_payload: {
      primary_linkedin_message:
        "Hey Jordan! Spots just dropped for NextGen Founder Sprint. We're pairing viral product creators with hardcore engineers to launch venture-backed projects in a weekend. Priority passes are open: [EVENT_REGISTRATION_LINK]. Want to register solo or get matched with a technical co-founder on arrival?",
      connection_request_note:
        "Hey Jordan, saw your 42k growth workflows! NextGen Founder Sprint priority registration is live: [EVENT_REGISTRATION_LINK]. Let's connect!",
      plan_b_friction_dm:
        'No stress Jordan! Quick check: is timing with finals tight, or are you heads-down on solo content projects right now?',
      recommended_platform_tag: 'Alert Sent - Pending RSVP',
    },
  },
  {
    candidate_name: 'Chloe Zhang',
    processed_mode: 'OBJECTION_FOLLOWUP',
    profile_analysis: {
      standout_project_or_signal:
        "Top 8% LeetCode contest rating (280+ solved); Dean's Honor List with 3.98 GPA",
      perceived_barrier:
        'Over-indexed on academic coursework; imposter syndrome around lack of deployed production repos',
      persona_tag: 'Active Hacker/Builder',
    },
    outreach_payload: {
      primary_linkedin_message:
        "Totally understand Chloe, appreciate the candid heads-up! Zero pressure at all. Just out of curiosity, was it heavy midterm coursework, or did live 48-hour sprint building feel outside your comfort zone? Always trying to make these formats accessible for students.",
      connection_request_note:
        "Hey Chloe, thanks for the update! Let's stay in touch on LinkedIn—excited to see where you take your software engineering journey.",
      plan_b_friction_dm:
        "Fair enough Chloe! If there's a specific format or mentor track that would make attending an easy yes in the future, would love your thoughts.",
      recommended_platform_tag: 'Declined - Friction Captured',
    },
  },
];


