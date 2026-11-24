export type Boat = "scout" | "deck" | "social"
type Metric = "sound" | "captions" | "signal" | "audience" | "trust"
export type FilmState = Record<Metric, number> & { screening: boolean }
type Channel = "house" | "titles" | "relay"

export type FilmBeat = {
  boat: Boat
  action: string
  line: string
  reason: string
  seconds: number
  clock: number
  state: FilmState
}
export type Film = {
  title: string
  opening: string
  initialState: FilmState
  seed: number
  ending: string
  beats: FilmBeat[]
}

type Move = {
  boat: Boat
  action: string
  lines: string[]
  effects: Partial<Record<Metric, number>>
  requires?: (world: FilmState) => boolean
  channel?: Channel
}

const moves: Move[] = [
  { boat: "scout", action: "Read the front row", lines: ["They're still in their seats. I'll ask what they can hear.", "The back row heard that cue, too. Word is getting around."], effects: { trust: 23, audience: 12 } },
  { boat: "scout", action: "Recruit a caption reader", lines: ["Someone in row three reads lips. Can you sit with our editor?", "Our reader caught a missing word. Put it back before the reveal."], effects: { captions: 26, trust: 10 } },
  { boat: "scout", action: "Find a relay audience", lines: ["The foyer has a projector. Give me the people stuck outside.", "There are coats on every chair out here. They're waiting for your picture."], effects: { signal: 18, audience: 21 } },
  { boat: "deck", action: "Patch the house sound", lines: ["I hear the projector motor. Give me a minute at the patch bay.", "There. Try the house speakers again, from the top."], effects: { sound: 34, trust: -3 } },
  { boat: "deck", action: "Cut a silent reel", lines: ["I can carry the scene on faces. Put the first title over black.", "Hold on her face for two more frames. Now the title lands."], effects: { captions: 36, audience: -3 } },
  { boat: "deck", action: "Feed the foyer projector", lines: ["I've got a clean picture on the little monitor. Take that feed.", "The foyer picture is steady. I'll lock the frame rate."], effects: { signal: 29, sound: 6 } },
  { boat: "social", action: "Send a listening cue", lines: ["When you hear the bell, raise a hand. Even the last row.", "Hands went up by the exit. Deck, the bell is reaching them."], effects: { sound: 18, trust: 16 } },
  { boat: "social", action: "Mirror the feed", lines: ["I can see your test frame in the foyer. I'm opening the second screen.", "Both screens have the same frame. Let the people at the doors in."], effects: { signal: 30, audience: 10 } },
  { boat: "social", action: "Proof the title cards", lines: ["I lost the last word from the aisle. Make that card bigger.", "I can read the whole line from the exit now."], effects: { captions: 23, trust: 13 } },
  { boat: "deck", action: "Roll house sound", lines: ["House lights down. Listen for the first breath."], requires: w => w.sound >= 68, effects: { audience: 12 }, channel: "house" },
  { boat: "scout", action: "Open the caption premiere", lines: ["Our reader can see every word. Roll the picture."], requires: w => w.captions >= 68, effects: { trust: 12 }, channel: "titles" },
  { boat: "social", action: "Start the foyer premiere", lines: ["The foyer is ready. Take us live on the count of three."], requires: w => w.signal >= 68 && w.audience >= 40, effects: { audience: 16 }, channel: "relay" },
]

const boats: Boat[] = ["scout", "deck", "social"]
const metrics: Metric[] = ["sound", "captions", "signal", "audience", "trust"]
const channelNames: Record<Channel, string> = {
  house: "The house hears the first breath",
  titles: "The premiere speaks in title cards",
  relay: "The foyer becomes the premiere",
}
const channels: Record<Channel, Metric> = { house: "sound", titles: "captions", relay: "signal" }
const aims: Record<Boat, Record<Metric, number>> = {
  scout: { sound: .15, captions: .55, signal: .4, audience: .9, trust: .8 },
  deck: { sound: .9, captions: .75, signal: .65, audience: .25, trust: .2 },
  social: { sound: .45, captions: .65, signal: .9, audience: .8, trust: .6 },
}
const metricNames: Record<Metric, string> = { sound: "house sound", captions: "title readability", signal: "foyer signal", audience: "audience reach", trust: "audience confidence" }
const clamp = (value: number) => Math.max(0, Math.min(100, value))

function seeded(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function makeFilm(seed: number): Film {
  const random = seeded(seed)
  const initialState: FilmState = { sound: 0, captions: 8, signal: 12, audience: 48, trust: 52, screening: false }
  const state = { ...initialState }
  // Each run casts the specialists with different priorities. Their observations
  // and opening conditions are identical until somebody takes an action.
  const specialists = boats.map(boat => ({
    boat,
    weights: Object.fromEntries(metrics.map(m => [m, aims[boat][m] * (.35 + random() * 1.9)])) as Record<Metric, number>,
    history: new Map<string, number>(),
    lastTurn: -1,
  }))
  const beats: FilmBeat[] = []
  let ending = "The lights come up for a second rehearsal"
  for (let turn = 0; turn < 9; turn++) {
    const prior = beats.at(-1)
    const proposals = specialists.flatMap(agent => {
      const options = moves.filter(move => move.boat === agent.boat && (!move.channel || turn === 8) && (!move.requires || move.requires(state)))
      return options.map(move => {
        const repeats = agent.history.get(move.action) ?? 0
        const gains = metrics.map(metric => {
          const delta = clamp(state[metric] + (move.effects[metric] ?? 0)) - state[metric]
          return { metric, value: delta * agent.weights[metric] * (1.35 - state[metric] / 120) }
        }).sort((a, b) => b.value - a.value)
        const focus = move.channel ? channels[move.channel] : gains[0].metric
        // Completing another specialist's handoff helps when their last move
        // advanced this specialist's intended screening channel.
        const previous = beats.at(-2)?.state ?? initialState
        const handoff = prior && prior.boat !== agent.boat && state[focus] > previous[focus] ? 6 : 0
        const score = gains.reduce((total, g) => total + g.value, 0)
          + handoff + 8 * (turn - agent.lastTurn) - repeats * 7
          + (move.channel ? 200 + state[focus] * agent.weights[focus] : 0)
        return { move, agent, repeats, focus, score, handoff }
      })
    })
    const { move, agent, repeats, focus, handoff } = proposals.sort((a,b) => b.score - a.score)[0]
    const observation = state[focus]
    for (const metric of metrics) state[metric] = clamp(state[metric] + (move.effects[metric] ?? 0))
    if (move.channel) {
      state.screening = true
      ending = channelNames[move.channel]
    } else {
      // An audience waiting in darkness gradually disperses.
      state.audience = clamp(state.audience - 2)
    }
    agent.history.set(move.action, repeats + 1)
    agent.lastTurn = turn
    const reason = move.channel
      ? `At ${observation}/100, ${metricNames[focus]} is ready to carry the premiere.`
      : `${handoff && prior ? `Following “${prior.action}”, ` : ""}${metricNames[focus]} stands at ${observation}/100. This move gains ${state[focus] - observation} points there.`
    beats.push({ boat: move.boat, action: move.action, line: move.lines[Math.min(repeats, move.lines.length - 1)], reason, seconds: 8, clock: turn * 8, state: { ...state } })
  }
  return { title: "The Last Soundcheck", opening: "The venue sound drops just before the premiere.", initialState, seed, ending, beats }
}
