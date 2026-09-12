import { useState } from 'react';
import { EventDetails } from '../types';
import { Sliders, ChevronDown, ChevronUp, Users, ShieldAlert, Zap, BellRing, Calendar } from 'lucide-react';

interface EventConfigCardProps {
  details: EventDetails;
  onChange: (details: EventDetails) => void;
}

export default function EventConfigCard({ details, onChange }: EventConfigCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="event-config-card" className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      <div
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900">Event Context & Target Stack</h3>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                {details.title}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-2xs text-stone-500">
                <Calendar className="w-3 h-3 text-stone-400" />
                {details.date}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Operating dual-engine: Recruiter Outbound (&lt;75 words cold hooks) + Participant Inbound Alerts + Objection Follow-ups
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-stone-400 hover:text-stone-600 p-1 transition-colors"
          aria-label="Toggle event config"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Event Title
              </label>
              <input
                id="event-title-input"
                type="text"
                value={details.title}
                onChange={(e) => onChange({ ...details, title: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. NextGen Hardware & AI Sprint 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Theme / Format
              </label>
              <input
                id="event-theme-input"
                type="text"
                value={details.theme}
                onChange={(e) => onChange({ ...details, theme: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. AI/Robotics Hackathon & Founder Pitch Night"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date & Schedule
              </label>
              <input
                id="event-date-input"
                type="text"
                value={details.date}
                onChange={(e) => onChange({ ...details, date: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. This Saturday, Oct 14"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Perks & Support Offerings
              </label>
              <input
                id="event-perks-input"
                type="text"
                value={details.perks}
                onChange={(e) => onChange({ ...details, perks: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. Free dev kits, 1:1 Series-A founder mentors, peer matchmaking"
              />
            </div>
          </div>

          {/* Operating Modes Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white rounded-lg border border-amber-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Mode A: Recruiter Outbound
              </div>
              <p className="text-stone-600 text-2xs leading-relaxed">
                Cold / connection outreach. Under 75 words. Cites specific project/repo. High energy ("Just Do Things"). Low-friction Buddy / Peer Match offer.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                <BellRing className="w-3.5 h-3.5 text-blue-600" />
                Mode B: Participant Inbound Alert
              </div>
              <p className="text-stone-600 text-2xs leading-relaxed">
                Opted-in drop alert. Maps event to their specific skills/projects. Includes [EVENT_REGISTRATION_LINK] and solo vs. paired teammate hook.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-purple-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                Mode C: Plan B Friction Test
              </div>
              <p className="text-stone-600 text-2xs leading-relaxed">
                Triggered on hesitation or decline. Acknowledges rejection gracefully with zero guilt. Asks short 1-sentence "why?" to extract real blocker.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

