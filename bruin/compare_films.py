"""Build the public comparison shown in the waterfront screening room."""
from pathlib import Path
import json
from local_pipeline import run_pipeline
films = Path(__file__).resolve().parents[1] / "public" / "films"
runs = {name: json.loads((films / f"{name}.json").read_text()) for name in ("a", "b")}
_, data = run_pipeline("film", "film-", runs, """
 SELECT a.at_second AS second, a.boat AS firstBoat, b.boat AS secondBoat,
   a.action AS firstAction, b.action AS secondAction, a.ending AS firstEnding, b.ending AS secondEnding
 FROM harbor.film_beats a JOIN harbor.film_beats b ON a.at_second=b.at_second
 WHERE a.run='a' AND b.run='b' AND a.opening=b.opening AND a.ending<>b.ending
   AND (a.boat<>b.boat OR a.action<>b.action)
 ORDER BY a.at_second LIMIT 1
""")
if len(data) != 1:
    raise ValueError("The two runs need the same opening and a verified decision fork.")
(films / "comparison.json").write_text(json.dumps(data[0], indent=2)+"\n")
