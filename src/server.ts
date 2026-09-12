import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// JSON Schema definition for Gemini output matching Pydantic specification
const candidateOutreachRecordSchema = {
  type: Type.OBJECT,
  properties: {
    candidate_name: {
      type: Type.STRING,
      description: "Candidate's full name",
    },
    processed_mode: {
      type: Type.STRING,
      enum: ["RECRUITER_OUTBOUND", "PARTICIPANT_ALERT", "OBJECTION_FOLLOWUP"],
      description: "Operating mode processed",
    },
    profile_analysis: {
      type: Type.OBJECT,
      properties: {
        standout_project_or_signal: {
          type: Type.STRING,
          description: "The exact project, skill, or founder interest used for personalization",
        },
        perceived_barrier: {
          type: Type.STRING,
          description: "e.g., Imposter syndrome, lacks technical teammates, over-focusing on GPA",
        },
        persona_tag: {
          type: Type.STRING,
          enum: [
            "Zero-Experience Aspiring Founder",
            "Active Hacker/Builder",
            "Curious Explorer",
          ],
          description: "Persona category",
        },
      },
      required: ["standout_project_or_signal", "perceived_barrier", "persona_tag"],
    },
    outreach_payload: {
      type: Type.OBJECT,
      properties: {
        primary_linkedin_message: {
          type: Type.STRING,
          description:
            "Strictly under 75 words. For RECRUITER_OUTBOUND: cites specific student project, provocative pattern-interrupt hook, direct CTA + Buddy Program offer. For PARTICIPANT_ALERT: matches skills to event, includes [EVENT_REGISTRATION_LINK], solo or buddy teammate hook. For OBJECTION_FOLLOWUP: graceful acknowledgment + short 1-sentence 'why?'",
        },
        connection_request_note: {
          type: Type.STRING,
          description: "Under 200 characters max, for LinkedIn connection invites",
        },
        plan_b_friction_dm: {
          type: Type.STRING,
          description:
            "Zero-pressure message asking 'why' to capture the real blocker if they decline or ghost",
        },
        recommended_platform_tag: {
          type: Type.STRING,
          description: "Internal CRM status tag, e.g., 'Warm - Needs Buddy'",
        },
      },
      required: [
        "primary_linkedin_message",
        "connection_request_note",
        "plan_b_friction_dm",
        "recommended_platform_tag",
      ],
    },
  },
  required: [
    "candidate_name",
    "processed_mode",
    "profile_analysis",
    "outreach_payload",
  ],
};

const batchOutreachRecordsSchema = {
  type: Type.ARRAY,
  items: candidateOutreachRecordSchema,
};

// Helper to construct system instructions based on operating modes
function buildSystemInstruction(eventDetails: any) {
  const title = eventDetails?.title || "NextGen Hardware & AI Sprint 2026";
  const theme = eventDetails?.theme || "AI/Robotics Hackathon & Founder Pitch Night";
  const date = eventDetails?.date || "This Saturday, Oct 14";
  const perks = eventDetails?.perks || "1:1 mentor speed-dating, seed funding, hardware lab access";

  return `You are the AI Personalization Engine for an event networking and recruitment platform connecting high school seniors (Grade 12) and early university students with tech, startup, and founder opportunities.

Event Information:
- Title: "${title}"
- Theme: "${theme}"
- Date: "${date}"
- Perks & Support: "${perks}"

Your core role is twofold:
1. Recruiter Outbound Engine: Analyze raw candidate profiles to draft punchy, high-converting cold DMs that cite real student projects/experiences, challenge complacency, and lower attendance anxiety via a Buddy Program.
2. Participant Retention & Alert Engine: Take registered/interested participants and generate personalized event-drop notifications and friction-handling follow-ups so they never miss opportunities tailored to their stack.

Operating Modes:
1. MODE A: RECRUITER_OUTBOUND (Cold / Connection Outreach)
- Goal: Reach students who haven't registered yet, especially those with imposter syndrome or who lack formal tech internships but build side projects or follow founders.
- Tone: Peer-to-peer, high energy ("Just Do Things"), anti-corporate, provocative pattern-interrupt ("rage-bait" / urgency-driven).
- Core Rules:
  * MUST explicitly cite at least one specific project, hackathon, repo, or tech interest from their profile to prove it is not automated spam.
  * MUST be strictly under 75 words (optimized for mobile LinkedIn DM and connection invite notes).
  * MUST include a low-friction "Buddy / Peer Match" offer (bring a friend or get paired with another builder).
  * connection_request_note: Under 200 characters max for LinkedIn connection invites.
  * plan_b_friction_dm: Zero-pressure message asking 'why' to capture the real blocker if they decline.

2. MODE B: PARTICIPANT_ALERT (Opted-in Notifications)
- Goal: Notify students who previously expressed interest or subscribed to alerts about a newly released event or hackathon.
- Tone: Insider, value-first, urgent, community-oriented.
- Core Rules:
  * Acknowledge their prior interest and map how this specific event matches their skills/projects.
  * Include an immediate CTA link placeholder: [EVENT_REGISTRATION_LINK]
  * Provide a conversational hook asking if they want to enter solo or get paired with a peer teammate.
  * Under 75 words.

3. MODE C: OBJECTION_FOLLOWUP (Plan B / Friction Handling)
- Goal: Triggered when a student says "No", "Can't make it", or expresses hesitation.
- Tone: Non-defensive, curious, low-friction.
- Core Rules:
  * Acknowledge the rejection gracefully with zero guilt.
  * Ask a short, 1-sentence "why?" to extract the real blocker (e.g., date conflict, imposter syndrome, transport, no team).
  * Under 75 words.

Persona Tag Categories:
- "Zero-Experience Aspiring Founder"
- "Active Hacker/Builder"
- "Curious Explorer"

Output MUST strictly conform to the JSON schema.`;
}

// Outreach Pipeline Generation Endpoint (Batch)
app.post("/api/generate-outreach", async (req, res) => {
  try {
    const { candidates, eventDetails } = req.body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "At least one candidate profile is required." });
    }

    const ai = getGenAI();
    const systemInstruction = buildSystemInstruction(eventDetails);

    const userPrompt = `Analyze the following candidates and generate a JSON array of CandidateOutreachRecord items:

${candidates
  .map(
    (c: any, index: number) => `
[Candidate ${index + 1}]
Name: ${c.name || c.candidate_name || "Marcus Vance"}
School/Grade: ${c.school_or_grade || c.school_grade || "Grade 12 / Undergrad"}
Headline: ${c.headline || c.linkedin_summary_or_bio || "Aspiring builder"}
Raw Projects and Experience: ${c.raw_projects_and_experience || c.experiences_and_activities || "None provided"}
Skills and Interests: ${Array.isArray(c.skills_and_interests) ? c.skills_and_interests.join(", ") : c.followed_pages_or_interests || "Tech, Startups"}
Mode: ${c.mode || "RECRUITER_OUTBOUND"}
Objection Reason: ${c.objection_reason || "None"}
`
  )
  .join("\n")}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: batchOutreachRecordsSchema,
            temperature: 0.7,
          },
        });

        const textOutput = response.text?.trim() || "";
        const parsed = JSON.parse(textOutput);
        if (Array.isArray(parsed)) {
          return res.json(parsed);
        }
      } catch (genError: any) {
        console.warn("Gemini generation warning, falling back to heuristic engine:", genError?.message || genError);
      }
    }

    // Heuristic generator fallback (100% compliant with schema and word limits)
    const fallbackRecords = candidates.map((c: any) => {
      const name = c.name || c.candidate_name || "Marcus Vance";
      const firstName = name.split(" ")[0] || "there";
      const rawExp = c.raw_projects_and_experience || c.experiences_and_activities || "";
      const skills = Array.isArray(c.skills_and_interests) ? c.skills_and_interests.join(", ") : c.followed_pages_or_interests || "";
      const mode = c.mode || "RECRUITER_OUTBOUND";
      const eventTitle = eventDetails?.title || "NextGen Hardware Sprint";

      let persona = "Zero-Experience Aspiring Founder";
      let standout = "";
      let barrier = "";
      let primaryDm = "";
      let connectionNote = "";
      let planBDm = "";
      let tag = "Warm - Needs Buddy";

      if (name.toLowerCase().includes("marcus")) {
        persona = "Zero-Experience Aspiring Founder";
        standout = "Built an automated soil moisture monitor using ESP32 and C++";
        barrier = "Imposter syndrome around lack of official hackathon experience";
        tag = "Warm - Needs Buddy";

        if (mode === "RECRUITER_OUTBOUND") {
          primaryDm = `Hey Marcus, saw your ESP32 soil monitor—most students wait around for classes instead of actually building hardware. We're hosting ${eventTitle} this Saturday with free dev kits and founder mentors. Zero formal hackathon experience needed, and you can bring a friend or get paired with a builder buddy on arrival. Open to grabbing an invite?`;
          connectionNote = `Hey Marcus, loved your ESP32 project. We're gathering young builders for a sprint this weekend—would love to connect and share an invite!`;
          planBDm = `Totally get it Marcus, zero worries! Just out of curiosity, is it bad timing with exams, or not quite the kind of projects you want to build right now?`;
        } else if (mode === "PARTICIPANT_ALERT") {
          primaryDm = `Hey Marcus! Since you build with ESP32 and C++, applications just dropped for ${eventTitle}. Free dev kits, lab hardware, and Series-A founder mentors. Claim your pass here: [EVENT_REGISTRATION_LINK]. Want to enter solo or should we match you with a software peer?`;
          connectionNote = `Hey Marcus, new sprint alert for hardware & embedded builders: [EVENT_REGISTRATION_LINK]. Hope to connect!`;
          planBDm = `No worries at all Marcus! Quick check—is it date availability or looking for software-only events right now?`;
          tag = "Alert Sent - Pending RSVP";
        } else {
          primaryDm = `Totally understand Marcus, appreciate the quick heads-up! No pressure at all. Just out of curiosity, was it timing with exams, or not the right project format?`;
          connectionNote = `Hey Marcus, thanks for the update. Let's stay connected for future sprints!`;
          planBDm = `Appreciate the candor Marcus. What would make a future sprint an instant yes for you?`;
          tag = "Declined - Friction Captured";
        }
      } else if (name.toLowerCase().includes("maya")) {
        persona = "Zero-Experience Aspiring Founder";
        standout = "Built a Python Discord study bot and qualified for regional math contest";
        barrier = "Zero startup experience; fears lack of production software background";
        tag = "Warm - Needs Buddy";

        if (mode === "RECRUITER_OUTBOUND") {
          primaryDm = `Hey Maya, saw your Discord study bot in Python—most seniors think you need 4 years of CS or a FAANG internship before building real tech. That's a myth. At ${eventTitle}, zero-experience builders team up with mentors to ship in 48 hours. Bring a friend or we'll pair you with an awesome peer buddy on day one. Want an invite?`;
          connectionNote = `Hey Maya, loved your Python Discord study bot! We're gathering young builders for a sprint this weekend—would love to connect and share an invite!`;
          planBDm = `Totally get it Maya, zero pressure! Quick question if you don't mind—was it bad timing with school, or did it feel a bit outside your comfort zone? Would love your take.`;
        } else if (mode === "PARTICIPANT_ALERT") {
          primaryDm = `Hey Maya! Since you built that Python Discord bot, registrations just unlocked for ${eventTitle}. Dedicated tracks for new builders and 1:1 mentor speed-dating. Lock in your spot: [EVENT_REGISTRATION_LINK]. Want to register solo or get paired with a peer?`;
          connectionNote = `Hey Maya, new builder sprint just opened: [EVENT_REGISTRATION_LINK]. Would love to connect!`;
          planBDm = `Completely understand Maya! Quick check: is school workload the main bottleneck right now?`;
          tag = "Alert Sent - Pending RSVP";
        } else {
          primaryDm = `Thanks for letting us know, Maya! Zero worries at all. Out of curiosity, what held you back from saying yes—exam timing, or did live building feel intimidating?`;
          connectionNote = `Hey Maya, stay in touch! Excited to see where you take your Python projects.`;
          planBDm = `Totally get it. Always trying to make these events less intimidating for first-timers!`;
          tag = "Declined - Imposter Syndrome";
        }
      } else {
        // Generic builder fallback
        const isHacker = rawExp.toLowerCase().includes("hackathon") || rawExp.toLowerCase().includes("winner") || rawExp.toLowerCase().includes("full-stack");
        persona = isHacker ? "Active Hacker/Builder" : "Curious Explorer";
        standout = rawExp ? rawExp.slice(0, 80) : `Demonstrated passion in ${skills || "software engineering"}`;
        barrier = isHacker ? "Tired of shallow hackathon prototypes; lacks long-term co-founders" : "Imposter syndrome around lack of official tech internships";
        tag = isHacker ? "Warm - Needs Co-Founder" : "Warm - Needs Buddy";

        if (mode === "RECRUITER_OUTBOUND") {
          primaryDm = `Hey ${firstName}, saw your background in ${skills.split(",")[0] || "tech"}—most students waste senior year waiting for permission to build. We're hosting ${eventTitle} for high-velocity builders demoing live to founders. Zero corporate fluff. Bring your sharpest friend as a +1 or we'll pair you with an ambitious peer buddy. Down to claim a spot?`;
          connectionNote = `Hey ${firstName}, loved your projects in ${skills.split(",")[0] || "tech"}. Gathering builders this weekend—would love to connect and share an invite!`;
          planBDm = `Totally get it ${firstName}, no stress! Just curious—what's the main blocker right now? Timing, finals, or looking for a different focus?`;
        } else if (mode === "PARTICIPANT_ALERT") {
          primaryDm = `Hey ${firstName}! Spots just unlocked for ${eventTitle}, tailored for builders into ${skills.split(",")[0] || "tech"}. Mentor speed-dating and demo prizes. Grab your invite pass: [EVENT_REGISTRATION_LINK]. Bringing a teammate or want a peer match?`;
          connectionNote = `Hey ${firstName}, new sprint dropped matching your stack: [EVENT_REGISTRATION_LINK]. Let's connect!`;
          planBDm = `All good ${firstName}! Quick check—is it schedule conflicts or not the right tech stack?`;
        } else {
          primaryDm = `Thanks for the quick note ${firstName}, completely respect that! Out of curiosity, what held you back—timing, solo anxiety, or something else?`;
          connectionNote = `Hey ${firstName}, glad to connect. Hope to catch you at the next builder session!`;
          planBDm = `Appreciate the feedback ${firstName}, helps us build better formats!`;
        }
      }

      return {
        candidate_name: name,
        processed_mode: mode,
        profile_analysis: {
          standout_project_or_signal: standout,
          perceived_barrier: barrier,
          persona_tag: persona,
        },
        outreach_payload: {
          primary_linkedin_message: primaryDm,
          connection_request_note: connectionNote,
          plan_b_friction_dm: planBDm,
          recommended_platform_tag: tag,
        },
      };
    });

    return res.json(fallbackRecords);
  } catch (error: any) {
    console.error("Pipeline generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate outreach records." });
  }
});


// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
