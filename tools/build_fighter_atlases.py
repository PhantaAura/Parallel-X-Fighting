#!/usr/bin/env python3
"""Build production-ready experimental atlases for Rrvvfo and Revvfo.

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


def scaled_crop(crop: tuple[int, int, int, int], size: tuple[int, int]) -> tuple[int, int, int, int]:
    sx = size[0] / REFERENCE_SIZE[0]
    sy = size[1] / REFERENCE_SIZE[1]
    left, top, right, bottom = crop
    return (round(left * sx), round(top * sy), round(right * sx), round(bottom * sy))


def background_candidate(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a > 0 and r > 190 and g > 182 and b > 168 and max(r, g, b) - min(r, g, b) < 78


def remove_border_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        if not background_candidate(pixels[x, y]):
            continue
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))
    return rgba


def remove_sheet_debris(image: Image.Image) -> Image.Image:
    rgba = image.copy()
    alpha = rgba.getchannel("A")
    pixels = alpha.load()
    width, height = rgba.size
    visited: set[tuple[int, int]] = set()
    components: list[tuple[list[tuple[int, int]], int, int]] = []
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
            components.append((component, max_x - min_x + 1, max_y - min_y + 1))
    largest = max((len(component) for component, _, _ in components), default=1)
    minimum = max(110, round(largest * 0.075))
    for component, box_w, box_h in components:
        if len(component) < minimum or (box_h <= 9 and box_w >= 14) or (box_w <= 4 and box_h >= 25):
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
    else:
        tinted(frame_images["dash_02"], (142, 64, 242), 150).save(effect_dir / "teleport-afterimage.png")
        generated.append("teleport-afterimage.png")
    return generated


def crop_frames(source: Image.Image, prefix: str = "") -> tuple[dict[str, Image.Image], dict[str, dict[str, object]]]:
    images: dict[str, Image.Image] = {}
    metadata: dict[str, dict[str, object]] = {}
    for base_name, crop in CROPS.items():
        name = f"{prefix}{base_name}"
        frame, frame_meta = normalize_frame(source.crop(scaled_crop(crop, source.size)))
        images[name] = frame
        metadata[name] = frame_meta
    return images, metadata


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

    frame_images, frame_meta = crop_frames(source)
    if alternate:
        alt_images, alt_meta = crop_frames(alternate, "up_")
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
    atlas.save(atlas_path, optimize=True)

    effect_names: list[str] = []
    for filename, crop in EFFECT_CROPS.items():
        effect = trim_alpha(remove_border_background(source.crop(scaled_crop(crop, source.size))), 3)
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
    else:
        animations = revvfo_animations()

    manifest = {
        "version": 2,
        "fighter": fighter,
        "image": f"./{fighter}-atlas.png",
        "atlas": {"width": atlas.width, "height": atlas.height, "frameCanvas": list(FRAME_SIZE), "columns": ATLAS_COLUMNS},
        "defaults": {
            "appearance": "down",
            "groundPivot": list(GROUND_PIVOT),
            "scale": 0.62,
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
    parser.add_argument("--fighter", choices=("rrvvfo", "revvfo"), required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--alternate", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build_fighter(args.fighter, args.source, args.output, args.alternate)


if __name__ == "__main__":
    main()
