// Question and result copy for the Founder Energy Quiz.
// Voice: Keith West, The Energetic Edge. British English, £ for money, no em dashes,
// no wellness language, founder lens. See voice profile / brand device docs for the rules
// this was checked against.
//
// Scoring model: two axes only, Energy (vertical) and Focus (horizontal). No Capacity.
// Q1-5 score Energy, Q6-10 score Focus, Q11 scores both at once (it's the original
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
// Questions 1-10: four options each, scored 3 / 2 / 1 / 0.
// 1-5 Energy, 6-10 Focus.
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
    area: 'energy',
    text: 'Across a typical month, how consistent is your energy?',
    options: [
      { value: 3, label: "Consistent, I know when I'll be sharp" },
      { value: 2, label: 'Fairly steady with occasional dips' },
      { value: 1, label: 'Big swings, I cycle between high and flat' },
      { value: 0, label: "Low most of the time regardless of what's happening" },
    ],
  },
  {
    id: 'q6',
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
    id: 'q7',
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
    id: 'q8',
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
    id: 'q9',
    area: 'focus',
    text: "When something urgent hits, what's your typical response?",
    options: [
      { value: 3, label: 'Calm and focused, I handle it and move on' },
      { value: 2, label: 'I manage it, but it knocks my day off track' },
      { value: 1, label: 'I react fast and hard, then feel drained after' },
      { value: 0, label: 'I freeze, avoid, or spiral' },
    ],
  },
  {
    id: 'q10',
    area: 'focus',
    text: 'By the end of a normal week, has the work that actually matters moved forward?',
    options: [
      { value: 3, label: 'Yes, consistently' },
      { value: 2, label: 'Mostly, though some weeks slip' },
      { value: 1, label: 'Rarely, it keeps getting pushed to next week' },
      { value: 0, label: 'No, the important work never seems to move' },
    ],
  },
];

// Question 11: kept word for word from the original state-picker, but now scores
// both axes at once rather than being read directly as the state.
export const DUAL_QUESTION = {
  id: 'q11',
  text: 'Which of these is closest to how running your business feels right now?',
  options: [
    { value: 'sharp', label: 'Sharp and consistent. I want to see how much further this goes.', energy: 3, focus: 3 },
    { value: 'crash', label: 'Getting a lot done, but always slightly ahead of a crash.', energy: 3, focus: 0 },
    { value: 'quiet', label: 'Functioning, but the clarity and drive have gone quiet.', energy: 0, focus: 0 },
    { value: 'stuck', label: "I know what needs to happen. I can't make myself move on it.", energy: 0, focus: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Questions 12-14: single select, business context (don't feed the score).
// ---------------------------------------------------------------------------

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

export const SINGLE_SELECT_QUESTIONS = [REVENUE_QUESTION, OUTCOME_QUESTION, OBSTACLE_QUESTION];

// All 15 screens in display order (contact capture is a separate step after these).
export const ALL_QUESTIONS = [...SCORED_QUESTIONS, DUAL_QUESTION, ...SINGLE_SELECT_QUESTIONS, NOTES_QUESTION];

// ---------------------------------------------------------------------------
// Result copy
// ---------------------------------------------------------------------------

// One explainer per state: names it, says what it feels like from the inside, then
// points at what it means. Edge is the only one that celebrates. The score still
// exists internally (drives which of the four states a founder lands in) but is
// never shown or referenced in this copy.
export const HEADLINES = {
  [STATES.EDGE]:
    "Your energy's good and you're operating at a high level. Most of the system is already in place: you move, you sleep, you know what matters and you get to it. That puts you ahead of most founders who take this quiz. So the question isn't what's wrong. It's how far you want to take this. There's a version of you with more in reserve, cleaner decisions and a business that needs you less. Let's see if you want to really fly.",
  [STATES.FRANTIC]:
    "Everything's urgent. You're moving fast, all day, and you're still not sure any of it is moving you forward. The inbox runs the calendar, the calendar runs you, and by the evening you're wired and flat at the same time. This isn't a discipline problem. Your nervous system is running on stress, and stress is very good at making activity feel like progress. The first job is to get you off adrenaline. Speed comes back on its own once you're running on fuel.",
  [STATES.FOG]:
    "The output's gone quiet. You sit down to work and the clarity you used to rely on just isn't there, so you push harder, and that makes it worse. It's tempting to read this as losing your edge. You haven't. You've lost access to it. Fog is what a depleted system does to a sharp mind, and it lifts when the system is regulated, not when you finally find the right productivity tool. This is fixable, and quicker than you'd think.",
  [STATES.BLOCKED]:
    "You're stalled, and pushing has stopped working. Decisions sit. Things you'd normally do without thinking now feel like lifting something heavy. If you've been telling yourself it's motivation, it isn't. Blocked is what happens when the body has decided the business is a threat and quietly pulled the handbrake. You can't outwork that. You can regulate it, and once you do, the momentum you've been forcing starts to come back on its own.",
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
