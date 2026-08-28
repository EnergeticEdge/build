// Question and result copy for the Founder Energy Quiz.
// Voice: Keith West, The Energetic Edge. British English, £ for money, no em dashes,
// no wellness language, founder lens. See voice profile / brand device docs for the rules
// this was checked against.
//
// Scoring model: two axes, Energy and Focus, 8 questions each (Q1-16), scored 0-3.
// Matches the question bank and thresholds from an earlier HTML prototype Keith asked
// to bring back for its design and question set. Q17-20 are Railway's own qualifying
// questions (revenue band, 90-day outcome, obstacle, notes) and don't feed the score.
// See lib/scoring.js for how Energy/Focus land on a state.

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
// Questions 1-16: four options each, scored 3 / 2 / 1 / 0. Odd = Energy, even = Focus,
// matching the source order. Options are shuffled at render time (see QuestionScreen),
// not sorted by score, so there's no positional tell.
// ---------------------------------------------------------------------------

export const SCORED_QUESTIONS = [
  {
    id: 'q1',
    area: 'energy',
    text: "It's a normal working day. How do you feel when you wake up?",
    options: [
      { value: 3, label: "Ready. Most days there's fuel in the tank before the coffee." },
      { value: 2, label: 'Decent once I get moving.' },
      { value: 1, label: 'Tired, but I push through on caffeine and momentum.' },
      { value: 0, label: 'Honestly? A low-level dread before my feet hit the floor.' },
    ],
  },
  {
    id: 'q2',
    area: 'focus',
    text: 'You sit down to work on the single most important thing in the business. What happens?',
    options: [
      { value: 3, label: 'I get proper time on it most days. It moves.' },
      { value: 2, label: 'I get to it, but usually later and shallower than I planned.' },
      { value: 1, label: 'I circle it. Something "urgent" always jumps the queue.' },
      { value: 0, label: "I couldn't tell you the last time I had an uninterrupted hour on it." },
    ],
  },
  {
    id: 'q3',
    area: 'energy',
    text: "Where's your energy at 3pm?",
    options: [
      { value: 3, label: 'Still solid. The afternoon is real working time for me.' },
      { value: 2, label: 'Dips a bit, but recoverable.' },
      { value: 1, label: "Running on fumes. I'm surviving to the end of the day." },
      { value: 0, label: 'Gone. Anything after lunch is damage limitation.' },
    ],
  },
  {
    id: 'q4',
    area: 'focus',
    text: "How many browser tabs, half-written messages and part-done jobs are open in your head right now?",
    options: [
      { value: 3, label: 'A handful, and I know exactly why each one is there.' },
      { value: 2, label: "More than I'd like, but it's manageable." },
      { value: 1, label: 'Loads. My brain feels like popcorn most days.' },
      { value: 0, label: "I've stopped counting. Everything is open and nothing is finished." },
    ],
  },
  {
    id: 'q5',
    area: 'energy',
    text: "It's 8pm. Can you actually switch off?",
    options: [
      { value: 3, label: "Yes. When I'm done, I'm done." },
      { value: 2, label: 'Mostly, though the phone stays within reach.' },
      { value: 1, label: "I'm physically home but mentally still on site." },
      { value: 0, label: 'Switch off? The business is in my head until I fall asleep.' },
    ],
  },
  {
    id: 'q6',
    area: 'focus',
    text: 'Think about the last month. The things you started, how many got finished?',
    options: [
      { value: 3, label: "Nearly all of them. I don't start what I won't finish." },
      { value: 2, label: 'Most, with a few stragglers.' },
      { value: 1, label: 'Maybe half. The rest are "in progress", which means stalled.' },
      { value: 0, label: "I'm brilliant at starting. Finishing is another story." },
    ],
  },
  {
    id: 'q7',
    area: 'energy',
    text: 'How are you sleeping?',
    options: [
      { value: 3, label: 'Well. I wake up restored more often than not.' },
      { value: 2, label: "OK, but not as deep as it used to be." },
      { value: 1, label: "Broken. I'm awake at 3am running the business in my head." },
      { value: 0, label: "Badly, and it's been that way so long it feels normal." },
    ],
  },
  {
    id: 'q8',
    area: 'focus',
    text: 'A decision lands on your desk that only you can make. What happens?',
    options: [
      { value: 3, label: 'I decide quickly and rarely revisit it.' },
      { value: 2, label: 'I decide, but I chew on it longer than I should.' },
      { value: 1, label: 'I park it, and parked decisions pile up.' },
      { value: 0, label: "I avoid it, then make it in a rush when it's forced on me." },
    ],
  },
  {
    id: 'q9',
    area: 'energy',
    text: 'A full weekend off with no laptop. How do you feel by Monday morning?',
    options: [
      { value: 3, label: 'Recharged. Weekends genuinely top me back up.' },
      { value: 2, label: 'Better, though it takes most of Sunday to unwind.' },
      { value: 1, label: "About the same. Rest doesn't seem to touch the tiredness." },
      { value: 0, label: 'What full weekend off?' },
    ],
  },
  {
    id: 'q10',
    area: 'focus',
    text: 'Right now, without checking anything, do you know the one thing that matters most in the business this week?',
    options: [
      { value: 3, label: 'Yes, instantly, and my week is built around it.' },
      { value: 2, label: "Yes, but my diary doesn't reflect it." },
      { value: 1, label: 'I\'ve got five "most important" things, which means none.' },
      { value: 0, label: "No. I'm reacting to whatever shouts loudest." },
    ],
  },
  {
    id: 'q11',
    area: 'energy',
    text: 'Training, decent food, getting outside. Where does looking after yourself sit on your list?',
    options: [
      { value: 3, label: "Non-negotiable. It's how I keep the machine running." },
      { value: 2, label: 'Regular-ish. It slips when work ramps up.' },
      { value: 1, label: 'Bottom of the list. The business eats that time first.' },
      { value: 0, label: 'What list? I stopped looking after myself a while ago.' },
    ],
  },
  {
    id: 'q12',
    area: 'focus',
    text: 'How often do you reach for your phone or inbox between tasks?',
    options: [
      { value: 3, label: "Rarely. I check on my schedule, not its schedule." },
      { value: 2, label: "A few times an hour, if I'm honest." },
      { value: 1, label: "Constantly. It's a reflex I don't even notice any more." },
      { value: 0, label: 'My phone runs the day. I just live in it.' },
    ],
  },
  {
    id: 'q13',
    area: 'energy',
    text: "How's your fuse lately, with the team, with clients, at home?",
    options: [
      { value: 3, label: 'Long. I respond rather than react.' },
      { value: 2, label: 'Mostly fine, with the odd flash I regret.' },
      { value: 1, label: "Shorter than it used to be. People are noticing." },
      { value: 0, label: 'Hair-trigger. Snapping has become my default setting.' },
    ],
  },
  {
    id: 'q14',
    area: 'focus',
    text: 'How much of your day gets eaten by other people\'s problems, questions and "quick ones"?',
    options: [
      { value: 3, label: 'A controlled slice. There are clear lines around my time.' },
      { value: 2, label: 'A fair chunk, but I claw time back.' },
      { value: 1, label: "Most of it. I'm the answer machine for the whole business." },
      { value: 0, label: "All of it. If I'm not available, things stop." },
    ],
  },
  {
    id: 'q15',
    area: 'energy',
    text: 'If you kept running at your current pace, how long before something gives?',
    options: [
      { value: 3, label: 'Years. This pace is built to last.' },
      { value: 2, label: "A year or so before I'd need a proper reset." },
      { value: 1, label: 'Months. I can feel the tank draining.' },
      { value: 0, label: "I think something's already giving." },
    ],
  },
  {
    id: 'q16',
    area: 'focus',
    text: 'Last question. Who ran today, you or the day?',
    options: [
      { value: 3, label: 'I ran it. The day went roughly where I pointed it.' },
      { value: 2, label: 'Mixed, but I won more hours than I lost.' },
      { value: 1, label: 'The day ran me, again.' },
      { value: 0, label: 'The day, the phone, the inbox, everyone but me.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Questions 17-20: single select, business context (don't feed the score).
// ---------------------------------------------------------------------------

export const REVENUE_QUESTION = {
  id: 'q17',
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
  id: 'q18',
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
  id: 'q19',
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
  id: 'q20',
  text: 'Anything else you want Keith to know before your result? (optional)',
  field: 'notes',
  optional: true,
};

export const SINGLE_SELECT_QUESTIONS = [REVENUE_QUESTION, OUTCOME_QUESTION, OBSTACLE_QUESTION];

// All 20 screens in display order (contact capture is a separate step after these).
export const ALL_QUESTIONS = [...SCORED_QUESTIONS, ...SINGLE_SELECT_QUESTIONS, NOTES_QUESTION];

// ---------------------------------------------------------------------------
// Result copy
// ---------------------------------------------------------------------------

// Short punchy line per state, shown big under the state name. Edge is the only one
// that celebrates, never a warning about being close to the line.
export const SHORT_HEADLINES = {
  [STATES.EDGE]: "You're on your Edge. Energised. Directed. Grounded. Engaged.",
  [STATES.FRANTIC]: "You're in Frantic. Everything feels urgent.",
  [STATES.FOG]: "You're in Fog. Your output has gone quiet.",
  [STATES.BLOCKED]: "You're Blocked. And pushing harder is making it worse.",
};

// The longer explainer per state: what it feels like from the inside, then what it
// means. Score isn't shown or referenced here, only the state.
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

// Per-state name for the free call, matching the state rather than one generic label.
export const CALL_LABELS = {
  [STATES.EDGE]: 'Book an Edge Call',
  [STATES.FRANTIC]: 'Book a Focus Call',
  [STATES.FOG]: 'Book a Clarity Call',
  [STATES.BLOCKED]: 'Book a Recharge Call',
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
