"""Run a local Bruin SQL pipeline and return the result rows from DuckDB."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent


def run_pipeline(pipeline, prefix, payload, query):
    bruin = os.getenv("BRUIN_BIN", "bruin")
    runs = ROOT / ".runs"
    runs.mkdir(exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix=prefix, dir=runs))
    # Bruin resolves DuckDB and log paths from the Git root.
    subprocess.run(["git", "init", "--quiet", str(work)], check=True)
    shutil.copytree(ROOT / pipeline, work / "pipeline")
    shutil.copyfile(ROOT / "connection.yml", work / ".bruin.yml")
    (work / "snapshot.json").write_text(json.dumps(payload), encoding="utf-8")
    config = ["--config-file", str(work / ".bruin.yml")]
    environment = {**os.environ, "TELEMETRY_OPTOUT": "true"}
    print(f"Local Bruin run: {work}", flush=True)
    subprocess.run(
        [bruin, "run", *config, "--no-log-file", "--workers", "1", "pipeline"],
        cwd=work, env=environment, check=True,
    )
    result = subprocess.run(
        [bruin, "query", *config, "--connection", "harbor-local", "--output", "json",
         "--query", query],
        cwd=work, env=environment, check=True, capture_output=True, text=True,
    )
    rows = json.loads(result.stdout)
    columns = [column["name"] for column in rows["columns"]]
    return work, [dict(zip(columns, row)) for row in (rows["rows"] or [])]
