import { useState } from 'react';
import { CandidateInput, ProcessedMode } from '../types';
import { SAMPLE_CANDIDATES } from '../data/sampleCandidates';
import { Trash2, RotateCcw, UserPlus, Sparkles, FileText, Check, Zap, BellRing, ShieldAlert } from 'lucide-react';

interface CandidateEditorProps {
  candidates: CandidateInput[];
  onChange: (candidates: CandidateInput[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function CandidateEditor({
  candidates,
  onChange,
  onGenerate,
  isLoading,
}: CandidateEditorProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'batch'>('form');
  const [batchText, setBatchText] = useState('');
  const [showBatchSuccess, setShowBatchSuccess] = useState(false);

  const handleAddBlank = () => {
    const newCandidate: CandidateInput = {
      id: `candidate-${Date.now()}`,
      name: '',
      school_or_grade: 'Grade 12 Senior',
      headline: '',
      raw_projects_and_experience: '',
      skills_and_interests: ['TypeScript', 'Startups'],
      mode: 'RECRUITER_OUTBOUND',
    };
    onChange([...candidates, newCandidate]);
  };

  const handleUpdateCandidate = (
    index: number,
    field: keyof CandidateInput,
    value: any
  ) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 1) return;
    const updated = candidates.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleLoadPresets = () => {
    onChange(SAMPLE_CANDIDATES);
  };

  const handleParseBatch = () => {
    if (!batchText.trim()) return;

    try {
      const parsed = JSON.parse(batchText);
      const list = Array.isArray(parsed)
        ? parsed
        : parsed.candidates || parsed.outreach_records || [parsed];
      const converted: CandidateInput[] = list.map((item: any, idx: number) => {
        let skillsArr: string[] = [];
        if (Array.isArray(item.skills_and_interests)) {
          skillsArr = item.skills_and_interests;
        } else if (typeof item.skills_and_interests === 'string') {
          skillsArr = item.skills_and_interests.split(',').map((s: string) => s.trim());
        } else if (item.followed_pages_or_interests) {
          skillsArr = item.followed_pages_or_interests.split(',').map((s: string) => s.trim());
        } else {
          skillsArr = ['Tech', 'Builder'];
        }

        return {
          id: `batch-${Date.now()}-${idx}`,
          name: item.name || item.candidate_name || `Candidate ${idx + 1}`,
          school_or_grade: item.school_or_grade || item.school_grade || 'Grade 12 / Undergrad',
          headline: item.headline || item.linkedin_summary_or_bio || '',
          raw_projects_and_experience:
            item.raw_projects_and_experience || item.experiences_and_activities || '',
          skills_and_interests: skillsArr,
          mode: (item.mode || item.processed_mode || 'RECRUITER_OUTBOUND') as ProcessedMode,
          objection_reason: item.objection_reason || '',
        };
      });
      onChange(converted);
      setShowBatchSuccess(true);
      setTimeout(() => setShowBatchSuccess(false), 2500);
      setActiveTab('form');
    } catch {
      // Fallback: Text block parser
      const blocks = batchText.split(/\n\s*\n/);
      const parsedCandidates: CandidateInput[] = blocks
        .map((block, idx) => {
          const lines = block.split('\n');
          let name = `Candidate ${idx + 1}`;
          let grade = 'Grade 12 / Undergrad';
          let headline = '';
          let exp = '';
          let skills: string[] = ['Tech', 'Startups'];
          let mode: ProcessedMode = 'RECRUITER_OUTBOUND';
          let objection = '';

          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().startsWith('name:')) {
              name = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            } else if (trimmed.toLowerCase().startsWith('grade:')) {
              grade = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            } else if (trimmed.toLowerCase().startsWith('headline:') || trimmed.toLowerCase().startsWith('bio:')) {
              headline = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            } else if (trimmed.toLowerCase().startsWith('projects:') || trimmed.toLowerCase().startsWith('exp:')) {
              exp = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            } else if (trimmed.toLowerCase().startsWith('skills:') || trimmed.toLowerCase().startsWith('interests:')) {
              skills = trimmed
                .substring(trimmed.indexOf(':') + 1)
                .split(',')
                .map((s) => s.trim());
            } else if (trimmed.toLowerCase().startsWith('mode:')) {
              const m = trimmed.substring(trimmed.indexOf(':') + 1).trim();
              if (m === 'PARTICIPANT_ALERT' || m === 'OBJECTION_FOLLOWUP' || m === 'RECRUITER_OUTBOUND') {
                mode = m;
              }
            } else if (trimmed.toLowerCase().startsWith('objection:')) {
              objection = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            }
          });

          return {
            id: `text-batch-${Date.now()}-${idx}`,
            name,
            school_or_grade: grade,
            headline,
            raw_projects_and_experience: exp,
            skills_and_interests: skills,
            mode,
            objection_reason: objection,
          };
        })
        .filter((c) => c.name.trim());

      if (parsedCandidates.length > 0) {
        onChange(parsedCandidates);
        setShowBatchSuccess(true);
        setTimeout(() => setShowBatchSuccess(false), 2500);
        setActiveTab('form');
      }
    }
  };

  return (
    <div id="candidate-editor-card" className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Raw Candidate Profiles
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {candidates.length} candidate{candidates.length === 1 ? '' : 's'} queued
            </span>
          </div>
          <h2 className="text-base font-semibold text-stone-900 mt-1">
            Input Profiles & Engine Mode Selection
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="preset-candidates-btn"
            type="button"
            onClick={handleLoadPresets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
            title="Load benchmark profiles (Marcus Vance, Maya Lin, Jordan Patel, Chloe Zhang)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            Reset Benchmark Presets
          </button>

          <div className="flex bg-stone-200 p-0.5 rounded-lg text-xs">
            <button
              id="tab-form-btn"
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Interactive Form
            </button>
            <button
              id="tab-batch-btn"
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Raw / JSON Batch
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'form' ? (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="space-y-4">
            {candidates.map((c, index) => (
              <div
                key={c.id}
                id={`candidate-row-${index}`}
                className="p-4 rounded-lg border border-stone-200 bg-stone-50/40 hover:border-stone-300 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-stone-200 text-stone-700">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {c.name || `Candidate ${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Operating Mode Selector */}
                    <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-md p-0.5 text-2xs font-medium">
                      <button
                        type="button"
                        onClick={() => handleUpdateCandidate(index, 'mode', 'RECRUITER_OUTBOUND')}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          c.mode === 'RECRUITER_OUTBOUND'
                            ? 'bg-amber-100 text-amber-900 font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        Outbound Sourcing
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateCandidate(index, 'mode', 'PARTICIPANT_ALERT')}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          c.mode === 'PARTICIPANT_ALERT'
                            ? 'bg-blue-100 text-blue-900 font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <BellRing className="w-3 h-3 text-blue-600" />
                        Inbound Alert
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateCandidate(index, 'mode', 'OBJECTION_FOLLOWUP')}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          c.mode === 'OBJECTION_FOLLOWUP'
                            ? 'bg-purple-100 text-purple-900 font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3 text-purple-600" />
                        Plan B Friction
                      </button>
                    </div>

                    {candidates.length > 1 && (
                      <button
                        id={`remove-candidate-${index}-btn`}
                        type="button"
                        onClick={() => handleRemoveCandidate(index)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Candidate Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={`input-name-${index}`}
                      type="text"
                      value={c.name}
                      onChange={(e) => handleUpdateCandidate(index, 'name', e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full text-xs font-medium px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      School Grade / Academic Year
                    </label>
                    <input
                      id={`input-grade-${index}`}
                      type="text"
                      value={c.school_or_grade}
                      onChange={(e) => handleUpdateCandidate(index, 'school_or_grade', e.target.value)}
                      placeholder="e.g. Grade 12 Senior / 1st Year CS Undergrad"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Headline / Bio Summary
                  </label>
                  <input
                    id={`input-headline-${index}`}
                    type="text"
                    value={c.headline}
                    onChange={(e) => handleUpdateCandidate(index, 'headline', e.target.value)}
                    placeholder="e.g. Senior passionate about algorithmic math and competitive programming | Learning Python"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Raw Projects & Experience (Citable signals)
                    </label>
                    <textarea
                      id={`input-exp-${index}`}
                      rows={2}
                      value={c.raw_projects_and_experience}
                      onChange={(e) =>
                        handleUpdateCandidate(index, 'raw_projects_and_experience', e.target.value)
                      }
                      placeholder="e.g. Built an automated soil moisture monitor using ESP32 and C++..."
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Skills & Interests (Comma-separated)
                    </label>
                    <textarea
                      id={`input-skills-${index}`}
                      rows={2}
                      value={c.skills_and_interests.join(', ')}
                      onChange={(e) =>
                        handleUpdateCandidate(
                          index,
                          'skills_and_interests',
                          e.target.value.split(',').map((s) => s.trim())
                        )
                      }
                      placeholder="e.g. ESP32, C++, IoT, Python, YC Founders..."
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>

                {c.mode === 'OBJECTION_FOLLOWUP' && (
                  <div>
                    <label className="block text-xs font-medium text-purple-900 mb-1">
                      Candidate Objection / Stated Hesitation Reason (Optional)
                    </label>
                    <input
                      id={`input-objection-${index}`}
                      type="text"
                      value={c.objection_reason || ''}
                      onChange={(e) => handleUpdateCandidate(index, 'objection_reason', e.target.value)}
                      placeholder='e.g. "I have exams next week and feel unprepared for 48hr hackathons."'
                      className="w-full text-xs px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              id="add-candidate-row-btn"
              type="button"
              onClick={handleAddBlank}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-stone-500" />
              Add Another Profile
            </button>

            <button
              id="generate-pipeline-btn"
              type="button"
              onClick={onGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-black rounded-lg transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : 'text-amber-400'}`} />
              {isLoading ? 'Running Personalization Engine...' : 'Run AI Personalization Engine'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-stone-700">
                Paste JSON Array or Raw Text
              </label>
              <span className="text-xs text-stone-400">
                Batch candidates matching schema
              </span>
            </div>
            <textarea
              id="batch-input-area"
              rows={8}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`Example JSON:
[
  {
    "name": "Marcus Vance",
    "school_or_grade": "1st Year CS Undergrad",
    "headline": "Freshman exploring hardware and embedded systems",
    "raw_projects_and_experience": "Built an automated soil moisture monitor using ESP32 and C++",
    "skills_and_interests": ["ESP32", "C++", "IoT"],
    "mode": "RECRUITER_OUTBOUND"
  }
]`}
              className="w-full text-xs font-mono p-3 bg-stone-900 text-stone-100 rounded-lg border border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              id="parse-batch-btn"
              type="button"
              onClick={handleParseBatch}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-stone-300" />
              Load Into Pipeline Queue
            </button>

            {showBatchSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Check className="w-3.5 h-3.5" /> Profiles imported successfully!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

