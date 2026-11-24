# Armada Harbor — The Last Soundcheck

The house sound fails minutes before a waterfront premiere. Three crews on San Francisco Bay have one screening to save. Scout can find another audience, Deck can repair the sound or cut a silent reel, and Cutting Room can relay the picture to a second screen. Each move changes the next crew’s options.

**Watch the 25-second project demo first.** It shows how to inspect the crew, follow a handoff between Boats, and expand the movie playing on the dock. Then open the screening room to watch the two 85-second animated shorts and inspect the decisions behind them. [Project demo](demo/harbor-screening.mp4) · [Screening room](https://armada-harbor-cut.jymillersf.chatgpt.site/premiere)

## Two screenings, one opening

| Run | Deck’s first decision | What the audience sees | Evidence |
| --- | --- | --- | --- |
| One · seed 3 | Patch the house sound | The audience hears the performance through the house system. | [Watch run one](https://armada-harbor-cut.jymillersf.chatgpt.site/films/a.mp4) · [Decision log](public/films/a.json) |
| Two · seed 6 | Cut a silent reel | The premiere opens with projected title cards. | [Watch run two](https://armada-harbor-cut.jymillersf.chatgpt.site/films/b.mp4) · [Decision log](public/films/b.json) |

Each film opens with six seconds of setup, follows nine eight-second decisions, and closes with seven seconds at the premiere. In the screening room, expand a decision under **Inside this run** and select **Play this scene** to see what its explanation means on screen. The first fork occurs six seconds into the movie, at zero on the decision clock.

## The crew and the harbor

A Boat represents a business capability. The film gives each Boat one decision-making policy and its own priorities. The harbor roster shows the specialists who work aboard it.

| Boat | Capability | What matters to its crew |
| --- | --- | --- |
| Scout | Marketing | Reach the people waiting outside and keep their confidence in the screening. |
| Deck | Creative production | Find a technically viable way to tell the story through sound, pictures or titles. |
| Cutting Room | Social and distribution | Keep the feed legible and get it to whichever screen the audience can reach. |

The Bay also has a director’s flagship and a beach cinema. Guests can visit asynchronously, inspect the Boats, and leave named editorial suggestions for a shared cut. A Track One screening runs autonomously from its opening conditions. [Explore the harbor](https://armada-harbor-cut.jymillersf.chatgpt.site/)

## How the agents decide

All three policies observe the same five measures: house sound, title readability, foyer signal, audience reach and audience confidence. Each proposes an eligible move. The engine scores the expected change against that crew’s priorities, accounts for repeated moves, and rewards following through on another crew’s handoff. The winning move updates the shared state. A final screening channel becomes available only when its prerequisites are met.

The seed varies the crews’ priorities while preserving the world and opening event. The engine selects from authored actions and spoken lines. Each log records who acted, what they said, why the move scored well, and the state it left behind. The renderer turns that sequence into a film using animated harbor geometry, cast portraits, distinct voices and a stereo mix. [Film engine](lib/film-engine.ts)

## Bruin and presentation

Bruin loads both decision sheets into DuckDB, checks the beat identifiers and rationales, and compares matching story times to locate the earliest divergence. Judges can inspect the result alongside the movies or rerun it locally. The selected presentation demo is the Harbor walkthrough linked above. [Bruin SQL](bruin/film/assets/beats.sql) · [Comparison result](public/films/comparison.json)

## Reproduce the decisions

Use Node.js 24 or later from the repository root. The engine and its tests use Node’s built-in tools. The tests reproduce the two published logs and exercise 1,000 seeds for crew participation, valid state and screening prerequisites.

```sh
node --test tests/film-engine.test.mjs
node --input-type=module -e 'import {makeFilm} from "./lib/film-engine.ts"; console.log(JSON.stringify(makeFilm(3), null, 2))'
```

To regenerate the comparison, install the Bruin CLI and use Python 3 with Git available. The script creates a local DuckDB workspace and writes the result to `public/films/comparison.json`.

```sh
python3 bruin/compare_films.py
```

## Hackathon

Armada Harbor was built for **Track One, Agent Animated Film**, at the Multiplayer AI Hackathon on November 23, 2026, at AWS Builder Loft in San Francisco. Finch.AI presented the event and Crewbase Collective organized it. The Armada concept predates the event. All project code for this hackathon was started on event day, as confirmed by the builder.

The track asks builders to supply the setting, characters and inciting event, and gives agents control of subsequent beats and the ending. Entries need at least three visible agents with distinct goals, on-screen movement, an inspectable decision ledger, different endings from the same setup, and a one-to-three-minute animated short. The event also calls for Bruin, an AdaL presentation demo, and a public repository and demo submitted before 6 p.m. Pacific. [Official event and rules](https://luma.com/finch-jd7i) · [Crewbase submission portal](https://hackathons.crewbasecollective.com)
