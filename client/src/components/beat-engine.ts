import type { Assignment } from "@shared/schema";

export type BeatId =
  | "welcome"
  | "ask-place"
  | "react-place"
  | "ask-stop-1"
  | "react-stop-1"
  | "ask-stop-2"
  | "react-stop-2"
  | "ask-stop-3"
  | "react-stop-3"
  | "assigning"
  | "placement-intro"
  | "place-object-1"
  | "mirror-object-1"
  | "place-object-2"
  | "mirror-object-2"
  | "place-object-3"
  | "mirror-object-3"
  | "walkthrough-intro"
  | "recall-1"
  | "react-recall-1"
  | "recall-2"
  | "react-recall-2"
  | "recall-3"
  | "react-recall-3"
  | "final";

export interface ConversationState {
  userName: string;
  placeName: string;
  stops: string[];
  assignments: Assignment[];
  userScenes: string[];
  userAnswers: string[];
  correctCount: number;
}

export function getProgressStep(beatId: BeatId): number {
  const palaceBeats: BeatId[] = [
    "ask-place", "react-place",
    "ask-stop-1", "react-stop-1",
    "ask-stop-2", "react-stop-2",
    "ask-stop-3", "react-stop-3",
    "assigning",
  ];
  const rememberBeats: BeatId[] = [
    "placement-intro",
    "place-object-1", "mirror-object-1",
    "place-object-2", "mirror-object-2",
    "place-object-3", "mirror-object-3",
  ];
  const recallBeats: BeatId[] = [
    "walkthrough-intro",
    "recall-1", "react-recall-1",
    "recall-2", "react-recall-2",
    "recall-3", "react-recall-3",
  ];

  if (beatId === "welcome") return 0;
  if (palaceBeats.includes(beatId)) return 1;
  if (rememberBeats.includes(beatId)) return 2;
  if (recallBeats.includes(beatId)) return 3;
  if (beatId === "final") return 4;
  return 0;
}

export function getTimbukMessage(beatId: BeatId, state: ConversationState): string {
  const name = state.userName || "friend";

  switch (beatId) {
    case "welcome":
      return `${name}, I'm so glad you're here! We're going to do something wonderful together -- we're going to build you a Memory Palace. Ready to start?`;

    case "ask-place":
      return `Wonderful! First, ${name}, I need you to think of a place you know very well. It could be your childhood home, your current house, a favourite park -- any place you can picture clearly in your mind. What place comes to mind?`;

    case "react-place":
      return `"${state.placeName}" -- I can see it now! What a perfect choice, ${name}. A place with real memories is exactly what makes this work so beautifully.\n\nNow, I want you to imagine walking through ${state.placeName}. As you walk, we're going to pick 3 specific spots -- I call them "stops" -- that you naturally pass by.`;

    case "ask-stop-1":
      return `Let's start with your first stop. As you walk into ${state.placeName}, what's the very first thing you see or pass by? Maybe a doorway, a table, a window? Tell me about it, ${name}.`;

    case "react-stop-1":
      return `"${state.stops[0]}" -- wonderful! I can picture that perfectly. You've got this, ${name}.\n\nNow keep walking through ${state.placeName}...`;

    case "ask-stop-2":
      return "What's the next spot you come to? The second thing that catches your eye as you continue through?";

    case "react-stop-2":
      return `"${state.stops[1]}" -- oh, that's a great one! I love how clearly you see this place.\n\nOne more stop to go...`;

    case "ask-stop-3":
      return "And as you keep walking, what's your third and final stop? What do you see next?";

    case "react-stop-3":
      return `"${state.stops[2]}" -- perfect! Now we have your three stops:\n\n1. ${state.stops[0]}\n2. ${state.stops[1]}\n3. ${state.stops[2]}\n\nYou've just built the skeleton of your Memory Palace, ${name}! Now comes the really fun part -- let me pick some objects to place at each stop. Just a moment...`;

    case "assigning":
      return "";

    case "placement-intro":
      return `I've picked three objects, ${name}. But here's the secret -- I'm not going to tell you how to picture them. YOU are going to create the scene, because your imagination makes the strongest memories. The weirder and funnier you make it, the better it sticks. Ready?`;

    case "place-object-1": {
      const a = state.assignments[0];
      if (!a) return "";
      return `At your first stop -- ${a.stopName} -- we're placing ${a.object}.\n\nHow can we make this totally your own, ${name}? What weird detail would make ${a.object} stick to ${a.stopName} in your mind? Tell me what you see.`;
    }

    case "mirror-object-1":
      return `Brilliant, ${name}! I can practically see that now. Lock that image in -- it's your secret anchor.\n\nOn to your second stop.`;

    case "place-object-2": {
      const a = state.assignments[1];
      if (!a) return "";
      return `Now at ${a.stopName}, we're placing ${a.object}.\n\nSame thing, ${name} -- what wild detail would make ${a.object} unforgettable at ${a.stopName}? Paint me a picture.`;
    }

    case "mirror-object-2":
      return `Oh, that's wonderful! You're a natural at this, ${name}. That image is locked in tight.\n\nOne more to go.`;

    case "place-object-3": {
      const a = state.assignments[2];
      if (!a) return "";
      return `And at your last stop -- ${a.stopName} -- we're placing ${a.object}.\n\nLast one, ${name}. Make it as wild and vivid as you like. What do you see?`;
    }

    case "mirror-object-3":
      return `I love it! All three objects are placed, ${name}. Your Memory Palace is complete. You've done something remarkable today.\n\nNow, let's put it to the test. I'm going to ask you to walk through your palace one more time -- but this time, you tell ME what you see at each stop. Don't worry if you can't remember everything perfectly. This is practice, not a test.`;

    case "walkthrough-intro":
      return `Alright, ${name}. Close your eyes for a moment. Picture yourself standing at the entrance of ${state.placeName}. Take a breath.\n\nNow, walk to your first stop...`;

    case "recall-1":
      return `You're at ${state.assignments[0]?.stopName}. Look around... what unusual thing do you see there?`;

    case "react-recall-1": {
      const a = state.assignments[0];
      const answer = state.userAnswers[0] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `Yes! ${a?.object}! I can see you really pictured that scene, ${name}. Wonderful!\n\nNow keep walking to your next stop...`;
      }
      return `The object was ${a?.object}. That's perfectly alright, ${name} -- it gets easier with practice, I promise. Next time that image will be even stronger.\n\nLet's keep walking to your next stop...`;
    }

    case "recall-2":
      return `You're now at ${state.assignments[1]?.stopName}. What do you see here?`;

    case "react-recall-2": {
      const a = state.assignments[1];
      const answer = state.userAnswers[1] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `That's it! ${a?.object}! You're a natural, ${name}. I can see it now -- your palace is working!\n\nOne more stop to go...`;
      }
      return `It was ${a?.object}. Don't worry one bit, ${name}. Memory is a muscle, and you're already making it stronger.\n\nLet's visit your last stop...`;
    }

    case "recall-3":
      return `And finally, you're at ${state.assignments[2]?.stopName}. What wild thing do you see here?`;

    case "react-recall-3": {
      const a = state.assignments[2];
      const answer = state.userAnswers[2] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `${a?.object} -- exactly right! Oh, ${name}, that was beautiful!`;
      }
      return `That one was ${a?.object}. You know what, ${name}? The fact that you tried is what matters most. Each time you practice, these images become clearer and stickier.`;
    }

    case "final": {
      const count = state.correctCount;
      if (count === 3) {
        return `${name}, you got all three! A perfect score on your very first Memory Palace. That is truly wonderful. You have a gift for this.\n\nYour palace is yours to keep. Whenever you want to practice, just walk through it in your mind. And remember -- you can build as many palaces as you like. I'm so proud of you today. You've got this!`;
      }
      if (count >= 2) {
        return `${count} out of 3, ${name}! That is a fantastic result for your first try. Your Memory Palace is working beautifully.\n\nWith a little practice, you'll be getting them all. The images get stickier each time you walk through. I'm so proud of you. You've got this!`;
      }
      if (count >= 1) {
        return `${count} out of 3 -- and that is a wonderful start, ${name}. Remember, even world memory champions started right where you are. The beauty of a Memory Palace is that it gets stronger every time you walk through it.\n\nTry walking through your palace tonight before bed. I bet you'll surprise yourself. You've got this!`;
      }
      return `You know what, ${name}? Today wasn't about getting the answers right -- it was about building your first palace. And you did that beautifully. The images are planted, and they'll get clearer with practice.\n\nTry walking through your palace tonight before bed. Picture each stop, and let those funny images come back. You've got this, ${name}. I believe in you!`;
    }

    default:
      return "";
  }
}

function extractKeyword(objectName: string): string {
  return objectName
    .replace(/^a\s+/i, "")
    .replace(/^an\s+/i, "")
    .replace(/^the\s+/i, "")
    .split(" ")
    .pop()
    ?.toLowerCase() || "";
}

export function getNextBeat(current: BeatId): BeatId | null {
  const flow: BeatId[] = [
    "welcome",
    "ask-place",
    "react-place",
    "ask-stop-1",
    "react-stop-1",
    "ask-stop-2",
    "react-stop-2",
    "ask-stop-3",
    "react-stop-3",
    "assigning",
    "placement-intro",
    "place-object-1",
    "mirror-object-1",
    "place-object-2",
    "mirror-object-2",
    "place-object-3",
    "mirror-object-3",
    "walkthrough-intro",
    "recall-1",
    "react-recall-1",
    "recall-2",
    "react-recall-2",
    "recall-3",
    "react-recall-3",
    "final",
  ];

  const idx = flow.indexOf(current);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

export function beatNeedsUserInput(beatId: BeatId): boolean {
  const inputBeats: BeatId[] = [
    "ask-place",
    "ask-stop-1",
    "ask-stop-2",
    "ask-stop-3",
    "place-object-1",
    "place-object-2",
    "place-object-3",
    "recall-1",
    "recall-2",
    "recall-3",
  ];
  return inputBeats.includes(beatId);
}

export function beatNeedsContinueButton(beatId: BeatId): boolean {
  return beatId === "welcome";
}

export function getInputPlaceholder(beatId: BeatId): string {
  switch (beatId) {
    case "ask-place":
      return "Name a place you know well...";
    case "ask-stop-1":
    case "ask-stop-2":
    case "ask-stop-3":
      return "Describe what you see...";
    case "place-object-1":
    case "place-object-2":
    case "place-object-3":
      return "Describe the scene you imagine...";
    case "recall-1":
    case "recall-2":
    case "recall-3":
      return "What do you see at this stop?";
    default:
      return "Type your answer...";
  }
}
