/* @bruin
name: harbor.film_beats
type: duckdb.sql
materialization:
  type: table
columns:
  - name: beat_id
    checks:
      - name: unique
      - name: not_null
  - name: reason
    checks:
      - name: not_null
@bruin */
SELECT
   concat(f.key, ':', b.key) AS beat_id,
   f.key AS run, f.value->>'opening' AS opening, f.value->>'ending' AS ending,
   cast(b.value->>'clock' AS integer) AS at_second,
   cast(b.value->>'seconds' AS integer) AS duration,
   b.value->>'boat' AS boat, b.value->>'action' AS action, nullif(trim(b.value->>'reason'),'') AS reason
FROM read_json_objects('snapshot.json') s, lateral json_each(s.json) f,
     lateral json_each(f.value->'beats') b
