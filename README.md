# siliconbench.github.io

Source of [siliconbench.github.io](https://siliconbench.github.io), the home of SiliconBench: leaderboard, task explorer and blog.

The benchmark itself lives in [hkust-zhiyao/SiliconBench](https://github.com/hkust-zhiyao/SiliconBench).

## Structure

```text
index.html                 Home (wafer map, leaderboard preview, key results)
leaderboard/               Leaderboard and per-task results
explorer/                  Searchable browser for all tasks
blog/                      Blog index
blog/<slug>/               One folder per post
data/site.json             Blog post list
data/v1.0/leaderboard.json Per-model results (Table I of the paper)
data/v1.0/tasks.json       Per-task metadata and per-model pass/fail
assets/                    CSS, JS, self-hosted fonts, images, paper PDF
```

Plain HTML, CSS and JavaScript. No build step, no dependencies. GitHub Pages serves the `main` branch as is.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Common edits

- **Write a blog post.** Copy `blog/siliconbench-v1/` to `blog/<new-slug>/`, edit the HTML, then add an entry at the top of `posts` in `data/site.json`.
- **Add a model to the leaderboard.** Add its row to `data/v1.0/leaderboard.json` and its per-task results to `data/v1.0/tasks.json` (`pass` arrays keep the same model order).
- **New benchmark release.** Add `data/<version>/` with the same two JSON files and point the pages at it.

`tools/build_site_data.py` regenerates `data/v1.0/*.json` from the task files (`SB_BENCH`) and evaluation results (`SB_RESULTS`). It checks every number against the paper before writing.

## Design

Ink, bone and gold. Fraunces for display, Inter for text, JetBrains Mono for data (all SIL OFL, self-hosted). Gold marks proprietary agents and steel blue marks open-weights agents.
