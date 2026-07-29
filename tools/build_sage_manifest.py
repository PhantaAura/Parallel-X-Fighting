#!/usr/bin/env python3
"""Build Sage's manifest from the cleaned 6x6 production atlas."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ATLAS_PATH = ROOT / "assets/fighters/sage/sage-atlas.png"
MANIFEST_PATH = ROOT / "assets/fighters/sage/sage-animations.json"
CELL = 256
COLS = 6

FRAME_NAMES = [
    "idle_01", "idle_02", "idle_03", "idle_04", "stance_01", "stance_02",
    "run_01", "run_02", "run_03", "run_04", "jump_rise", "fall",
    "light_01", "light_02", "light_03", "heavy_startup", "heavy_active", "heavy_recovery",
    "launcher", "air_light", "air_heavy", "block", "perfect_block", "hurt",
    "knockdown", "get_up", "prediction_01", "prediction_02", "prediction_03", "mentor_counter",
    "energy_palm", "focus_blast", "energy_concentration", "ultimate", "defeated", "victory",
]


def animation(frames, duration, *, loop=False, cancelable=True):
    return {
        "frames": frames,
        "frameDuration": duration,
        "loop": loop,
        "cancelable": cancelable,
    }


def build_frames(image):
    frames = {}
    for index, name in enumerate(FRAME_NAMES):
        col, row = index % COLS, index // COLS
        alpha = image.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL)).getchannel("A")
        bbox = alpha.getbbox() or (0, 0, CELL, CELL)
        frames[name] = {
            "width": CELL,
            "height": CELL,
            "groundPivot": [128, 236],
            "centerPivot": [128, 128],
            "visualOffsetX": 0,
            "visualOffsetY": 0,
            "effectAnchor": [166, 126],
            "handAnchor": [170, 122],
            "projectileOrigin": [184, 122],
            "targetFacingDirection": "right",
            "contentBounds": [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]],
            "source": [col * CELL, row * CELL, CELL, CELL],
        }
    return frames


def build_animations():
    return {
        "idle": animation(["idle_01", "idle_02", "idle_03", "idle_04"], 170, loop=True),
        "fightingStance": animation(["stance_01", "stance_02"], 145, loop=True),
        "run": animation(["run_01", "run_02", "run_03", "run_04"], 105, loop=True),
        "jumpRise": animation(["jump_rise"], 120, loop=True),
        "fall": animation(["fall"], 120, loop=True),
        "land": animation(["get_up", "stance_01"], 75),
        "dash": animation(["run_01", "run_02", "run_03", "run_04"], 70),
        "turn": animation(["stance_01", "idle_02", "stance_02"], 75),
        "light1": animation(["light_01", "light_02"], 75),
        "light2": animation(["light_02", "light_03"], 75),
        "light3": animation(["light_03", "heavy_startup"], 85),
        "heavyStartup": animation(["heavy_startup"], 105),
        "heavyActive": animation(["heavy_active", "heavy_recovery"], 90),
        "heavyRecovery": animation(["heavy_recovery", "stance_01"], 105),
        "launcherStartup": animation(["stance_01", "launcher"], 100),
        "launcherActive": animation(["launcher", "air_light"], 85),
        "launcherRecovery": animation(["air_light", "stance_01"], 105),
        "airLight": animation(["air_light"], 95),
        "airHeavy": animation(["air_heavy"], 105),
        "blockStart": animation(["stance_01", "block"], 90),
        "blockHold": animation(["block"], 150, loop=True),
        "blockHit": animation(["block", "perfect_block"], 80),
        "perfectBlock": animation(["perfect_block"], 100),
        "guardBreak": animation(["hurt"], 120, loop=True),
        "hurtLight": animation(["hurt"], 105),
        "hurtHeavy": animation(["hurt", "knockdown"], 115),
        "airHurt": animation(["hurt"], 105),
        "knockdown": animation(["hurt", "knockdown"], 115),
        "groundDown": animation(["knockdown"], 180, loop=True),
        "getUp": animation(["get_up", "stance_01"], 115),
        "grab": animation(["stance_01", "light_01", "light_02"], 85),
        "grabMiss": animation(["light_01", "stance_01"], 105),
        "predictionDodge": animation(["prediction_01", "prediction_02", "prediction_03"], 75),
        "lensDodgeLeft": animation(["prediction_01", "prediction_02", "prediction_03"], 72),
        "lensDodgeRight": animation(["prediction_03", "prediction_02", "prediction_01"], 72),
        "counterReady": animation(["mentor_counter"], 110, loop=True),
        "counter": animation(["mentor_counter", "heavy_active"], 85),
        "mentorCounter": animation(["mentor_counter", "heavy_active", "stance_01"], 90),
        "chargeEnergy": animation(["energy_concentration"], 145, loop=True),
        "energyFocus": animation(["energy_concentration"], 145, loop=True),
        "sagePalm": animation(["energy_palm", "focus_blast"], 95),
        "astrylteBlast": animation(["energy_palm", "focus_blast"], 95),
        "ultimateStartup": animation(["energy_concentration"], 120),
        "ultimateCharge": animation(["energy_concentration", "ultimate"], 120, loop=True),
        "ultimateAttack": animation(["ultimate", "focus_blast"], 110),
        "ultimateRecovery": animation(["ultimate", "stance_01"], 125),
        "defeated": animation(["defeated"], 220, loop=True, cancelable=False),
        "victory": animation(["victory"], 220, loop=True),
    }


def main():
    image = Image.open(ATLAS_PATH).convert("RGBA")
    if image.size != (1536, 1536):
        raise SystemExit(f"Unexpected Sage atlas size: {image.size}")
    manifest = {
        "version": 5,
        "fighter": "sage",
        "image": "./sage-atlas.png",
        "atlas": {
            "width": image.width,
            "height": image.height,
            "frameCanvas": [CELL, CELL],
            "columns": COLS,
        },
        "defaults": {
            "appearance": "down",
            "groundPivot": [128, 236],
            "scale": 0.7,
            "pixelSmoothing": True,
            "depthScale": 0.08,
            "maxAfterimages": 4,
        },
        "frames": build_frames(image),
        "animations": build_animations(),
        "notes": {
            "source": "user-supplied Sage reference sheet",
            "distinctProductionFrames": len(FRAME_NAMES),
            "labelFreeAtlas": True,
            "alignedPaddedFrames": True,
        },
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {MANIFEST_PATH.relative_to(ROOT)} with {len(FRAME_NAMES)} frames")


if __name__ == "__main__":
    main()
