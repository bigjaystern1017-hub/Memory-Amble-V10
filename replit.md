# MemoryAmble

A memory training web app for seniors (ages 70+) that uses the Memory Palace technique. Features a beat-by-beat conversational coaching experience with a coach named Timbuk who guides users through a structured 7-day curriculum, with daily check-ins and focus-specific coaching.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js with item assignment and optional AI spark hint
- **AI**: OpenAI gpt-4o-mini (user's own API key) - only used for optional "spark" hints during co-creation
- **Persistence**: localStorage for daily progression (UserProgress)
- **No database** - all state in React + localStorage

## 7-Day Curriculum (lessonPlan.json)

| Day | Title | Items | Focus |
|-----|-------|-------|-------|
| 1 | The Spark | 3 | Vivid Colors |
| 2 | The Sensory Hub | 5 | Smell and Sound |
| 3 | The Action Move | 5 | Motion |
| 4 | The Scale Up | 8 | Spatial Detail |
| 5 | The Master Walk | 10 | Reverse Recall |
| 6 | The Palace Wipe | 0 | Clearing Space |
| 7 | Real World Utility | 5 | Shopping Lists |

## Daily Progression System

- **First visit**: Education slides → Name entry → Day 1 (3 items)
- **Returning user**: Skip education, check-in on yesterday's items → today's lesson
- **Day advances**: currentDay increments by 1 after each session completion (max 7)
- **Category**: Day 7 "Shopping Lists" uses "names" category; all other days use "objects"
- **Day 6 special**: Palace Wipe (0 items) - teaches clearing technique, no object placement/recall
- **Already done today**: Show friendly "come back tomorrow" message

## App Flow

### Phase 1: Education (slides) — first visit only
3 slides: History, How It Works, Why It Works. Skipped for returning users.

### Phase 2: Name Entry — first visit only

### Phase 3: Chat Conversation (dynamic beats)

**Returning users get check-in first:**
1. **Check-In** - Timbuk quizzes yesterday's items one by one
2. **Check-In Done** - Score summary, transition to today's lesson

**Then the main walk:**
1. **Welcome** - Continue button (Day 6 has unique palace-wipe welcome)
2. **Interview** (Your Palace) - Ask for place, then N stops (driven by curriculum)
3. **Co-Creation** (Remember) - For each item: assign, user describes scene, Timbuk mirrors with focus-specific prompts
4. **Walkthrough** (Recall) - Recall each item at each stop (Day 5: Reverse Recall)
5. **Results** - Score, warm encouragement, session saved to localStorage

### Day 6 Palace Wipe Flow
welcome → ask-place → react-place → palace-wipe → final (no items, no recall)

## Key Design Decisions

- 7-day curriculum in `lessonPlan.json` drives item counts, focus areas, and coaching notes
- Beat engine uses generic beats (ask-stop, place-object, recall) with stepIndex for looping
- `focusPrompt()` injects focus-specific coaching into placement beats
- Header shows "Day N: Title" in serif italic + "Today's Focus: X" strip
- Pronoun reversal: "My old office" → Timbuk says "your old office"
- Dialogue tiers: Chatty during onboarding, concise during placement/recall
- Mobile-first: 100dvh, safe area insets, no auto-zoom on inputs
- Large text (xl-2xl) for senior accessibility
- Warm cream/stone palette (hue 40), Open Sans + Lora
- No emoji — Lucide icons only
- Web Speech API mic button for voice input

## File Structure

- `client/src/pages/home.tsx` - Main page: education → name → chat, progression logic
- `client/src/lib/progress.ts` - localStorage persistence, curriculum lookup, session recording
- `client/src/lib/lessonPlan.json` - 7-day curriculum data (day, title, itemCount, focus, coachNote)
- `client/src/components/beat-engine.ts` - Dynamic beat flow, message templates, state machine
- `client/src/components/education-slides.tsx` - 3 educational slides
- `client/src/components/name-entry.tsx` - Dedicated name input screen
- `client/src/components/progress-bar.tsx` - 5-step progress indicator
- `client/src/components/chat-message.tsx` - Chat bubble with typewriter effect
- `client/src/components/chat-input.tsx` - Text input with mic button
- `server/routes.ts` - POST /api/assign-objects (objects or names), POST /api/spark
- `shared/schema.ts` - Assignment type

## API Endpoints

- `POST /api/assign-objects` - Assigns items to stops. Body: `{stops: string[], category: "objects"|"names"}`
- `POST /api/spark` - AI generates a short hint (optional, gpt-4o-mini)

## Environment Variables

- `OPENAI_API_KEY` - User's own OpenAI API key (only needed for spark hints)
