#!/usr/bin/env python3
"""Build production-ready experimental atlases for the core fighters.

The supplied sheets are concept/reference sheets rather than true transparent
sprite atlases. This tool performs the crop, edge-connected background removal,
debris cleanup, consistent pivot normalization, and manifest generation at
build time so the browser only loads normalized atlas assets.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

REFERENCE_SIZE = (1280, 960)
FRAME_SIZE = (192, 192)
GROUND_PIVOT = (96, 178)
CONTENT_BOX = (168, 168)
ATLAS_COLUMNS = 9

# Coordinates are authored against the original 1280x960 layout. The newer
# user-supplied sheets are 1448x1086 and are scaled automatically.
CROPS = {
    "idle_01": (20, 48, 78, 146),
    "idle_02": (86, 48, 145, 146),
    "idle_03": (154, 48, 215, 146),
    "idle_04": (222, 48, 282, 146),
    "idle_05": (288, 48, 342, 146),
    "idle_06": (344, 48, 403, 146),
    "run_01": (420, 58, 496, 147),
    "run_02": (500, 58, 580, 147),
    "run_03": (586, 58, 661, 147),
    "run_04": (666, 58, 740, 147),
    "stance_01": (746, 53, 812, 149),
    "stance_02": (813, 53, 879, 149),
    "stance_03": (880, 53, 946, 149),
    "stance_04": (947, 53, 1014, 149),
    "jump_01": (20, 185, 95, 273),
    "jump_02": (96, 185, 182, 273),
    "jump_03": (184, 185, 282, 273),
    "jump_04": (286, 185, 379, 273),
    "jump_05": (384, 185, 495, 273),
    "dash_01": (512, 187, 613, 274),
    "dash_02": (617, 187, 731, 274),
    "dash_03": (736, 187, 850, 274),
    "dash_04": (856, 187, 1008, 274),
    "light_01": (16, 312, 89, 397),
    "light_02": (92, 312, 172, 397),
    "light_03": (174, 312, 254, 397),
    "light_04": (256, 312, 342, 397),
    "light_05": (344, 312, 426, 397),
    "light_06": (428, 312, 510, 397),
    "heavy_01": (520, 312, 619, 398),
    "heavy_02": (620, 312, 724, 398),
    "heavy_03": (700, 312, 824, 398),
    "heavy_04": (851, 312, 1010, 398),
    "launcher_01": (15, 435, 98, 529),
    "launcher_02": (100, 435, 183, 529),
    "launcher_03": (185, 435, 271, 529),
    "launcher_04": (274, 435, 365, 529),
    "air_light_01": (372, 435, 458, 529),
    "air_light_02": (460, 435, 541, 529),
    "air_light_03": (543, 435, 628, 529),
    "air_heavy_01": (633, 435, 714, 529),
    "air_heavy_02": (716, 435, 798, 529),
    "air_heavy_03": (800, 435, 880, 529),
    "block_01": (886, 435, 978, 529),
    "block_02": (980, 435, 1074, 529),
    "perfect_01": (1076, 435, 1165, 529),
    "perfect_02": (1166, 435, 1265, 529),
    "hurt_01": (16, 566, 84, 647),
    "hurt_02": (86, 566, 155, 647),
    "hurt_03": (157, 566, 225, 647),
    "hurt_04": (227, 566, 294, 647),
    "hurt_05": (296, 566, 362, 647),
    "special_01": (367, 566, 439, 647),
    "special_02": (441, 566, 513, 647),
    "special_03": (515, 566, 590, 647),
    "special_04": (592, 566, 679, 647),
    "rush_01": (686, 566, 755, 647),
    "rush_02": (757, 566, 826, 647),
    "rush_03": (828, 566, 897, 647),
    "rush_04": (899, 566, 968, 647),
    "rush_05": (970, 566, 1076, 647),
    "rush_06": (1078, 566, 1275, 647),
    "power_01": (15, 694, 84, 780),
    "power_02": (86, 694, 160, 780),
    "power_03": (162, 694, 251, 780),
    "power_04": (253, 694, 363, 780),
    "power_05": (365, 694, 464, 780),
    "beam_01": (470, 694, 523, 780),
    "beam_02": (525, 694, 578, 780),
    "beam_03": (580, 694, 630, 780),
    "beam_04": (632, 694, 680, 780),
    "ultimate_01": (686, 694, 755, 780),
    "ultimate_02": (757, 694, 826, 780),
    "ultimate_03": (828, 694, 897, 780),
    "ultimate_04": (899, 694, 968, 780),
    "ultimate_05": (970, 694, 1076, 780),
    "victory_01": (16, 804, 91, 931),
    "victory_02": (94, 804, 170, 931),
    "victory_03": (174, 804, 254, 931),
    "victory_04": (258, 804, 342, 931),
    "turn_01": (355, 820, 418, 931),
    "turn_02": (421, 820, 484, 931),
    "turn_03": (487, 820, 550, 931),
    "turn_04": (553, 820, 616, 931),
    "turn_05": (619, 820, 682, 931),
    "look_01": (762, 818, 846, 931),
    "look_02": (853, 818, 934, 931),
    "look_03": (945, 818, 1034, 931),
}

EFFECT_CROPS = {
    "energy-projectile.png": (570, 553, 677, 632),
    "energy-trails.png": (1093, 680, 1268, 746),
    "impact-sparks.png": (1093, 801, 1268, 858),
    "smoke-dust.png": (1093, 749, 1268, 798),
    "ultimate-aura.png": (1093, 862, 1268, 938),
}

def grid_crops(
    names: list[str],
    box: tuple[int, int, int, int],
    *,
    inset_x: int = 2,
    inset_y: int = 2,
) -> dict[str, tuple[int, int, int, int]]:
    """Split one labelled concept-sheet strip into stable frame cells."""
    left, top, right, bottom = box
    step = (right - left) / len(names)
    return {
        name: (
            round(left + index * step) + inset_x,
            top + inset_y,
            round(left + (index + 1) * step) - inset_x,
            bottom - inset_y,
        )
        for index, name in enumerate(names)
    }


def sheet_grid_crops(fighter: str) -> dict[str, tuple[int, int, int, int]]:
    """Coordinates for the approved 2.9A.11 Wade and Bark combat sheets."""
    idle = [f"idle_0{i}" for i in range(1, 7)]
    run = [f"run_0{i}" for i in range(1, 5)]
    stance = [f"stance_0{i}" for i in range(1, 5)]
    jump = [f"jump_0{i}" for i in range(1, 6)]
    dash = [f"dash_0{i}" for i in range(1, 5)]
    light = [f"light_0{i}" for i in range(1, 7)]
    heavy = [f"heavy_0{i}" for i in range(1, 5)]
    launcher = [f"launcher_0{i}" for i in range(1, 5)]
    air_light = [f"air_light_0{i}" for i in range(1, 4)]
    air_heavy = [f"air_heavy_0{i}" for i in range(1, 4)]
    block = ["block_01", "block_02"]
    perfect = ["perfect_01", "perfect_02"]
    hurt = [f"hurt_0{i}" for i in range(1, 6)]
    special = [f"special_0{i}" for i in range(1, 5)]
    rush = [f"rush_0{i}" for i in range(1, 7)]
    power = [f"power_0{i}" for i in range(1, 6)]
    beam = [f"beam_0{i}" for i in range(1, 5)]
    ultimate = [f"ultimate_0{i}" for i in range(1, 6)]
    victory = [f"victory_0{i}" for i in range(1, 5)]
    turn = [f"turn_0{i}" for i in range(1, 6)]
    look = [f"look_0{i}" for i in range(1, 4)]

    if fighter == "wade":
        sections = [
            (idle, (12, 31, 451, 160)), (run, (454, 31, 798, 160)), (stance, (801, 31, 1138, 160)),
            (jump, (12, 171, 512, 300)), (dash, (515, 171, 1092, 300)),
            (light, (12, 310, 558, 427)), (heavy, (562, 310, 1214, 427)),
            (launcher, (12, 436, 405, 581)), (air_light, (409, 436, 684, 581)),
            (air_heavy, (688, 436, 977, 581)), (block, (981, 436, 1218, 581)),
            (perfect, (1158, 436, 1368, 581)), (hurt, (12, 589, 386, 718)),
            (special, (390, 589, 751, 718)), (rush, (755, 589, 1481, 718)),
            (power, (12, 726, 502, 856)), (beam, (505, 726, 927, 856)),
            (ultimate, (931, 726, 1278, 856)), (victory, (12, 865, 382, 1023)),
            (turn, (389, 865, 850, 1023)), (look, (850, 865, 1215, 1023)),
        ]
    elif fighter == "bark":
        sections = [
            (idle, (12, 31, 430, 163)), (run, (432, 31, 814, 163)), (stance, (817, 31, 1138, 163)),
            (jump, (12, 174, 503, 305)), (dash, (506, 174, 1138, 305)),
            (light, (12, 315, 562, 440)), (heavy, (565, 315, 1138, 440)),
            (launcher, (12, 449, 391, 587)), (air_light, (394, 449, 677, 587)),
            (air_heavy, (680, 449, 955, 587)), (block, (958, 449, 1194, 587)),
            (perfect, (1197, 449, 1445, 587)), (hurt, (12, 597, 394, 730)),
            (special, (397, 597, 746, 730)), (rush, (749, 597, 1445, 730)),
            (power, (12, 738, 467, 885)), (beam, (470, 738, 788, 885)),
            (ultimate, (792, 738, 1190, 885)), (victory, (12, 894, 366, 1082)),
            (turn, (370, 894, 810, 1082)), (look, (830, 894, 1203, 1082)),
        ]
    else:
        return CROPS

    result: dict[str, tuple[int, int, int, int]] = {}
    for names, box in sections:
        result.update(grid_crops(names, box))
    if fighter == "wade":
        # The reference sheet's lower-right strips are spaced irregularly.
        # Explicit cells keep neighboring poses out of Wade's narrow stance
        # silhouette while preserving the larger lightning effects.
        result.update({
            "stance_01": (802, 31, 882, 160),
            "stance_02": (883, 31, 958, 160),
            "stance_03": (959, 31, 1034, 160),
            "stance_04": (1035, 31, 1122, 160),
            "block_01": (981, 436, 1096, 581),
            "block_02": (1097, 436, 1218, 581),
            "perfect_01": (1158, 436, 1260, 581),
            "perfect_02": (1242, 436, 1368, 581),
            "turn_01": (389, 865, 474, 1023),
            "turn_02": (475, 865, 558, 1023),
            "turn_03": (559, 865, 646, 1023),
            "turn_04": (647, 865, 739, 1023),
            "turn_05": (740, 865, 850, 1023),
            "look_01": (850, 865, 970, 1023),
            "look_02": (970, 865, 1087, 1023),
            "look_03": (1087, 865, 1215, 1023),
        })
    return result


FIGHTER_REFERENCE_SIZES = {
    "rrvvfo": REFERENCE_SIZE,
    "revvfo": REFERENCE_SIZE,
    "wade": (1484, 1060),
    "bark": (1448, 1086),
}

FIGHTER_EFFECT_CROPS = {
    "wade": {
        "energy-projectile.png": (1282, 865, 1478, 931),
        "energy-trails.png": (1282, 736, 1478, 786),
        "impact-sparks.png": (1282, 789, 1478, 850),
        "smoke-dust.png": (1282, 789, 1478, 850),
        "ultimate-aura.png": (1282, 865, 1478, 931),
    },
    "bark": {
        "energy-projectile.png": (1223, 745, 1444, 812),
        "energy-trails.png": (1223, 925, 1444, 1068),
        "impact-sparks.png": (1223, 858, 1444, 922),
        "smoke-dust.png": (1223, 812, 1444, 857),
        "ultimate-aura.png": (1223, 925, 1444, 1068),
    },
}

# A concept sheet is not a true animation atlas: a handful of labelled cells
# contain two poses, a cropped neighbour, or an effects-only panel.  Reuse a
# nearby clean pose for those cells so every runtime frame remains readable.
# The animation timing and frame names stay stable for gameplay code.
FRAME_REPLACEMENTS = {
    "rrvvfo": {
        "jump_02": "jump_01",
        "run_03": "run_02",
        "hurt_04": "hurt_05",
        "rush_02": "dash_01",
        "rush_03": "dash_02",
        "rush_04": "dash_03",
        "rush_05": "dash_04",
        "ultimate_01": "ultimate_02",
        "victory_03": "victory_02",
        "victory_04": "victory_01",
        "turn_04": "turn_03",
        "turn_05": "look_03",
    },
    "revvfo": {
        "rush_01": "dash_01",
        "rush_02": "dash_02",
        "rush_03": "dash_03",
        "rush_04": "dash_04",
        "rush_05": "air_light_01",
        "rush_06": "air_heavy_01",
        "beam_04": "special_03",
        "ultimate_01": "ultimate_02",
        "turn_03": "look_02",
        "turn_04": "look_03",
        "turn_05": "look_01",
    },
    "wade": {
        "light_01": "light_02",
        "heavy_01": "light_04",
        "heavy_02": "light_05",
        "heavy_03": "light_06",
        "heavy_04": "stance_01",
        "block_02": "block_01",
        "perfect_01": "block_01",
        "perfect_02": "block_01",
        "hurt_04": "hurt_05",
        "special_03": "special_02",
        "rush_01": "dash_01",
        "rush_02": "dash_02",
        "rush_03": "dash_03",
        "rush_04": "dash_04",
        "rush_05": "air_light_01",
        "beam_01": "special_01",
        "beam_02": "special_02",
        "beam_04": "special_03",
        "ultimate_01": "power_01",
        "ultimate_02": "power_02",
        "ultimate_03": "power_03",
        "ultimate_04": "power_04",
        "ultimate_05": "power_05",
        "victory_03": "victory_02",
        "victory_04": "victory_01",
        "turn_01": "look_01",
        "turn_02": "look_02",
        "turn_03": "look_03",
        "turn_04": "look_02",
        "turn_05": "look_01",
    },
    "bark": {
        "run_03": "run_02",
        "light_01": "light_03",
        "light_02": "light_03",
        "light_04": "air_light_02",
        "light_05": "light_03",
        "light_06": "special_02",
        "heavy_02": "heavy_03",
        "perfect_02": "perfect_01",
        "hurt_04": "hurt_05",
        "rush_01": "power_01",
        "rush_02": "power_02",
        "rush_03": "power_03",
        "rush_04": "beam_04",
        "rush_05": "special_04",
        "rush_06": "ultimate_05",
        "beam_03": "beam_04",
        "ultimate_04": "power_04",
        "ultimate_05": "power_05",
        "victory_03": "victory_02",
    },
}

ALTERNATE_FRAME_REPLACEMENTS = {
    "rrvvfo": {
        "ultimate_03": "ultimate_02",
        "ultimate_04": "ultimate_05",
        "victory_03": "victory_02",
        "victory_04": "victory_01",
    },
}


def scaled_crop(
    crop: tuple[int, int, int, int],
    size: tuple[int, int],
    reference_size: tuple[int, int] = REFERENCE_SIZE,
) -> tuple[int, int, int, int]:
    sx = size[0] / reference_size[0]
    sy = size[1] / reference_size[1]
    left, top, right, bottom = crop
    return (round(left * sx), round(top * sy), round(right * sx), round(bottom * sy))


def background_candidate(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a > 0 and r > 190 and g > 182 and b > 168 and max(r, g, b) - min(r, g, b) < 78


def remove_border_background(image: Image.Image) -> Image.Image:
    """Remove the warm concept-sheet paper without eating bright effects.

    The sheets are divided by printed borders, so a border-only flood fill can
    leave large white islands trapped behind a section line.  Treat every large
    connected paper-colour region as background while preserving the much
    smaller white highlights inside a fighter or energy effect.
    """
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    visited: set[tuple[int, int]] = set()
    minimum_island = max(36, round(width * height * 0.003))
    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in visited or not background_candidate(pixels[start_x, start_y]):
                continue
            queue = deque([(start_x, start_y)])
            component: list[tuple[int, int]] = []
            touches_border = False
            while queue:
                x, y = queue.popleft()
                if (x, y) in visited or not background_candidate(pixels[x, y]):
                    continue
                visited.add((x, y))
                component.append((x, y))
                touches_border = touches_border or x in (0, width - 1) or y in (0, height - 1)
                if x:
                    queue.append((x - 1, y))
                if x + 1 < width:
                    queue.append((x + 1, y))
                if y:
                    queue.append((x, y - 1))
                if y + 1 < height:
                    queue.append((x, y + 1))
            if touches_border or len(component) >= minimum_island:
                for x, y in component:
                    r, g, b, _ = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)
    return rgba


def component_gap(
    first: tuple[int, int, int, int],
    second: tuple[int, int, int, int],
) -> float:
    first_left, first_top, first_right, first_bottom = first
    second_left, second_top, second_right, second_bottom = second
    dx = max(first_left - second_right, second_left - first_right, 0)
    dy = max(first_top - second_bottom, second_top - first_bottom, 0)
    return (dx * dx + dy * dy) ** 0.5


def remove_sheet_debris(image: Image.Image) -> Image.Image:
    rgba = image.copy()
    alpha = rgba.getchannel("A")
    pixels = alpha.load()
    width, height = rgba.size
    visited: set[tuple[int, int]] = set()
    components: list[dict[str, object]] = []
    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in visited or pixels[start_x, start_y] < 18:
                continue
            queue = deque([(start_x, start_y)])
            component: list[tuple[int, int]] = []
            min_x = max_x = start_x
            min_y = max_y = start_y
            while queue:
                x, y = queue.popleft()
                if (x, y) in visited or pixels[x, y] < 18:
                    continue
                visited.add((x, y))
                component.append((x, y))
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
                if x:
                    queue.append((x - 1, y))
                if x + 1 < width:
                    queue.append((x + 1, y))
                if y:
                    queue.append((x, y - 1))
                if y + 1 < height:
                    queue.append((x, y + 1))
            colorful_pixels = sum(
                1
                for x, y in component
                if max(rgba.getpixel((x, y))[:3]) - min(rgba.getpixel((x, y))[:3]) >= 45
            )
            components.append({
                "pixels": component,
                "size": len(component),
                "box": (min_x, min_y, max_x + 1, max_y + 1),
                "width": max_x - min_x + 1,
                "height": max_y - min_y + 1,
                "colorRatio": colorful_pixels / max(1, len(component)),
            })

    candidates = [
        entry for entry in components
        if entry["size"] >= 60
        and entry["box"][3] >= height * 0.34
        and entry["box"][0] <= width * 0.72
        and entry["box"][2] >= width * 0.28
    ]
    if candidates:
        def primary_score(entry: dict[str, object]) -> float:
            left, top, right, bottom = entry["box"]
            center = (left + right) / 2
            center_bonus = 1 - min(1, abs(center - width / 2) / max(1, width / 2))
            bottom_bonus = bottom / max(1, height)
            return float(entry["size"]) + float(entry["height"]) * 8 + center_bonus * 420 + bottom_bonus * 260

        primary = max(candidates, key=primary_score)
    else:
        primary = max(components, key=lambda entry: entry["size"], default=None)

    largest = max((int(entry["size"]) for entry in components), default=1)
    primary_box = primary["box"] if primary else (width // 2, height // 2, width // 2, height // 2)
    primary_size = int(primary["size"]) if primary else largest
    minimum = max(18, round(primary_size * 0.025))

    for entry in components:
        component = entry["pixels"]
        box_w = int(entry["width"])
        box_h = int(entry["height"])
        min_x, min_y, max_x, max_y = entry["box"]
        size = int(entry["size"])
        color_ratio = float(entry["colorRatio"])
        is_primary = entry is primary
        gap = component_gap(entry["box"], primary_box)
        touches_side = min_x <= 2 or max_x >= width - 2
        is_header_fragment = box_h <= 28 and box_w >= 25 and min_y < height * 0.38
        colorful_pixels = sum(
            1
            for x, y in component
            if max(rgba.getpixel((x, y))[:3]) - min(rgba.getpixel((x, y))[:3]) >= 45
        )
        is_printed_label = (
            box_h <= 32
            and box_w >= 48
            and colorful_pixels / max(1, len(component)) < 0.16
        )
        is_separator = (box_w <= 8 and box_h >= 24) or (box_h <= 7 and box_w >= 38)
        is_caption_fragment = (
            not is_primary
            and box_h <= 20
            and min_y < height * 0.42
            and color_ratio < 0.13
        )
        fill_ratio = size / max(1, box_w * box_h)
        is_panel_border = (
            not is_primary
            and color_ratio < 0.12
            and fill_ratio < 0.22
            and (
                (box_w >= width * 0.72 and box_h >= height * 0.44)
                or (box_h >= height * 0.72 and box_w >= width * 0.44)
            )
        )
        is_edge_neighbor = touches_side and not is_primary and gap > 5
        is_remote_fragment = (
            not is_primary
            and gap > max(18, min(width, height) * 0.14)
            and color_ratio < 0.18
            and not (min_y >= height * 0.72 and max_x >= width * 0.18 and min_x <= width * 0.82)
        )
        if (
            (size < minimum and not is_primary)
            or is_separator
            or is_header_fragment
            or is_caption_fragment
            or is_panel_border
            or is_printed_label
            or is_edge_neighbor
            or is_remote_fragment
        ):
            for x, y in component:
                rgba.putpixel((x, y), (0, 0, 0, 0))
    return rgba


def trim_alpha(image: Image.Image, padding: int = 2) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (1, 1))
    left, top, right, bottom = bbox
    return image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))


def normalize_frame(image: Image.Image) -> tuple[Image.Image, dict[str, object]]:
    trimmed = trim_alpha(remove_sheet_debris(remove_border_background(image)), 2)
    max_w, max_h = CONTENT_BOX
    scale = min(max_w / trimmed.width, max_h / trimmed.height, 1.45)
    size = (max(1, round(trimmed.width * scale)), max(1, round(trimmed.height * scale)))
    resized = trimmed.resize(size, Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", FRAME_SIZE)
    paste_x = GROUND_PIVOT[0] - size[0] // 2
    paste_y = GROUND_PIVOT[1] - size[1]
    frame.alpha_composite(resized, (paste_x, paste_y))
    metadata = {
        "width": FRAME_SIZE[0],
        "height": FRAME_SIZE[1],
        "groundPivot": list(GROUND_PIVOT),
        "centerPivot": [FRAME_SIZE[0] // 2, FRAME_SIZE[1] // 2],
        "visualOffsetX": 0,
        "visualOffsetY": 0,
        "effectAnchor": [GROUND_PIVOT[0] + 28, GROUND_PIVOT[1] - 82],
        "handAnchor": [GROUND_PIVOT[0] + 34, GROUND_PIVOT[1] - 90],
        "projectileOrigin": [GROUND_PIVOT[0] + 42, GROUND_PIVOT[1] - 88],
        "targetFacingDirection": "right",
        "contentBounds": [paste_x, paste_y, size[0], size[1]],
    }
    return frame, metadata


def tinted(image: Image.Image, color: tuple[int, int, int], alpha: int = 210) -> Image.Image:
    base = image.convert("RGBA")
    a = base.getchannel("A")
    grayscale = ImageEnhance.Contrast(base.convert("L")).enhance(1.3)
    result = Image.new("RGBA", base.size, color + (0,))
    result.putalpha(ImageChops.multiply(a, Image.new("L", base.size, alpha)))
    white = Image.new("RGBA", base.size, (255, 255, 255, 0))
    white.putalpha(ImageChops.multiply(grayscale, a).point(lambda value: value // 4))
    return Image.alpha_composite(result, white)


def animation(frames: list[str], duration: int, loop: bool = False, **extra: object) -> dict[str, object]:
    result: dict[str, object] = {"frames": frames, "frameDuration": duration, "loop": loop, "cancelable": extra.pop("cancelable", True)}
    result.update(extra)
    return result


def common_animations() -> dict[str, dict[str, object]]:
    return {
        "idle": animation([f"idle_0{i}" for i in range(1, 7)], 125, True),
        "fightingStance": animation([f"stance_0{i}" for i in range(1, 5)], 105, True),
        "run": animation([f"run_0{i}" for i in range(1, 5)], 82, True),
        "jumpStart": animation(["jump_01", "jump_02"], 75),
        "jumpRise": animation(["jump_02", "jump_03"], 110, True),
        "fall": animation(["jump_03", "jump_04"], 110, True),
        "land": animation(["jump_05", "stance_01"], 65),
        "dash": animation(["dash_01", "dash_02", "dash_03", "dash_04"], 60),
        "turn": animation([f"turn_0{i}" for i in range(1, 6)], 55),
        "light1": animation(["light_01", "light_02"], 58, events=[{"frame": 1, "type": "attackActive"}]),
        "light2": animation(["light_03", "light_04"], 58, events=[{"frame": 1, "type": "attackActive"}]),
        "light3": animation(["light_05", "light_06"], 64, events=[{"frame": 1, "type": "attackActive"}]),
        "heavyStartup": animation(["heavy_01"], 105),
        "heavyActive": animation(["heavy_02", "heavy_03"], 72, events=[{"frame": 0, "type": "attackActive"}]),
        "heavyRecovery": animation(["heavy_04", "stance_01"], 92),
        "launcherStartup": animation(["launcher_01"], 110),
        "launcherActive": animation(["launcher_02", "launcher_03", "launcher_04"], 70, events=[{"frame": 0, "type": "attackActive"}]),
        "launcherRecovery": animation(["launcher_02", "stance_01"], 85),
        "airLight": animation(["air_light_01", "air_light_02", "air_light_03"], 70),
        "airHeavy": animation(["air_heavy_01", "air_heavy_02", "air_heavy_03"], 80),
        "airHurt": animation(["hurt_03"], 95),
        "airFall": animation(["hurt_04", "hurt_05"], 95, True),
        "blockStart": animation(["block_01", "block_02"], 65),
        "blockHold": animation(["block_02"], 120, True),
        "blockHit": animation(["block_01", "block_02"], 65),
        "perfectBlock": animation(["perfect_01", "perfect_02"], 70),
        "grab": animation(["light_01", "light_03", "heavy_02"], 68, events=[{"frame": 1, "type": "grabActive"}]),
        "grabMiss": animation(["light_01", "light_02", "stance_01"], 76),
        "counter": animation(["block_01", "perfect_01", "heavy_02"], 72),
        "counterReady": animation(["block_01", "perfect_01"], 82, True),
        "counterStance": animation(["block_01", "perfect_01"], 82, True),
        "chargeEnergy": animation(["ultimate_01", "ultimate_02", "ultimate_03"], 92, True),
        "guardBreak": animation(["hurt_02", "hurt_03"], 105, True),
        "breaker": animation(["stance_01", "heavy_02"], 75),
        "hurtLight": animation(["hurt_01"], 90),
        "hurtHeavy": animation(["hurt_01", "hurt_02"], 105),
        "knockback": animation(["hurt_02", "hurt_03"], 105, True),
        "knockdown": animation(["hurt_03", "hurt_04"], 120),
        "groundDown": animation(["hurt_05"], 150, True),
        "getUp": animation(["hurt_05", "hurt_04", "stance_01"], 95),
        "defeated": animation(["hurt_05"], 180, True, cancelable=False),
        "ultimateStartup": animation(["ultimate_01", "ultimate_02"], 95),
        "ultimateCharge": animation(["ultimate_02", "ultimate_03"], 90, True),
        "ultimateAttack": animation(["ultimate_03", "ultimate_04", "ultimate_05"], 75),
        "ultimateRecovery": animation(["ultimate_05", "stance_01"], 100),
        "victory": animation(["victory_01", "victory_02", "victory_03", "victory_04"], 140, True),
        "defeat": animation(["hurt_03", "hurt_04", "hurt_05"], 150),
    }


def rrvvfo_animations() -> dict[str, dict[str, object]]:
    animations = common_animations()
    animations.update({
        "fireBlastStartup": animation(["special_01"], 95),
        "fireBlastFire": animation(["special_02", "special_03", "special_04"], 72, events=[{"frame": 1, "type": "projectileSpawn"}]),
        "fireBlastRecovery": animation(["special_01", "stance_01"], 85),
        "shotsStartup": animation(["rush_01"], 90),
        "shotsSummon": animation(["rush_01", "special_01"], 100),
        "shotsCommand": animation(["special_02"], 95),
        "shotsFire": animation(["special_02", "special_03"], 70, events=[{"frame": 0, "type": "projectileSpawn"}]),
        "shotsRecovery": animation(["special_01", "stance_01"], 85),
        "lensActivate": animation(["power_01", "power_02", "power_03"], 80),
        "lensActive": animation(["power_03"], 100, True),
        "lensDodgeLeft": animation(["power_04", "power_05"], 55),
        "lensDodgeRight": animation(["power_05", "power_04"], 55),
        "lensEnd": animation(["power_03", "power_01"], 95),
        "objectSwapStartup": animation(["beam_01"], 75),
        "objectSwapDisappear": animation(["beam_02", "beam_03"], 60),
        "objectSwapReappear": animation(["beam_03", "beam_04"], 60),
        "objectSwapRecovery": animation(["beam_04", "stance_01"], 80),
    })
    return animations


def revvfo_animations() -> dict[str, dict[str, object]]:
    animations = common_animations()
    animations.update({
        "astrylteBlast": animation(["special_01", "special_02", "special_03", "special_04"], 72, events=[{"frame": 2, "type": "projectileSpawn"}]),
        "teleportRush": animation(["rush_01", "rush_02", "rush_03", "rush_04", "rush_05", "rush_06"], 62),
        "darkAura": animation(["power_01", "power_02", "power_03", "power_04", "power_05"], 82),
        "beamAttack": animation(["beam_01", "beam_02", "beam_04"], 72, events=[{"frame": 1, "type": "projectileSpawn"}]),
    })
    return animations


def wade_animations() -> dict[str, dict[str, object]]:
    animations = common_animations()
    animations.update({
        "lightningBlast": animation(["special_01", "special_02", "special_03", "special_04"], 55, events=[{"frame": 2, "type": "projectileSpawn"}]),
        "lightningDash": animation(["rush_01", "rush_02", "rush_03", "rush_04", "rush_05", "rush_06"], 46),
        "teleportRush": animation(["rush_01", "rush_02", "rush_03", "rush_04", "rush_05", "rush_06"], 46),
        "thunderstorm": animation(["power_01", "power_02", "power_03", "power_04", "power_05"], 76),
        "lightningBeam": animation(["beam_01", "beam_02", "beam_03", "beam_04"], 64, events=[{"frame": 2, "type": "projectileSpawn"}]),
        "beamAttack": animation(["beam_01", "beam_02", "beam_03", "beam_04"], 64, events=[{"frame": 2, "type": "projectileSpawn"}]),
    })
    return animations


def bark_animations() -> dict[str, dict[str, object]]:
    animations = common_animations()
    animations.update({
        "rockShot": animation(["special_01", "special_02", "special_03", "special_04"], 82, events=[{"frame": 2, "type": "projectileSpawn"}]),
        "groundQuake": animation(["rush_01", "rush_02", "rush_03", "rush_04", "rush_05", "rush_06"], 96),
        "rockArmor": animation(["power_01", "power_02", "power_03", "power_04", "power_05"], 112),
        "earthWall": animation(["beam_01", "beam_02", "beam_03", "beam_04"], 98),
        "seismicCounter": animation(["beam_01", "beam_02", "beam_03", "beam_04"], 88),
        "counterStance": animation(["beam_01", "beam_02"], 96, True),
    })
    return animations


def save_procedural_effects(effect_dir: Path, frame_images: dict[str, Image.Image], fighter: str) -> list[str]:
    generated: list[str] = []
    if fighter == "rrvvfo":
        size = (160, 160)
        eye = Image.new("RGBA", size)
        draw = ImageDraw.Draw(eye)
        draw.ellipse((18, 48, 142, 112), outline=(245, 245, 255, 235), width=7)
        draw.ellipse((60, 45, 100, 115), fill=(117, 65, 235, 220))
        draw.ellipse((74, 59, 90, 101), fill=(255, 255, 255, 245))
        eye.save(effect_dir / "lens-eye.png")
        generated.append("lens-eye.png")

        aura = Image.new("RGBA", size)
        draw = ImageDraw.Draw(aura)
        for radius in range(68, 24, -6):
            opacity = max(10, 92 - (68 - radius) * 2)
            draw.ellipse((80 - radius, 80 - radius, 80 + radius, 80 + radius), outline=(104, 54, 230, opacity), width=4)
        aura.filter(ImageFilter.GaussianBlur(3)).save(effect_dir / "lens-aura.png")
        generated.append("lens-aura.png")

        tinted(frame_images["idle_01"], (108, 59, 230), 145).save(effect_dir / "lens-afterimage.png")
        tinted(frame_images["idle_01"], (36, 217, 255), 210).save(effect_dir / "shots-clone.png")
        generated.extend(["lens-afterimage.png", "shots-clone.png"])

        marker = Image.new("RGBA", (96, 96))
        draw = ImageDraw.Draw(marker)
        draw.rounded_rectangle((18, 28, 78, 78), 9, fill=(42, 45, 53, 255), outline=(255, 90, 45, 245), width=5)
        draw.line((30, 64, 48, 38, 67, 64), fill=(255, 180, 80, 255), width=5)
        marker.save(effect_dir / "object-swap-object.png")
        generated.append("object-swap-object.png")

        flash = Image.new("RGBA", size)
        draw = ImageDraw.Draw(flash)
        for radius in range(70, 2, -5):
            opacity = max(0, 150 - (70 - radius) * 2)
            draw.ellipse((80 - radius, 80 - radius, 80 + radius, 80 + radius), outline=(255, 117, 49, opacity), width=5)
        flash.filter(ImageFilter.GaussianBlur(4)).save(effect_dir / "object-swap-flash.png")
        generated.append("object-swap-flash.png")
    elif fighter == "revvfo":
        tinted(frame_images["dash_02"], (142, 64, 242), 150).save(effect_dir / "teleport-afterimage.png")
        generated.append("teleport-afterimage.png")
    return generated


def crop_frames(source: Image.Image, fighter: str, prefix: str = "") -> tuple[dict[str, Image.Image], dict[str, dict[str, object]]]:
    images: dict[str, Image.Image] = {}
    metadata: dict[str, dict[str, object]] = {}
    crops = sheet_grid_crops(fighter)
    reference_size = FIGHTER_REFERENCE_SIZES[fighter]
    for base_name, crop in crops.items():
        name = f"{prefix}{base_name}"
        frame, frame_meta = normalize_frame(source.crop(scaled_crop(crop, source.size, reference_size)))
        images[name] = frame
        metadata[name] = frame_meta
    return images, metadata


def apply_frame_replacements(
    fighter: str,
    images: dict[str, Image.Image],
    metadata: dict[str, dict[str, object]],
    prefix: str = "",
) -> None:
    replacements = dict(FRAME_REPLACEMENTS.get(fighter, {}))
    if prefix:
        replacements.update(ALTERNATE_FRAME_REPLACEMENTS.get(fighter, {}))
    for destination, source in replacements.items():
        destination_name = f"{prefix}{destination}"
        source_name = f"{prefix}{source}"
        if destination_name not in images or source_name not in images:
            continue
        images[destination_name] = images[source_name].copy()
        metadata[destination_name] = {
            **metadata[source_name],
            "repairedFrom": source_name,
        }


def add_variants(animations: dict[str, dict[str, object]], available: Iterable[str]) -> None:
    available_set = set(available)
    for data in animations.values():
        data["variants"] = {"up": [f"up_{frame}" if f"up_{frame}" in available_set else frame for frame in data["frames"]]}


def build_fighter(fighter: str, source_path: Path, output_root: Path, alternate_path: Path | None = None) -> None:
    source = Image.open(source_path).convert("RGB")
    alternate = Image.open(alternate_path).convert("RGB") if alternate_path else None
    output_root.mkdir(parents=True, exist_ok=True)
    effect_dir = output_root / "effects"
    effect_dir.mkdir(parents=True, exist_ok=True)

    source.save(output_root / f"{fighter}-source-sheet.png", optimize=True)
    if alternate:
        alternate.save(output_root / f"{fighter}-hood-up-source-sheet.png", optimize=True)

    frame_images, frame_meta = crop_frames(source, fighter)
    apply_frame_replacements(fighter, frame_images, frame_meta)
    if alternate:
        alt_images, alt_meta = crop_frames(alternate, fighter, "up_")
        apply_frame_replacements(fighter, alt_images, alt_meta, "up_")
        frame_images.update(alt_images)
        frame_meta.update(alt_meta)

    rows = (len(frame_images) + ATLAS_COLUMNS - 1) // ATLAS_COLUMNS
    atlas = Image.new("RGBA", (ATLAS_COLUMNS * FRAME_SIZE[0], rows * FRAME_SIZE[1]))
    for index, (name, frame) in enumerate(frame_images.items()):
        x = index % ATLAS_COLUMNS * FRAME_SIZE[0]
        y = index // ATLAS_COLUMNS * FRAME_SIZE[1]
        atlas.alpha_composite(frame, (x, y))
        frame_meta[name]["source"] = [x, y, FRAME_SIZE[0], FRAME_SIZE[1]]
    atlas_path = output_root / f"{fighter}-atlas.png"
    # Pillow's optimized PNG pass can be interrupted on large, detailed concept
    # extractions in constrained build environments. A normal compressed save is
    # deterministic and always writes the closing PNG chunk.
    atlas.save(atlas_path, compress_level=6)

    effect_names: list[str] = []
    effect_crops = FIGHTER_EFFECT_CROPS.get(fighter, EFFECT_CROPS)
    reference_size = FIGHTER_REFERENCE_SIZES[fighter]
    for filename, crop in effect_crops.items():
        effect = trim_alpha(remove_border_background(source.crop(scaled_crop(crop, source.size, reference_size))), 3)
        effect.save(effect_dir / filename, optimize=True)
        effect_names.append(filename)
    effect_names.extend(save_procedural_effects(effect_dir, frame_images, fighter))

    if fighter == "rrvvfo":
        projectile = Image.open(effect_dir / "energy-projectile.png").convert("RGBA")
        tinted(projectile, (32, 210, 255), 235).save(effect_dir / "shots-projectile.png")
        spark = Image.open(effect_dir / "impact-sparks.png").convert("RGBA")
        tinted(spark, (32, 210, 255), 235).save(effect_dir / "shots-impact.png")
        effect_names.extend(["shots-projectile.png", "shots-impact.png"])
        animations = rrvvfo_animations()
        if alternate:
            add_variants(animations, frame_images)
    elif fighter == "revvfo":
        animations = revvfo_animations()
    elif fighter == "wade":
        animations = wade_animations()
    elif fighter == "bark":
        animations = bark_animations()
    else:
        raise ValueError(f"Unsupported fighter: {fighter}")

    manifest = {
        "version": 2,
        "fighter": fighter,
        "image": f"./{fighter}-atlas.png",
        "atlas": {"width": atlas.width, "height": atlas.height, "frameCanvas": list(FRAME_SIZE), "columns": ATLAS_COLUMNS},
        "defaults": {
            "appearance": "down",
            "groundPivot": list(GROUND_PIVOT),
            "scale": 0.74,
            "pixelSmoothing": True,
            "depthScale": 0.08,
            "maxAfterimages": 3,
        },
        "frames": frame_meta,
        "animations": animations,
        "effects": {Path(name).stem: f"./effects/{name}" for name in effect_names},
        "notes": {
            "sourceRuntimeLoaded": False,
            "combatAuthoritative": True,
            "conceptSheetExtraction": True,
            "gameplayDifference": False,
            "fullAlternateAnimationCoverage": bool(alternate),
        },
    }
    (output_root / f"{fighter}-animations.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Built {fighter}: {len(frame_images)} frames, {atlas.width}x{atlas.height}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fighter", choices=("rrvvfo", "revvfo", "wade", "bark"), required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--alternate", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build_fighter(args.fighter, args.source, args.output, args.alternate)


if __name__ == "__main__":
    main()
