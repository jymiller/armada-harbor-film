# Armada Harbor — The Last Soundcheck

Three specialist crews on San Francisco Bay are about to premiere their hackathon film when the venue loses sound. Scout wants an audience, Deck wants a working screening, and Cutting Room wants the audience to follow the story. At each beat, each crew evaluates its available actions against shared conditions and its own history. The winning proposal changes the conditions for the next beat.

Two 72-second runs start from the same opening. The production uses seeded utility policies, authored lines, and animated characters. The JSON decision sheets preserve the action, dialogue, rationale, timing and resulting state of every beat.

Use Node 24 or later to reproduce the two runs and exercise the engine across 1,000 seeds.

```sh
node --test tests/film-engine.test.mjs
node --input-type=module -e 'import {makeFilm} from "./lib/film-engine.ts"; console.log(JSON.stringify(makeFilm(6), null, 2))'
```

[Multiplayer AI hackathon and track rules](https://luma.com/finch-jd7i)
