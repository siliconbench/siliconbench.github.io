#!/usr/bin/env python3
"""Build website data (site/data/v1.0/*.json) from the SiliconBench v1.0 release.

Sources
  - tasks/*/task.toml                          (task metadata)
  - all_6models_all94_fair_results.csv         (per-task, per-model verdicts)
  - Table I of the paper                       (stage-wise & behavior metrics)

Every aggregate that can be recomputed from per-task data is asserted against
Table I, so the website can never drift from the paper.
"""
import csv, json, os, sys, tomllib, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BENCH = os.environ.get("SB_BENCH", "../SiliconBench")
RESULTS = os.environ.get(
    "SB_RESULTS",
    "/data/home/devinsliu/hardware/SiliconBench-v2/10_fair_regrade_all6_all94_20261114/all_6models_all94_fair_results.csv",
)
OUT = os.path.join(ROOT, "data", "v1.0")

MODELS = [
    # key in csv, id, display name, org, access
    ("opus55", "opus-5.5", "Claude Opus 5.5", "Anthropic", "proprietary"),
    ("sonnet55", "sonnet-5.5", "Claude Sonnet 5.5", "Anthropic", "proprietary"),
    ("sol_6_1", "gpt-sol-6.1", "GPT-Sol 6.1", "OpenAI", "proprietary"),
    ("terra_6_1", "gpt-terra-6.1", "GPT-Terra 6.1", "OpenAI", "proprietary"),
    ("glm53", "glm-5.3", "GLM-5.3", "Z.ai", "open"),
    ("deepseek41", "deepseek-v4.1-flash", "DeepSeek-V4.1-Flash-1017", "DeepSeek", "open"),
]

# Paper labels (task.toml labels are longer variants)
PT_LABEL = {
    "Architectural & Protocol Bug Repair": ("pt1", "Architectural & Protocol Bug Repair"),
    "New ISA & Subsystem Feature Implementation": ("pt2", "New ISA & Feature Implementation"),
    "High-Frequency Timing & Area Optimization": ("pt3", "Timing & Area Optimization"),
    "Gate-Level Equivalence, Security & CDC/RDC": ("pt4", "Gate-Level Equivalence, Security & CDC/RDC"),
    "RTL + Hard-SRAM Macro Physical Co-Design": ("pt5", "RTL + Hard-SRAM Macro Physical Co-Design"),
}
STAGE = {
    "stage1_rtl_sim": (1, "RTL & Simulation"),
    "stage2_synth_gate": (2, "Synthesis & Gate-Level"),
    "stage3_sta_cdc": (3, "Static Timing & CDC/RDC"),
    "stage4_macro_pnr": (4, "Floorplan, CTS & Routing"),
}

# ---- Table I (paper), ordered as MODELS -------------------------------------
TABLE1 = {
    "overall": [79, 69, 49, 38, 31, 26],
    "rtl_only": {"n": 70, "pass": [60, 57, 37, 35, 30, 23]},
    "joint": {"n": 24, "pass": [19, 12, 12, 3, 1, 3]},
    "stages": [  # cumulative, out of 94
        {"id": 1, "label": "RTL & Simulation", "checked": 94, "pass": [81, 80, 56, 51, 44, 38]},
        {"id": 2, "label": "+ Synthesis & Gate-Level", "checked": 85, "pass": [81, 80, 55, 49, 40, 37]},
        {"id": 3, "label": "+ Static Timing & CDC/RDC", "checked": 81, "pass": [79, 72, 49, 40, 33, 28]},
        {"id": 4, "label": "+ Floorplan, CTS & Routing", "checked": 15, "pass": [79, 69, 49, 38, 31, 26]},
    ],
    "types": {
        "pt1": [28, 28, 25, 21, 16, 11],
        "pt2": [10, 9, 2, 3, 2, 4],
        "pt3": [14, 9, 10, 6, 3, 4],
        "pt4": [21, 19, 9, 7, 9, 7],
        "pt5": [6, 4, 3, 1, 1, 0],
    },
    "multi4": {"n": 29, "pass": [21, 20, 10, 6, 3, 5]},
    "tool_calls_median": [61.5, 54.0, 44.5, 37.5, 136.0, 122.0],
    "tool_calls_mean": [68.6, 63.6, 51.4, 46.5, 143.2, 121.6],
    "unproductive_mean": [14.8, 15.0, 15.3, 13.6, 47.7, 37.6],
    "unproductive_share": [21.6, 23.6, 29.9, 29.2, 33.3, 30.9],
    "hack_runs": [2, 1, 2, 2, 16, 30],
}


def main():
    rows = list(csv.DictReader(open(RESULTS)))
    verdict = collections.defaultdict(dict)
    for r in rows:
        verdict[r["case_id"]][r["evaluation_model_key"]] = r["strict_budget_pass"] == "True"

    tasks = []
    for cid in sorted(os.listdir(os.path.join(BENCH, "tasks")), key=lambda s: int(s.split("_")[1])):
        meta = tomllib.load(open(os.path.join(BENCH, "tasks", cid, "task.toml"), "rb"))["metadata"]
        cfg = json.load(open(os.path.join(BENCH, "tasks", cid, "task_config.json")))
        pt_id, pt_label = PT_LABEL[meta["problem_type_label"]]
        st_id, st_label = STAGE[meta["eda_stage"]]
        res = [verdict[cid][m[0]] for m in MODELS]
        tasks.append({
            "id": cid,
            "title": meta["title"],
            "repo": meta["repository"],
            "stage": st_id,
            "type": pt_id,
            "files": meta["public_rtl_files"],
            "loc": meta["public_rtl_loc"],
            "editable": cfg.get("editable_files", []),
            "pass": [1 if x else 0 for x in res],
        })
    assert len(tasks) == 94

    # ---- assertions against Table I ----
    per_model = [sum(t["pass"][i] for t in tasks) for i in range(6)]
    assert per_model == TABLE1["overall"], per_model
    for pt, exp in TABLE1["types"].items():
        got = [sum(t["pass"][i] for t in tasks if t["type"] == pt) for i in range(6)]
        assert got == exp, (pt, got, exp)
    type_n = collections.Counter(t["type"] for t in tasks)
    assert [type_n[f"pt{i}"] for i in range(1, 6)] == [32, 12, 17, 25, 8], type_n
    stage_n = collections.Counter(t["stage"] for t in tasks)
    assert (stage_n[1], stage_n[2], stage_n[3], stage_n[4]) == (9, 4, 66, 15), stage_n
    unsolved = sum(1 for t in tasks if sum(t["pass"]) == 0)
    assert unsolved == 6, unsolved
    repos = collections.Counter(t["repo"] for t in tasks)
    assert len(repos) == 30, len(repos)

    models = []
    for i, (_, mid, name, org, access) in enumerate(MODELS):
        models.append({
            "id": mid, "name": name, "org": org, "access": access, "effort": "high",
            "pass": TABLE1["overall"][i],
            "stages": [s["pass"][i] for s in TABLE1["stages"]],
            "types": {k: v[i] for k, v in TABLE1["types"].items()},
            "rtl_only": TABLE1["rtl_only"]["pass"][i],
            "joint": TABLE1["joint"]["pass"][i],
            "multi4": TABLE1["multi4"]["pass"][i],
            "tool_calls_median": TABLE1["tool_calls_median"][i],
            "tool_calls_mean": TABLE1["tool_calls_mean"][i],
            "unproductive_mean": TABLE1["unproductive_mean"][i],
            "unproductive_share": TABLE1["unproductive_share"][i],
            "hack_runs": TABLE1["hack_runs"][i],
            "hack_success": 0,
        })

    summary = {
        "release": "v1.0",
        "date": "2026-11",
        "tasks": 94, "repos": 30, "seed_pool": 160, "runs": 564, "tool_calls": 46526,
        "files_range": [2, 70], "files_median": 12, "loc_median": 3670,
        "stage_checked": [94, 85, 81, 15],
        "type_counts": {f"pt{i}": type_n[f"pt{i}"] for i in range(1, 6)},
        "type_labels": {v[0]: v[1] for v in PT_LABEL.values()},
        "stage_labels": {v[0]: v[1] for v in STAGE.values()},
        "domains": [
            ["Net / DMA / Bus", 22], ["Cache / LSU / MMU", 20], ["RVV / GPU / NPU", 19],
            ["Security / Crypto", 13], ["CPU Core Pipeline", 11], ["Async CDC / RDC", 6], ["FP / Arith / DSP", 3],
        ],
        "subsets": {"rtl_only": 70, "joint": 24, "multi4": 29},
        "failed_runs": 272, "failed_pass_rtl_fail_downstream": 58,
        "hack": {"runs": 53, "events": 90, "succeeded": 0,
                 "categories": [["Probing outside /workspace for tests or references", 86],
                                ["Synthesis-bypass macros (`ifndef SYNTHESIS)", 3],
                                ["Timestamp forgery on a read-only file", 1]]},
        "unsolved_by_all": unsolved,
        "repos_list": sorted([[k, v] for k, v in repos.items()], key=lambda x: (-x[1], x[0])),
    }

    os.makedirs(OUT, exist_ok=True)
    json.dump({"models": models, "summary": summary}, open(os.path.join(OUT, "leaderboard.json"), "w"), indent=1)
    json.dump(tasks, open(os.path.join(OUT, "tasks.json"), "w"), separators=(",", ":"))
    print("ok", per_model, "unsolved", unsolved, "repos", len(repos))


if __name__ == "__main__":
    main()
