import { useState } from 'react';
import { CandidateOutreachRecord } from '../types';
import {
  Copy,
  Check,
  Tag,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Users,
  Eye,
  RotateCcw,
  Zap,
  Download,
  BellRing,
  ShieldAlert,
  Send,
  UserPlus,
} from 'lucide-react';

interface OutreachRecordCardProps {
  key?: string | number;
  record: CandidateOutreachRecord;
  index: number;
}

export default function OutreachRecordCard({ record, index }: OutreachRecordCardProps) {
  const [copiedPrimary, setCopiedPrimary] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedPlanB, setCopiedPlanB] = useState(false);
  const [showInMailPreview, setShowInMailPreview] = useState(false);
  const [simulatedObjection, setSimulatedObjection] = useState<string | null>(null);

  // Calculate word count for primary message (<75 words limit)
  const primaryWords = record.outreach_payload.primary_linkedin_message.trim().split(/\s+/).filter(Boolean);
  const primaryWordCount = primaryWords.length;
  const isUnder75Words = primaryWordCount <= 75;

  // Calculate char count for connection request note (<200 chars limit)
  const noteCharCount = record.outreach_payload.connection_request_note.length;
  const isUnder200Chars = noteCharCount <= 200;

  const handleCopyPrimary = () => {
    navigator.clipboard.writeText(record.outreach_payload.primary_linkedin_message);
    setCopiedPrimary(true);
    setTimeout(() => setCopiedPrimary(false), 2000);
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(record.outreach_payload.connection_request_note);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleCopyPlanB = () => {
    navigator.clipboard.writeText(record.outreach_payload.plan_b_friction_dm);
    setCopiedPlanB(true);
    setTimeout(() => setCopiedPlanB(false), 2000);
  };

  const handleDownloadSingleJson = () => {
    const fileName = `${record.candidate_name.replace(/\s+/g, '_').toLowerCase()}_outreach.json`;
    const jsonString = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const personaConfig = () => {
    const tag = record.profile_analysis.persona_tag;
    if (tag === 'Zero-Experience Aspiring Founder') {
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
      };
    }
    if (tag === 'Active Hacker/Builder') {
      return {
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        dot: 'bg-blue-500',
      };
    }
    return {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      dot: 'bg-emerald-500',
    };
  };

  const modeConfig = () => {
    const mode = record.processed_mode;
    if (mode === 'RECRUITER_OUTBOUND') {
      return {
        label: 'Mode A: Recruiter Outbound',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Zap,
      };
    }
    if (mode === 'PARTICIPANT_ALERT') {
      return {
        label: 'Mode B: Participant Inbound Alert',
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: BellRing,
      };
    }
    return {
      label: 'Mode C: Plan B Friction Test',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: ShieldAlert,
    };
  };

  const pStyle = personaConfig();
  const mStyle = modeConfig();
  const ModeIcon = mStyle.icon;

  return (
    <div
      id={`outreach-record-${index}`}
      className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden transition-all hover:border-stone-300"
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-900 text-white font-semibold text-xs flex items-center justify-center shadow-2xs">
            {record.candidate_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">{record.candidate_name}</h3>
              <span
                className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full border ${pStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                {record.profile_analysis.persona_tag}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full border ${mStyle.badge}`}
              >
                <ModeIcon className="w-3 h-3" />
                {mStyle.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xs text-stone-500 font-medium">Record #{index + 1}</span>
              <span className="text-stone-300">•</span>
              <span className="text-2xs font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                {record.outreach_payload.recommended_platform_tag}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`download-single-json-${index}-btn`}
            type="button"
            onClick={handleDownloadSingleJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
            title={`Download ${record.candidate_name.replace(/\s+/g, '_').toLowerCase()}_outreach.json`}
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            Save .json
          </button>

          <button
            id={`toggle-preview-${index}-btn`}
            type="button"
            onClick={() => setShowInMailPreview(!showInMailPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            {showInMailPreview ? 'Standard Cards' : 'LinkedIn DM Preview'}
          </button>
        </div>
      </div>

      {showInMailPreview ? (
        /* Realistic LinkedIn DM / InMail Mockup Preview */
        <div className="p-4 sm:p-6 bg-stone-100/70 space-y-4">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
            {/* InMail Header */}
            <div className="bg-[#0a66c2] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  in
                </div>
                <div>
                  <div className="text-xs font-semibold">LinkedIn InMail / Message</div>
                  <div className="text-2xs text-blue-100">To: {record.candidate_name}</div>
                </div>
              </div>
              <span className="text-2xs bg-white/20 px-2 py-0.5 rounded text-white">
                {record.processed_mode}
              </span>
            </div>

            {/* Connection Request Preview */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <UserPlus className="w-3 h-3 text-[#0a66c2]" /> Connection Note ({noteCharCount}/200 chars)
                </span>
                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="text-blue-600 hover:text-blue-800 text-2xs font-medium inline-flex items-center gap-0.5"
                >
                  {copiedNote ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                  {copiedNote ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-2 bg-white rounded border border-stone-200 text-2xs text-stone-800 italic">
                "{record.outreach_payload.connection_request_note}"
              </div>
            </div>

            {/* InMail Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  RO
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-stone-900">
                      {record.processed_mode === 'PARTICIPANT_ALERT' ? 'Platform Alert Bot' : 'Recruiter / Founder Lead'}
                    </span>
                    <span className="text-2xs text-stone-400">Just now</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs text-stone-800 leading-relaxed whitespace-pre-line font-sans">
                    {record.outreach_payload.primary_linkedin_message}
                  </div>
                  <div className="flex items-center justify-between text-2xs text-stone-400 pt-1">
                    <span className={isUnder75Words ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                      {primaryWordCount} words (&lt;75 limit {isUnder75Words ? 'passed ✓' : 'exceeded'})
                    </span>
                    <button
                      onClick={handleCopyPrimary}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      {copiedPrimary ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedPrimary ? 'Copied' : 'Copy Primary'}
                    </button>
                  </div>
                </div>
              </div>

              {simulatedObjection && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0">
                    {record.candidate_name[0]}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-stone-900">{record.candidate_name}</span>
                      <span className="text-2xs text-stone-400">Candidate feedback</span>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-xs text-stone-700 italic">
                      "{simulatedObjection}"
                    </div>
                  </div>
                </div>
              )}

              {simulatedObjection && (
                <div className="flex items-start gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-full bg-purple-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    RO
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-stone-900">Plan B Follow-Up (Friction Test)</span>
                      <span className="text-2xs text-stone-400">Friction Loop</span>
                    </div>
                    <div className="bg-purple-50/70 border border-purple-200 p-2.5 rounded-lg text-xs text-stone-800 leading-relaxed">
                      {record.outreach_payload.plan_b_friction_dm}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive objection simulator within preview */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-2xs">
              <span className="text-stone-500 font-medium">Simulate response:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSimulatedObjection("I'm overwhelmed with exams right now, maybe next semester.")}
                  className="px-2 py-1 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-100"
                >
                  "Exams"
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedObjection("I don't think I know enough to build anything real.")}
                  className="px-2 py-1 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-100"
                >
                  "Imposter"
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedObjection("[Candidate ghosted / zero response for 48h]")}
                  className="px-2 py-1 bg-white border border-stone-300 rounded text-stone-700 hover:bg-stone-100"
                >
                  "Ghosted"
                </button>
                {simulatedObjection && (
                  <button
                    type="button"
                    onClick={() => setSimulatedObjection(null)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                    title="Clear simulation"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Detailed Analysis Grid */
        <div className="p-4 sm:p-5 space-y-4">
          {/* Top Row: Standout Project Signal + Perceived Barrier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                1. Standout Project or Signal (Citable Evidence)
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                {record.profile_analysis.standout_project_or_signal}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-rose-100 bg-rose-50/30">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                2. Perceived Barrier / Imposter Gap
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                {record.profile_analysis.perceived_barrier}
              </p>
            </div>
          </div>

          {/* Primary Outreach Message (<75 words) */}
          <div className="border border-stone-200 rounded-lg p-4 bg-white shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  3. Primary LinkedIn Message
                </span>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                    isUnder75Words
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {primaryWordCount} / 75 words {isUnder75Words ? '✓ Passed' : '(Exceeds Limit)'}
                </span>
              </div>

              <button
                id={`copy-primary-${index}-btn`}
                type="button"
                onClick={handleCopyPrimary}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
              >
                {copiedPrimary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-md border border-stone-200/80 text-xs text-stone-800 leading-relaxed font-sans whitespace-pre-line">
              {record.outreach_payload.primary_linkedin_message}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-2xs text-stone-500 pt-0.5">
              {record.processed_mode === 'RECRUITER_OUTBOUND' && (
                <>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded font-medium">
                    ⚡ Disruptive Opener
                  </span>
                  <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded font-medium">
                    🚀 'Just Do Things' Tone
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/60 px-2 py-0.5 rounded font-medium">
                    <Users className="w-3 h-3 text-blue-600" /> Buddy / Peer Match Offer
                  </span>
                </>
              )}
              {record.processed_mode === 'PARTICIPANT_ALERT' && (
                <>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/60 px-2 py-0.5 rounded font-medium">
                    <BellRing className="w-3 h-3 text-blue-600" /> Value-First Event Drop
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded font-medium">
                    🔗 [EVENT_REGISTRATION_LINK]
                  </span>
                </>
              )}
              {record.processed_mode === 'OBJECTION_FOLLOWUP' && (
                <>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200/60 px-2 py-0.5 rounded font-medium">
                    <ShieldAlert className="w-3 h-3 text-purple-600" /> Friction Diagnostic
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Connection Request Note (<200 chars) */}
          <div className="border border-stone-200 rounded-lg p-3.5 bg-stone-50/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <UserPlus className="w-3.5 h-3.5 text-stone-600" />
                  4. Connection Request Note
                </span>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                    isUnder200Chars
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {noteCharCount} / 200 chars {isUnder200Chars ? '✓ Passed' : '(Exceeds limit)'}
                </span>
              </div>

              <button
                id={`copy-note-${index}-btn`}
                type="button"
                onClick={handleCopyNote}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors"
              >
                {copiedNote ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Note</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 bg-white rounded-md border border-stone-200 text-xs text-stone-800 leading-relaxed font-sans">
              {record.outreach_payload.connection_request_note}
            </div>
          </div>

          {/* Plan B Objection Follow-Up */}
          <div className="border border-stone-200 rounded-lg p-4 bg-stone-50/40 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                5. Plan B / Friction Follow-Up (Asking 'Why?' Blocker Test)
              </span>

              <button
                id={`copy-planb-${index}-btn`}
                type="button"
                onClick={handleCopyPlanB}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors"
              >
                {copiedPlanB ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Follow-Up</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-white rounded-md border border-stone-200 text-xs text-stone-700 leading-relaxed font-sans whitespace-pre-line">
              {record.outreach_payload.plan_b_friction_dm}
            </div>

            <div className="text-2xs text-stone-500">
              💡 Sent if candidate ghosts after 48h or states hesitation. Zero guilt, extracts real objection for platform learnings.
            </div>
          </div>

          {/* CRM Platform Tag */}
          <div className="pt-1 flex items-center justify-between border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>Recommended CRM Routing:</span>
              <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                {record.outreach_payload.recommended_platform_tag}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSingleJson}
              className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-stone-400" />
              Download {record.candidate_name.replace(/\s+/g, '_').toLowerCase()}_outreach.json
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

