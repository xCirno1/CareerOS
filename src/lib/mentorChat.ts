/**
 * Mock chat data for Mentor Match. UI/UX only — no backend. Seeds a couple of
 * existing conversations and provides canned mentor replies so the chat feels
 * alive when you send a message.
 */

export type ChatAuthor = 'me' | 'mentor';

export interface ChatMessage {
  id: string;
  from: ChatAuthor;
  text: string;
  /** epoch ms */
  ts: number;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

let seq = 0;
export function chatId(): string {
  seq += 1;
  return `msg-${Date.now().toString(36)}-${seq}`;
}

/** Seed conversation history keyed by mentor id. Only matched mentors start with history. */
export function seedConversations(): Record<string, ChatMessage[]> {
  const now = Date.now();
  return {
    m3: [
      {
        id: chatId(),
        from: 'mentor',
        text: "Hi! Thanks for the match — I read your route brief from Data Analyst toward Product Lead. The shape of it makes sense.",
        ts: now - 2 * DAY - 3 * HOUR,
      },
      {
        id: chatId(),
        from: 'me',
        text: "Thank you! My biggest worry is that my evidence still reads as 'analyst' rather than 'product'. Where would you start?",
        ts: now - 2 * DAY - 2 * HOUR,
      },
      {
        id: chatId(),
        from: 'mentor',
        text: 'Totally normal. Pick one project where you influenced a decision, not just reported a number. We can reframe it as a discovery → bet → outcome story.',
        ts: now - 2 * DAY - 1 * HOUR - 40 * MIN,
      },
      {
        id: chatId(),
        from: 'me',
        text: "That's really helpful. I have a churn dashboard that led the team to change onboarding — could that work?",
        ts: now - 1 * DAY - 5 * HOUR,
      },
      {
        id: chatId(),
        from: 'mentor',
        text: "Perfect candidate. Bring it Friday and we'll turn it into your strongest product-adjacent proof point. 👍",
        ts: now - 1 * DAY - 4 * HOUR - 30 * MIN,
      },
    ],
    m4: [
      {
        id: chatId(),
        from: 'mentor',
        text: 'Hey! Excited to help on the design-engineering bridge. Do you have a portfolio link I can look at before Saturday?',
        ts: now - 1 * DAY - 2 * HOUR,
      },
      {
        id: chatId(),
        from: 'me',
        text: "Yes — I'll send it over tonight. It's mostly frontend work, not much design-system stuff yet.",
        ts: now - 1 * DAY - 1 * HOUR - 20 * MIN,
      },
      {
        id: chatId(),
        from: 'mentor',
        text: "That's exactly the gap worth closing. We'll outline one case study that shows you owning the bridge end to end.",
        ts: now - 6 * HOUR,
      },
    ],
  };
}

/** Generic canned replies, lightly themed by the mentor's first topic. */
const GENERIC_REPLIES = [
  "Good question — let's unpack that in our next session.",
  'That makes sense. Can you share a bit more context on where you are now?',
  "Love that you're thinking about it this way. Here's how I'd frame it…",
  "Agreed. The key is to turn that into one piece of evidence you can point to.",
  "Let's not over-engineer it. Start small, ship one thing, then we iterate.",
  "I've seen this exact situation before — you're closer than you think.",
  'Bring that to our session and we can work through it properly. 🙂',
  "Honestly? Most people overthink this. Focus on the proof point first.",
];

const TOPIC_REPLIES: Record<string, string[]> = {
  'Career ladders': ['Map it to the next level’s scope, not your current output. That’s where promotion cases are won.'],
  'IC to EM': ["Test it cheaply first — run a small leadership experiment before committing to the title."],
  'Analyst to PM': ['Reframe one analysis as a decision you drove. That’s the product muscle hiring teams look for.'],
  'Design systems': ['Pick one component and take it from token to adoption. That story sells the whole skillset.'],
  'LLMs in production': ['Evals first. A small, honest eval set will teach you more than another prompt tweak.'],
  '0 to 1': ['Validate the riskiest assumption this week. Everything else can wait.'],
};

export function cannedReply(firstTopic: string | undefined, turn: number): string {
  const topical = firstTopic ? TOPIC_REPLIES[firstTopic] : undefined;
  if (topical && turn === 0) return topical[0];
  return GENERIC_REPLIES[turn % GENERIC_REPLIES.length];
}

/** Short relative time like "2d", "3h", "5m", "now". */
export function relativeTime(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  if (diff < MIN) return 'now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Clock time like "2:30 PM" for message bubbles. */
export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Day label used as a separator between message groups. */
export function dayLabel(ts: number, now = Date.now()): string {
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: 'long' });
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
