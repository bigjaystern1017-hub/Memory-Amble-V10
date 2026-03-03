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

function flipPronoun(input: string): string {
  let text = input.trim();
  text = text.replace(/^my\s+/i, "your ");
  text = text.replace(/^i\s+call\s+it\s+/i, "");
  text = text.replace(/^it's\s+/i, "");
  text = text.replace(/^the\s+/i, (m) => m.toLowerCase());
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function asPlace(raw: string): string {
  const flipped = flipPronoun(raw);
  return flipped.charAt(0).toUpperCase() + flipped.slice(1);
}

function asStop(raw: string): string {
  return flipPronoun(raw);
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
  const place = asPlace(state.placeName);
  const stop = (i: number) => asStop(state.stops[i] || "");
  const aStop = (i: number) => asStop(state.assignments[i]?.stopName || "");

  switch (beatId) {
    case "welcome":
      return `${name}! What a pleasure. I've been looking forward to our walk together. Today we're going to build something really special -- your very own Memory Palace. It's been around for thousands of years, and honestly? It's a lot of fun. Shall we get started?`;

    case "ask-place":
      return `So here's how this works, ${name}. I want you to think of a place that feels like home to you. Somewhere you could walk through with your eyes closed -- maybe your house, your garden, a favourite shop you've visited a hundred times. Tell me about a place you love.`;

    case "react-place":
      return `Oh, ${place.toLowerCase()}! I love that you picked that, ${name}. I can already picture you there. A place you really know is worth its weight in gold for this.\n\nNow, imagine you're walking through ${place.toLowerCase()} right now. We're going to choose 3 spots along your path -- little landmarks you'd naturally pass by. Think of them as rest stops on our stroll.`;

    case "ask-stop-1":
      return `Let's start right at the beginning. You've just arrived at ${place.toLowerCase()}. Look around -- what's the first thing that catches your eye? A door? A piece of furniture? A tree? Whatever jumps out at you, ${name}, that's your first stop.`;

    case "react-stop-1":
      return `Oh, ${stop(0)} -- I can see it. That's a lovely first stop, ${name}. I'm going to remember that.\n\nAlright, keep walking for me. What comes next?`;

    case "ask-stop-2":
      return `You've passed ${stop(0)} and you're moving through the space. What do you notice next? Where do your feet take you?`;

    case "react-stop-2":
      return `Ah, ${stop(1)} -- perfect. See how naturally these come to you? You know this place inside and out, ${name}.\n\nOne more. Keep walking...`;

    case "ask-stop-3":
      return `You're past ${stop(0)} and ${stop(1)} now. As you continue through ${place.toLowerCase()}, where do you end up? What's your last stop?`;

    case "react-stop-3":
      return `${stop(2).charAt(0).toUpperCase() + stop(2).slice(1)} -- beautiful. So here's your route through ${place.toLowerCase()}:\n\nFirst, ${stop(0)}.\nThen, ${stop(1)}.\nAnd finally, ${stop(2)}.\n\nThat, ${name}, is the skeleton of your Memory Palace. You just built it in about two minutes. Not bad at all! Now let me find some things to put in it...`;

    case "assigning":
      return "";

    case "placement-intro":
      return `Right, ${name}, here's where the fun really starts. I've picked three objects, and we're going to plant one at each of your stops. But here's the thing -- I'm not going to tell you how to picture them. That's YOUR job. The weirder and sillier you make it, the stickier the memory. Trust me on this one.`;

    case "place-object-1": {
      const a = state.assignments[0];
      if (!a) return "";
      return `Your first stop is ${aStop(0)}, and the object is ${a.object}.\n\nNow, ${name}, here's what I want you to do. Picture ${a.object} right there at ${aStop(0)}. But don't just set it down -- make it ridiculous. Is it doing something? Is it enormous? Is it making noise? Tell me what you see in your mind.`;
    }

    case "mirror-object-1": {
      const scene = state.userScenes[0] || "";
      const snippet = scene.length > 40 ? scene.substring(0, 40).trim() + "..." : scene;
      return `Ha! "${snippet}" -- I can practically see it, ${name}. That is exactly the kind of image that sticks. Hold onto that one.\n\nLet's move to your second stop.`;
    }

    case "place-object-2": {
      const a = state.assignments[1];
      if (!a) return "";
      return `You're at ${aStop(1)} now, and I'm handing you ${a.object}.\n\nSame thing, ${name} -- make it yours. What absurd thing is ${a.object} doing at ${aStop(1)}? The funnier, the better. Paint me a picture.`;
    }

    case "mirror-object-2": {
      const scene = state.userScenes[1] || "";
      const snippet = scene.length > 40 ? scene.substring(0, 40).trim() + "..." : scene;
      return `Oh, that's brilliant. "${snippet}" -- you really have a knack for this, ${name}. That image is locked in.\n\nOne more to go. You're doing beautifully.`;
    }

    case "place-object-3": {
      const a = state.assignments[2];
      if (!a) return "";
      return `Last one, ${name}. You're at ${aStop(2)}, and the object is ${a.object}.\n\nLet your imagination run completely wild on this one. What do you see?`;
    }

    case "mirror-object-3": {
      const scene = state.userScenes[2] || "";
      const snippet = scene.length > 40 ? scene.substring(0, 40).trim() + "..." : scene;
      return `"${snippet}" -- I love it, ${name}. All three are planted. Your Memory Palace is alive!\n\nNow here comes the real test. I'm going to walk you back through ${place.toLowerCase()}, and this time, you tell me what you see at each stop. No pressure -- this is just practice, and whatever you remember is a win.`;
    }

    case "walkthrough-intro":
      return `Take a breath, ${name}. Close your eyes if you like. You're standing at the entrance of ${place.toLowerCase()}. You know this place. You've been here before.\n\nNow, walk to your first stop...`;

    case "recall-1":
      return `You're at ${aStop(0)}. Something strange is happening here. What is it? What do you see, ${name}?`;

    case "react-recall-1": {
      const a = state.assignments[0];
      const answer = state.userAnswers[0] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `Yes! ${a?.object}! See, ${name}? Your brain held onto that image. That's the palace at work.\n\nKeep going -- walk to your next stop...`;
      }
      return `It was ${a?.object}. And you know what, ${name}? That's completely fine. The first time through, even the pros miss some. The image is planted -- it just needs a little watering.\n\nLet's keep walking...`;
    }

    case "recall-2":
      return `You're at ${aStop(1)} now. Look around. Something is definitely out of place here. What is it?`;

    case "react-recall-2": {
      const a = state.assignments[1];
      const answer = state.userAnswers[1] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `That's the one! ${a?.object}! Oh, ${name}, your palace is working beautifully.\n\nOne more. Last stop...`;
      }
      return `That was ${a?.object}. Don't you worry, ${name}. Every time you walk through ${place.toLowerCase()} in your mind, these pictures get sharper and sharper.\n\nLet's see about your last stop...`;
    }

    case "recall-3":
      return `And here you are at ${aStop(2)}. Last one, ${name}. What wild thing is waiting for you?`;

    case "react-recall-3": {
      const a = state.assignments[2];
      const answer = state.userAnswers[2] || "";
      const keyword = extractKeyword(a?.object || "");
      const isCorrect = answer.toLowerCase().includes(keyword);
      if (isCorrect) {
        return `${a?.object} -- you got it, ${name}! Brilliant finish!`;
      }
      return `That one was ${a?.object}. And honestly, ${name}, the fact that you walked through your whole palace just now? That takes real courage. The pictures will get clearer, I promise you.`;
    }

    case "final": {
      const count = state.correctCount;
      if (count === 3) {
        return `${name}, three out of three. A perfect walk through your very first Memory Palace. I have to tell you -- that doesn't happen often. You clearly have a wonderful imagination.\n\nYour palace at ${place.toLowerCase()} is yours now. Walk through it in your mind tonight before bed, and I bet those images will be even more vivid tomorrow. You can build new palaces for anything -- shopping lists, birthdays, phone numbers. The world is yours, ${name}. I'm so proud of you.`;
      }
      if (count >= 2) {
        return `${count} out of 3, ${name}! For your very first time? That is genuinely impressive. Your palace at ${place.toLowerCase()} is working.\n\nHere's a little secret -- if you walk through it one more time tonight, those images will get even stickier. Every palace gets stronger with practice. I had such a lovely time walking with you today, ${name}. You've got real talent for this.`;
      }
      if (count >= 1) {
        return `${count} out of 3 -- and ${name}, that is a real start. You know what the best part is? You built a Memory Palace from nothing in just a few minutes. That palace at ${place.toLowerCase()}? It's yours. The images are planted.\n\nTry this tonight: close your eyes and walk through ${place.toLowerCase()} one more time. Visit ${stop(0)}, then ${stop(1)}, then ${stop(2)}. I think you'll surprise yourself. I believe in you, ${name}.`;
      }
      return `${name}, listen to me. What you just did took courage. You built a palace at ${place.toLowerCase()}, you filled it with wild images, and you walked through it. That is the whole technique, and you just did it.\n\nThe pictures will get clearer. Tonight, try walking through ${place.toLowerCase()} in your mind -- ${stop(0)}, ${stop(1)}, ${stop(2)}. Let those funny images drift back. Each time, they'll stick a little more.\n\nI had a wonderful time with you today, ${name}. You've got this. I really mean that.`;
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
      return "Tell me about a place you love...";
    case "ask-stop-1":
    case "ask-stop-2":
    case "ask-stop-3":
      return "What do you see?";
    case "place-object-1":
    case "place-object-2":
    case "place-object-3":
      return "Describe what you imagine...";
    case "recall-1":
    case "recall-2":
    case "recall-3":
      return "What do you see at this stop?";
    default:
      return "Type your answer...";
  }
}
