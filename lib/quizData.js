// Question and result copy for the Founder Energy Quiz.
// Voice: Keith West, The Energetic Edge. British English, £ for money, no em dashes,
// no wellness language, founder lens. See voice profile / brand device docs for the rules
// this was checked against.

export const STATES = {
  EDGE: 'edge',
  FRANTIC: 'frantic',
  FOG: 'fog',
  BLOCKED: 'blocked',
};

export const STATE_LABELS = {
  [STATES.EDGE]: 'Edge',
  [STATES.FRANTIC]: 'Frantic',
  [STATES.FOG]: 'Fog',
  [STATES.BLOCKED]: 'Blocked',
};

// ---------------------------------------------------------------------------
// Questions 1-10: Yes / Sometimes / No, scored 2 / 1 / 0.
// 1-4 Energy, 5-7 Focus, 8-10 Capacity.
// ---------------------------------------------------------------------------

const YES_SOMETIMES_NO = [
  { value: 2, label: 'Yes' },
  { value: 1, label: 'Sometimes' },
  { value: 0, label: 'No' },
];

export const SCORED_QUESTIONS = [
  {
    id: 'q1',
    area: 'energy',
    text: 'Do you have enough energy to get through a full working day without needing caffeine or willpower to push through it?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q2',
    area: 'energy',
    text: 'Does your energy stay fairly steady through the afternoon?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q3',
    area: 'energy',
    text: 'Do you sleep well most nights, falling asleep easily and waking up rested?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q4',
    area: 'energy',
    text: 'After a demanding week, do you recover within a day or two rather than carrying it into the next one?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q5',
    area: 'focus',
    text: 'When you sit down to do the work that actually moves the business forward, can you get into it and stay there?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q6',
    area: 'focus',
    text: 'Do you trust the decisions you make day to day, without circling back to check them?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q7',
    area: 'focus',
    text: "Is your mind clear when you're working, rather than running a background list of everything else?",
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q8',
    area: 'capacity',
    text: 'Can you switch off from work in the evening, or is it always running somewhere in the background?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q9',
    area: 'capacity',
    text: 'When something goes wrong, do you deal with it and move on, rather than it staying with you for hours?',
    options: YES_SOMETIMES_NO,
  },
  {
    id: 'q10',
    area: 'capacity',
    text: 'Looking at the last three months, has your patience stayed fairly steady?',
    options: YES_SOMETIMES_NO,
  },
];

// ---------------------------------------------------------------------------
// Questions 11-14: single select.
// Q11 determines state. Q12 determines revenue band (drives next-steps order).
// Q13/Q14 map to Beehiiv custom fields outcome_90 / obstacle.
// ---------------------------------------------------------------------------

export const STATE_QUESTION = {
  id: 'q11',
  text: "Which of these is closest to how running your business feels right now?",
  options: [
    { value: STATES.EDGE, label: "Sharp and consistent. I want to see how much further this goes." },
    { value: STATES.FRANTIC, label: "Getting a lot done, but always slightly ahead of a crash." },
    { value: STATES.FOG, label: "Functioning, but the clarity and drive have gone quiet." },
    { value: STATES.BLOCKED, label: "I know what needs to happen. I can't make myself move on it." },
  ],
};

export const REVENUE_QUESTION = {
  id: 'q12',
  text: "What's your business currently doing in annual revenue?",
  field: 'revenue_band',
  options: [
    { value: 'pre_revenue', label: 'Pre-revenue' },
    { value: 'under_100k', label: 'Under £100k' },
    { value: '100_250k', label: '£100k – £250k' },
    { value: '250k_1m', label: '£250k – £1m' },
    { value: 'over_1m', label: 'Over £1m' },
  ],
};

export const OUTCOME_QUESTION = {
  id: 'q13',
  text: "If your energy, focus and capacity were sorted, what would change first in the next 90 days?",
  field: 'outcome_90',
  options: [
    { value: 'growth_work', label: "I'd finally get to the work that actually grows the business" },
    { value: 'stop_bottleneck', label: "I'd stop being the bottleneck my team is waiting on" },
    { value: 'faster_decisions', label: "I'd make decisions faster, and trust them" },
    { value: 'something_left', label: "I'd have something left for my family at the end of the day" },
  ],
};

export const OBSTACLE_QUESTION = {
  id: 'q14',
  text: "What's the single biggest thing standing in the way right now?",
  field: 'obstacle',
  options: [
    { value: 'no_energy', label: "I don't have the energy to sustain the pace" },
    { value: 'cant_switch_off', label: "I can't switch off long enough to think clearly" },
    { value: 'cant_delegate', label: "I don't trust anyone else to carry the load" },
    { value: 'dont_know_where', label: "I don't actually know where to start" },
  ],
};

export const NOTES_QUESTION = {
  id: 'q15',
  text: 'Anything else you want Keith to know before your result? (optional)',
  field: 'notes',
  optional: true,
};

export const SINGLE_SELECT_QUESTIONS = [STATE_QUESTION, REVENUE_QUESTION, OUTCOME_QUESTION, OBSTACLE_QUESTION];

// All 15 screens in display order (contact capture is a separate step before these).
export const ALL_QUESTIONS = [...SCORED_QUESTIONS, ...SINGLE_SELECT_QUESTIONS, NOTES_QUESTION];

// ---------------------------------------------------------------------------
// Result copy
// ---------------------------------------------------------------------------

// 12 headlines: 4 states x 3 score bands (high 70+, mid 40-69, low <40).
// Every headline names the state and uses the score. Edge is always framed as
// "how far do you want to go", never as a warning about being close to the line.
export const HEADLINES = {
  [STATES.EDGE]: {
    high: (score) =>
      `You're in Edge, and the number backs it up: ${score}%. Energy, focus and capacity are all working for you right now. The question isn't whether you're doing enough. It's whether you want to find out how far this version of you can actually go.`,
    mid: (score) =>
      `You're in Edge at ${score}%. The pattern is right even though the number isn't maxed out yet: you're operating from the state that works. Tighten a few things and you'll feel it within weeks, not months.`,
    low: (score) =>
      `You're in Edge, but ${score}% says you're calling it that more from habit than from how the last few months have actually gone. It's still the right state to build from. Let's find out what's quietly costing you the rest of it.`,
  },
  [STATES.FRANTIC]: {
    high: (score) =>
      `You're in Frantic at ${score}%, and the number tells the real story: plenty of drive, not much margin. You're getting through the list, but the pace is being paid for somewhere you're not looking.`,
    mid: (score) =>
      `Frantic, and ${score}% puts you right in the middle of it. Busy and productive have started to look like the same thing. They're not, and the gap between them is where your best decisions are going missing.`,
    low: (score) =>
      `You're in Frantic at ${score}%. Moving fast enough to convince most people you're fine, including yourself some days. The number says otherwise: this is urgency running the business, not you.`,
  },
  [STATES.FOG]: {
    high: (score) =>
      `Fog, at ${score}%, which is a better position than most founders reach this state with. You're still functioning well in places. It's the quiet parts, the drive and the clarity, that have gone missing.`,
    mid: (score) =>
      `You're in Fog at ${score}%. Nothing's fallen over. You're still showing up, still deciding things, still running the business. It just doesn't feel like you're the one leading it any more.`,
    low: (score) =>
      `Fog at ${score}%. This is the hardest state to name from the inside, because nothing dramatic has happened. You've gone quiet on yourself, and the business noticed before you did.`,
  },
  [STATES.BLOCKED]: {
    high: (score) =>
      `Blocked, at ${score}%, higher than you'd expect for this state. You can see exactly what needs to happen. Something is still stopping you moving on it, and it isn't a motivation problem.`,
    mid: (score) =>
      `You're in Blocked at ${score}%. The plan is there. The energy to execute it isn't, not consistently, and pushing harder has stopped working.`,
    low: (score) =>
      `Blocked at ${score}%, about as far as this pattern goes. Small decisions feel heavy. The gap between where you are and where you want to be feels like it's widening. It isn't. It's closeable, starting with one thing.`,
  },
};

// 9 insight blocks: 3 areas x 3 bands (strong 70+, mixed 40-69, weak <40).
export const AREA_INSIGHTS = {
  energy: {
    strong:
      "Your energy is solid. You've got fuel to work with, so any gains from here come from focus and capacity, not from trying to manufacture more drive.",
    mixed:
      "Your energy holds up some days and not others. That inconsistency costs you more than low energy on its own would, because you can't plan around it.",
    weak: "Your energy is the leak. Everything downstream of it, focus, decisions, patience, is running on a deficit that started here.",
  },
  focus: {
    strong:
      "Your focus is sharp. You get into the work that matters and stay there, which is rarer than it sounds.",
    mixed:
      "Your focus is there but it takes effort to hold onto. Deep work happens. It just costs more than it should.",
    weak: "Focus is where this is costing you most. The work that actually grows the business keeps losing out to whatever's loudest.",
  },
  capacity: {
    strong:
      "You switch off, you recover, and setbacks don't stay with you long. That's the part most founders never get round to building.",
    mixed:
      "You're managing, but recovery is patchy and things linger longer than they should. The margin is thinner than it looks from the inside.",
    weak: "Capacity is the ceiling right now. There's very little left over once the day's demands are met, and that's the first thing to rebuild.",
  },
};

export const AREA_LABELS = {
  energy: 'Energy',
  focus: 'Focus',
  capacity: 'Capacity',
};

// The Two Edges brand device, personalised per state.
export const TWO_EDGES_COPY = {
  intro:
    "Every founder is at an edge. The one you're on right now: Exhausted, Doubtful, Guilty, Erratic. The one you want: Energised, Directed, Grounded, Engaged. Same word, different footing.",
  line: "You haven't lost your edge. You've lost access to it.",
  byState: {
    [STATES.EDGE]: "Right now you're closer to the edge you want than most founders get. This is about how far you take it.",
    [STATES.FRANTIC]: "You're producing from the edge you don't want, and it's costing you more than it's giving back.",
    [STATES.FOG]: "You're a long way from the edge you want, and it happened quietly enough that you might not have named it until now.",
    [STATES.BLOCKED]: "You can see the edge you want. Getting access to it is what's missing, not the will to get there.",
  },
};

// Contact block copy (same across states).
export const CONTACT_COPY = {
  heading: 'Talk to Keith directly',
  body: "Questions about your result, the programme, or what to do next: email hello@theenergeticedge.com or use the free call above.",
};

export const SHARE_COPY = {
  buttonLabel: 'Share your result',
  text: (stateLabel, score) =>
    `I just found out I'm in ${stateLabel} state, scoring ${score}% on the Founder Energy Quiz. Find out yours:`,
};
