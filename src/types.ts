export type ProcessedMode =
  | 'RECRUITER_OUTBOUND'
  | 'PARTICIPANT_ALERT'
  | 'OBJECTION_FOLLOWUP';

export type PersonaTag =
  | 'Zero-Experience Aspiring Founder'
  | 'Active Hacker/Builder'
  | 'Curious Explorer';

export interface ProfileAnalysis {
  standout_project_or_signal: string;
  perceived_barrier: string;
  persona_tag: PersonaTag;
}

export interface OutreachPayload {
  primary_linkedin_message: string;
  connection_request_note: string;
  plan_b_friction_dm: string;
  recommended_platform_tag: string;
}

export interface CandidateOutreachRecord {
  candidate_name: string;
  processed_mode: ProcessedMode;
  profile_analysis: ProfileAnalysis;
  outreach_payload: OutreachPayload;
}

export interface CandidateInput {
  id: string;
  name: string;
  school_or_grade: string;
  headline: string;
  raw_projects_and_experience: string;
  skills_and_interests: string[];
  mode: ProcessedMode;
  objection_reason?: string;
}

export interface EventDetails {
  title: string;
  theme: string;
  date: string;
  perks: string;
}
