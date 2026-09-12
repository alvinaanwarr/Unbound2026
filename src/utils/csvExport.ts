import { CandidateOutreachRecord } from '../types';

export function exportToCSV(
  records: CandidateOutreachRecord[],
  filename = 'outreach_pipeline_records.csv'
) {
  const headers = [
    'Candidate Name',
    'Processed Mode',
    'Persona Tag',
    'Standout Project or Signal',
    'Perceived Barrier',
    'Primary LinkedIn Message (<75 words)',
    'Connection Request Note (<200 chars)',
    'Plan B Friction DM (Why blocker)',
    'Recommended Platform Tag',
  ];

  const escapeCSV = (field: string | null | undefined) => {
    if (field === null || field === undefined) return '""';
    const stringified = String(field).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  const rows = records.map((r) => [
    escapeCSV(r.candidate_name),
    escapeCSV(r.processed_mode),
    escapeCSV(r.profile_analysis.persona_tag),
    escapeCSV(r.profile_analysis.standout_project_or_signal),
    escapeCSV(r.profile_analysis.perceived_barrier),
    escapeCSV(r.outreach_payload.primary_linkedin_message),
    escapeCSV(r.outreach_payload.connection_request_note),
    escapeCSV(r.outreach_payload.plan_b_friction_dm),
    escapeCSV(r.outreach_payload.recommended_platform_tag),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

