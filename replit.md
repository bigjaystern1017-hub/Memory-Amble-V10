# MemoryAmble

A memory training web app for seniors (ages 70+) that uses the Memory Palace technique. Features a beat-by-beat conversational coaching experience with a coach named Timbuk who guides users through a structured 5-day curriculum, with daily check-ins and coaching-style prompts.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js with item assignment and optional AI spark hint
- **AI**: OpenAI gpt-4o-mini (user's own API key) - only used for optional "spark" hints during co-creation
- **Persistence**: localStorage for daily progression (UserProgress)
- **No database** - all state in React + localStorage

## 5-Day Curriculum (in progress.ts)

| Day | Title | Items | Focus | Cleaning | Reverse |
|-----|-------|-------|-------|----------|---------|
| 1 | The Foundation | 3 | Vivid Imagery | No | No |
| 2 | The Expansion | 5 | Making Space | Yes | No |
| 3 | The Reverse | 5 | Mental Agility | Yes | Yes |
| 4 | The Stretch | 8 | Volume | Yes | Yes | No |
| 5 | The Graduation | 10 | Mastery | Yes | Yes |

- **Cleaning**: After recall, Timbuk guides a "palace wipe" (Fresh Breeze technique) to clear images
- **Reverse**: Recall phase walks stops in reverse order for added challenge

## Daily Progression System

- **First visit**: Education slides → Name entry → Day 1 (3 items)
- **Returning user**: Skip education, check-in on yesterday's items → today's lesson
- **Day advances**: currentDay increments by 1 after each session completion (max 5)
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
1. **Welcome** - Continue button
2. **Interview** (Your Palace) - Ask for place, then N stops (driven by curriculum)
3. **Co-Creation** (Remember) - For each item: assign, user describes scene, Timbuk mirrors
4. **Walkthrough** (Recall) - Recall each item at each stop (reverse on Days 3 & 5)
5. **Palace Wipe** - If cleaning=true, guide Fresh Breeze clearing technique
6. **Results** - Score, warm encouragement, session saved to localStorage

## Timbuk's Coaching Style

- Timbuk is a COACH, not a narrator — never suggests specific colors, details, or imagery
- Uses open-ended prompts: "What do you see happening?" / "Make it bold, vivid, and unique to you."
- Goal: prompt the USER to use THEIR imagination
- Warm, encouraging, concise during placement/recall phases

## Key Design Decisions

- 5-day curriculum in `progress.ts` drives item counts, focus areas, cleaning, and reverse flags
- Beat engine uses generic beats (ask-stop, place-object, recall) with stepIndex for looping
- `lesson.reverse` flag drives reverse recall order via `recallAssignmentIndex()`
- `lesson.cleaning` flag inserts palace-wipe beat after recall
- Header shows "Day N: Title" in serif italic + "Today's Focus: X" strip
- Pronoun reversal: "My old office" → Timbuk says "your old office"
- Mobile-first: 100dvh, safe area insets, no auto-zoom on inputs
- Large text (xl-2xl) for senior accessibility
- Warm cream/stone palette (hue 40), Open Sans + Lora
- No emoji — Lucide icons only
- Web Speech API mic button for voice input
- Dev Reset button (bottom-right corner) clears localStorage and reloads

## File Structure

- `client/src/pages/home.tsx` - Main page: education → name → chat, progression logic
- `client/src/lib/progress.ts` - localStorage persistence, 5-day curriculum data, session recording
- `client/src/components/beat-engine.ts` - Dynamic beat flow, coaching messages, state machine
- `client/src/components/education-slides.tsx` - 3 educational slides
- `client/src/components/name-entry.tsx` - Dedicated name input screen
- `client/src/components/progress-bar.tsx` - 5-step progress indicator
- `client/src/components/chat-message.tsx` - Chat bubble with typewriter effect
- `client/src/components/chat-input.tsx` - Text input with mic button
- `server/routes.ts` - POST /api/assign-objects, POST /api/spark
- `shared/schema.ts` - Assignment type

## API Endpoints

- `POST /api/assign-objects` - Assigns random objects to stops. Body: `{stops: string[], category: "objects"|"names"}`
- `POST /api/spark` - AI generates a short hint (optional, gpt-4o-mini)

## Environment Variables

- `OPENAI_API_KEY` - User's own OpenAI API key (only needed for spark hints)
