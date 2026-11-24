import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { makeFilm } from "../lib/film-engine.ts"

test("the published cuts reproduce their opening and distinct endings", () => {
  const samples = ["a", "b"].map(name => JSON.parse(readFileSync(new URL(`../public/films/${name}.json`, import.meta.url))))
  for (const sample of samples) assert.deepEqual(makeFilm(sample.seed), sample)
  assert.deepEqual(samples[0].initialState, samples[1].initialState)
  assert.equal(samples[0].opening, samples[1].opening)
  assert.notEqual(samples[0].ending, samples[1].ending)
  assert.notDeepEqual(samples[0].beats.map(b => b.action), samples[1].beats.map(b => b.action))
})

test("each specialist participates, metrics stay bounded, and a launch needs a working channel", () => {
  const endings = new Set()
  for (let seed = 0; seed < 1000; seed++) {
    const film = makeFilm(seed)
    assert.equal(film.beats.length, 9)
    assert.equal(new Set(film.beats.map(b => b.boat)).size, 3)
    film.beats.forEach((beat, index) => {
      assert.equal(beat.clock, index * 8)
      assert.equal(beat.seconds, 8)
      for (const metric of ["trust", "audience", "signal", "sound", "captions"]) assert.ok(beat.state[metric] >= 0 && beat.state[metric] <= 100)
    })
    const last = film.beats.at(-1)
    const previous = film.beats.at(-2).state
    if (last.action === "Roll house sound") assert.ok(previous.sound >= 68)
    if (last.action === "Open the caption premiere") assert.ok(previous.captions >= 68)
    if (last.action === "Start the foyer premiere") assert.ok(previous.signal >= 68 && previous.audience >= 40)
    if (last.state.screening) endings.add(film.ending)
  }
  assert.equal(endings.size, 3)
})
