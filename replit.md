# MemoryAmble

A memory training web app for seniors (ages 70+) that uses the Memory Palace technique. Features a beat-by-beat conversational coaching experience with a coach named Timbuk who guides users through building and testing a Memory Palace.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express.js with object assignment and optional AI spark hint
- **AI**: OpenAI gpt-4o-mini (user's own API key) - only used for optional "spark" hints during co-creation
- **No database** - session-based, all state in React

## App Flow

### Phase 1: Education (slides)
3 swipeable slides: History, How It Works, Why It Works. Progress bar shows "Learn" step.

### Phase 2: Chat Conversation (beats)
1. **Name Ask** - Timbuk asks "who am I walking with today?" User types their name.
2. **Welcome** - Timbuk greets by name, continue button to proceed.
3. **Interview** (Your Palace step) - Timbuk asks for a place, then 3 stops, reacting warmly to each.
4. **Co-Creation** (Remember step) - For each of 3 objects:
   - Timbuk gives the object + stop: "How can we make this totally your own?"
   - User describes their own scene.
   - Timbuk mirrors: "Brilliant! I can practically see that now. Lock that image in."
   - Optional "Stuck?" button triggers AI spark hint.
5. **Walkthrough** (Recall step) - Timbuk asks user to recall each object at each stop.
6. **Results** - Score and warm encouragement.

## Key Design Decisions

- Personalization: user's name used in every beat after they provide it
- Co-creation: user describes scenes, not the AI (AI only for optional sparks)
- Progress bar: 5 steps (Learn, Your Palace, Remember, Recall, Results) always visible
- Large text (xl-2xl) for senior accessibility
- Warm cream/stone palette (hue 40)
- Open Sans (body) + Lora (serif) typography
- No emoji anywhere - Lucide icons only
- Web Speech API mic button for voice input

## File Structure

- `client/src/pages/home.tsx` - Main page: education slides OR chat
- `client/src/components/education-slides.tsx` - 3 educational slides with back/next
- `client/src/components/progress-bar.tsx` - 5-step progress indicator
- `client/src/components/chat-message.tsx` - Chat bubble component
- `client/src/components/chat-input.tsx` - Text input with mic button
- `client/src/components/beat-engine.ts` - Beat flow, message templates, state machine
- `server/routes.ts` - POST /api/assign-objects, POST /api/spark
- `shared/schema.ts` - Assignment type

## API Endpoints

- `POST /api/assign-objects` - Randomly assigns objects to stops (no AI, instant)
- `POST /api/spark` - AI generates a short 1-sentence hint (optional, gpt-4o-mini)

## Environment Variables

- `OPENAI_API_KEY` - User's own OpenAI API key (only needed for spark hints)
