import { useState } from 'react';
import { CandidateOutreachRecord } from '../types';
import { Copy, Check, Download, X, Code2, Terminal } from 'lucide-react';

interface JsonViewerModalProps {
  records: CandidateOutreachRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export default function JsonViewerModal({ records, isOpen, onClose }: JsonViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'python'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(records, null, 2);

  const pythonCodeSnippet = `from pydantic import BaseModel, Field
from typing import Literal, List
import json

class ProfileAnalysis(BaseModel):
    standout_project_or_signal: str = Field(description="Direct citation of candidate's project or interest")
    perceived_barrier: str = Field(description="Imposter syndrome, lack of credentials, or lack of team")
    persona_tag: Literal["Zero-Experience Aspiring Founder", "Active Hacker/Builder", "Curious Explorer"]

class OutreachPayload(BaseModel):
    primary_linkedin_message: str = Field(description="Under 75 words, peer-to-peer, pattern-interrupt")
    connection_request_note: str = Field(description="Strictly under 200 characters")
    plan_b_friction_dm: str = Field(description="Zero-pressure follow-up asking 'why' to capture objection")
    recommended_platform_tag: str

class CandidateOutreachRecord(BaseModel):
    candidate_name: str
    processed_mode: Literal["RECRUITER_OUTBOUND", "PARTICIPANT_ALERT", "OBJECTION_FOLLOWUP"]
    profile_analysis: ProfileAnalysis
    outreach_payload: OutreachPayload

# Batch JSON records (${records.length} items currently generated)
records_data = ${jsonString}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'json' ? jsonString : pythonCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_outreach_records_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="json-viewer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="json-viewer-dialog"
        className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden text-stone-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold">Structured Output Inspection</span>
              <span className="text-xs text-stone-400">({records.length} records)</span>
            </div>

            <div className="flex bg-stone-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeTab === 'json' ? 'bg-stone-900 text-amber-400' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                JSON Array
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('python')}
                className={`px-2.5 py-1 rounded font-medium transition-colors inline-flex items-center gap-1 ${
                  activeTab === 'python' ? 'bg-stone-900 text-amber-400' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Terminal className="w-3 h-3" />
                Python Pydantic Schema
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-json-output-btn"
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : activeTab === 'json' ? 'Copy JSON' : 'Copy Python'}
            </button>

            {activeTab === 'json' && (
              <button
                id="download-json-output-btn"
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download .json
              </button>
            )}

            <button
              id="close-json-modal-btn"
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Code Viewer */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-stone-900 text-stone-200 selection:bg-amber-500/30">
          <pre>{activeTab === 'json' ? jsonString : pythonCodeSnippet}</pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-2xs text-stone-400 flex items-center justify-between">
          <span>Compliant with `CandidateOutreachRecord` schema</span>
          <span>Ready for pipeline automation, webhook ingestion, or CRM export</span>
        </div>
      </div>
    </div>
  );
}

