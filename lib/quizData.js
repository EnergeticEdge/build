// Question and result copy for the Founder Energy Quiz.
// Voice: Keith West, The Energetic Edge. British English, £ for money, no em dashes,
// no wellness language, founder lens. See voice profile / brand device docs for the rules
// this was checked against.
//
// Scoring model: two axes only, Energy (vertical) and Focus (horizontal). No Capacity.
// Q1-4 score Energy, Q5-8 score Focus, Q9 scores both at once (it's the original
// "which state are you in" question, kept word for word, but now contributing points
// to both axes per option rather than being read directly as the state). State is
// computed from where Energy and Focus land, not self-reported. See lib/scoring.js.

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
// Questions 1-8: four options each, scored 3 / 2 / 1 / 0.
// 1-4 Energy, 5-8 Focus.
// ---------------------------------------------------------------------------

export const SCORED_QUESTIONS = [
  {
    id: 'q1',
    area: 'energy',
    text: 'Do you have enough energy to get through a full working day without needing caffeine or willpower to push through it?',
    options: [
      { value: 3, label: 'Yes, consistently' },
      { value: 2, label: 'Most days' },
      { value: 1, label: 'Some days' },
      { value: 0, label: 'Rarely' },
    ],
  },
  {
    id: 'q2',
    area: 'energy',
    text: 'Does your energy stay steady through the afternoon?',
    options: [
      { value: 3, label: "Yes, I'm still sharp after 2pm" },
      { value: 2, label: 'It dips a little but I manage it' },
      { value: 1, label: 'I rely on caffeine to get through it' },
      { value: 0, label: 'The afternoon is a write-off most days' },
    ],
  },
  {
    id: 'q3',
    area: 'energy',
    text: 'Do you sleep well most nights?',
    options: [
      { value: 3, label: 'Yes, I fall asleep easily and wake rested' },
      { value: 2, label: 'Mostly, with the odd rough night' },
      { value: 1, label: 'Mixed, I often wake tired' },
      { value: 0, label: 'No, sleep is a real problem' },
    ],
  },
  {
    id: 'q4',
    area: 'energy',
    text: 'After a demanding week, how fast do you recover?',
    options: [
      { value: 3, label: "A day or so and I'm back" },
      { value: 2, label: 'The weekend sorts me out' },
      { value: 1, label: 'I need most of the following week too' },
      { value: 0, label: "I don't really recover before the next thing hits" },
    ],
  },
  {
    id: 'q5',
    area: 'focus',
    text: 'When you sit down to do the work that actually moves the business forward, can you get into it and stay there?',
    options: [
      { value: 3, label: 'Yes, I get in quickly and hold it' },
      { value: 2, label: 'Mostly, it just takes a few minutes to settle' },
      { value: 1, label: 'I get there eventually but lose it fast' },
      { value: 0, label: "Rarely, I'm always in reactive mode" },
    ],
  },
  {
    id: 'q6',
    area: 'focus',
    text: 'Do you trust the decisions you make day to day?',
    options: [
      { value: 3, label: 'Yes, my instincts are reliable' },
      { value: 2, label: 'Mostly, a few feel harder than they should' },
      { value: 1, label: "I second-guess myself more than I'd like" },
      { value: 0, label: "I'm delaying decisions or making them reactively" },
    ],
  },
  {
    id: 'q7',
    area: 'focus',
    text: "Is your mind clear when you're working, rather than running a background list of everything else?",
    options: [
      { value: 3, label: 'Clear, I can prioritise easily' },
      { value: 2, label: 'Some background noise but I manage it' },
      { value: 1, label: "Loud, I'm constantly running through loops" },
      { value: 0, label: 'Relentless, the list never quiets' },
    ],
  },
  {
    id: 'q8',
    area: 'focus',
    text: "When something urgent hits, what's your typical response?",
    options: [
      { value: 3, label: 'Calm and focused, I handle it and move on' },
      { value: 2, label: 'I manage it, but it knocks my day off track' },
      { value: 1, label: 'I react fast and hard, then feel drained after' },
      { value: 0, label: 'I freeze, avoid, or spiral' },
    ],
  },
];

// Question 9: kept word for word from the original state-picker, but now scores
// both axes at once rather than being read directly as the state.
export const DUAL_QUESTION = {
  id: 'q9',
  text: 'Which of these is closest to how running your business feels right now?',
  options: [
    { value: 'sharp', label: 'Sharp and consistent. I want to see how much further this goes.', energy: 3, focus: 3 },
    { value: 'crash', label: 'Getting a lot done, but always slightly ahead of a crash.', energy: 3, focus: 0 },
    { value: 'quiet', label: 'Functioning, but the clarity and drive have gone quiet.', energy: 0, focus: 0 },
    { value: 'stuck', label: "I know what needs to happen. I can't make myself move on it.", energy: 0, focus: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Questions 10-12: single select, business context (don't feed the score).
// ---------------------------------------------------------------------------

export const REVENUE_QUESTION = {
  id: 'q10',
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
  id: 'q11',
  text: 'If your energy and focus were sorted, what would change first in the next 90 days?',
  field: 'outcome_90',
  options: [
    { value: 'growth_work', label: "I'd finally get to the work that actually grows the business" },
    { value: 'stop_bottleneck', label: "I'd stop being the bottleneck my team is waiting on" },
    { value: 'faster_decisions', label: "I'd make decisions faster, and trust them" },
    { value: 'something_left', label: "I'd have something left for my family at the end of the day" },
  ],
};

export const OBSTACLE_QUESTION = {
  id: 'q12',
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
  id: 'q13',
  text: 'Anything else you want Keith to know before your result? (optional)',
  field: 'notes',
  optional: true,
};

export const SINGLE_SELECT_QUESTIONS = [REVENUE_QUESTION, OUTCOME_QUESTION, OBSTACLE_QUESTION];

// All 13 screens in display order (contact capture is a separate step before these).
export const ALL_QUESTIONS = [...SCORED_QUESTIONS, DUAL_QUESTION, ...SINGLE_SELECT_QUESTIONS, NOTES_QUESTION];

// ---------------------------------------------------------------------------
// Result copy
// ---------------------------------------------------------------------------

// 12 headlines: 4 states x 3 internal bands (high 70+, mid 40-69, low <40). The band
// is still computed from the score, but the score itself is never shown to the
// founder, only the state and this explainer. Edge is always framed as "how far do
// you want to go", never as a warning about being close to the line.
export const HEADLINES = {
  [STATES.EDGE]: {
    high: "You're in Edge, and it shows. Energy and focus are both working for you right now. The question isn't whether you're doing enough. It's whether you want to find out how far this version of you can actually go.",
    mid: "You're in Edge. The pattern is right, even if it isn't fully locked in yet: you're operating from the state that works. Tighten a few things and you'll feel it within weeks, not months.",
    low: "You're in Edge, but you're calling it that more from habit than from how the last few months have actually gone. It's still the right state to build from. Let's find out what's quietly costing you the rest of it.",
  },
  [STATES.FRANTIC]: {
    high: "You're in Frantic, and it's the real story: plenty of drive, not much margin. You're getting through the list, but the pace is being paid for somewhere you're not looking.",
    mid: "You're in Frantic, right in the middle of it. Busy and productive have started to look like the same thing. They're not, and the gap between them is where your best decisions are going missing.",
    low: "You're in Frantic. Moving fast enough to convince most people you're fine, including yourself some days. Underneath it, this is urgency running the business, not you.",
  },
  [STATES.FOG]: {
    high: "You're in Fog, though a better version of it than most founders reach this state with. You're still functioning well in places. It's the quiet parts, the drive and the clarity, that have gone missing.",
    mid: "You're in Fog. Nothing's fallen over. You're still showing up, still deciding things, still running the business. It just doesn't feel like you're the one leading it any more.",
    low: "You're in Fog. This is the hardest state to name from the inside, because nothing dramatic has happened. You've gone quiet on yourself, and the business noticed before you did.",
  },
  [STATES.BLOCKED]: {
    high: "You're in Blocked, higher up than you'd expect for this state. You can see exactly what needs to happen. Something is still stopping you moving on it, and it isn't a motivation problem.",
    mid: "You're in Blocked. The plan is there. The energy to execute it isn't, not consistently, and pushing harder has stopped working.",
    low: "You're in Blocked, about as deep into this pattern as it goes. Small decisions feel heavy. The gap between where you are and where you want to be feels like it's widening. It isn't. It's closeable, starting with one thing.",
  },
};

// 6 insight blocks: 2 areas x 3 bands (strong 70+, mixed 40-69, weak <40).
export const AREA_INSIGHTS = {
  energy: {
    strong:
      "Your energy is solid. You've got fuel to work with, so any gains from here come from focus, not from trying to manufacture more drive.",
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
};

export const AREA_LABELS = {
  energy: 'Energy',
  focus: 'Focus',
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
  text: (stateLabel) => `I just found out I'm in ${stateLabel} state on the Founder Energy Quiz. Find out yours:`,
};
