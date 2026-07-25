#!/usr/bin/env python3
"""Build the experimental Rrvvfo atlas from the supplied concept sheet.

This is a development-time tool. The browser never performs cropping or
background removal and never loads the reference sheet.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

FRAME_SIZE = (192, 192)
GROUND_PIVOT = (96, 178)
CONTENT_BOX = (168, 168)
ATLAS_COLUMNS = 8

# Coordinates are deliberately conservative. They exclude sheet headings,
# numbers and borders even when that means preserving less of a large flame.
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
    "heavy_03": (726, 312, 849, 398),
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
    "fire_01": (367, 566, 439, 647),
    "fire_02": (441, 566, 513, 647),
    "fire_03": (515, 566, 590, 647),
    "fire_04": (592, 566, 679, 647),
    "shots_01": (686, 566, 755, 647),
    "lens_01": (15, 683, 84, 754),
    "lens_02": (86, 683, 160, 754),
    "lens_03": (162, 683, 251, 754),
    "lens_04": (253, 683, 363, 754),
    "lens_05": (365, 683, 464, 754),
    "swap_01": (470, 683, 523, 754),
    "swap_02": (525, 683, 578, 754),
    "swap_03": (580, 683, 630, 754),
    "swap_04": (632, 683, 680, 754),
    "victory_01": (16, 804, 91, 931),
    "victory_02": (94, 804, 170, 931),
    "victory_03": (174, 804, 254, 931),
    "victory_04": (258, 804, 342, 931),
    "turn_01": (355, 820, 418, 931),
    "turn_02": (421, 820, 484, 931),
    "turn_03": (487, 820, 550, 931),
    "turn_04": (553, 820, 616, 931),
    "turn_05": (619, 820, 682, 931),
    "hood_01": (762, 818, 846, 931),
    "hood_02": (853, 818, 934, 931),
    "hood_03": (945, 818, 1034, 931),
}

EFFECT_CROPS = {
    "fire-projectile.png": (570, 553, 677, 632),
    "fire-trails.png": (1093, 680, 1268, 746),
    "impact-sparks.png": (1093, 801, 1268, 858),
    "smoke-dust.png": (1093, 749, 1268, 798),
    "ultimate-aura.png": (1093, 862, 1268, 938),
}


def background_candidate(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a > 0 and r > 192 and g > 185 and b > 170 and max(r, g, b) - min(r, g, b) < 72


def remove_border_background(image: Image.Image) -> Image.Image:
    """Remove only light pixels connected to the crop edge.

    A flood fill is safer than a global color key for the white shirt stripe,
    eyes, fire highlights and pale outline.
    """

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
        # Retain a tiny translucent fringe for anti-aliased ink edges.
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
    """Discard detached frame numbers, rule lines and JPEG specks.

    The character silhouette is always a much larger connected component than
    the printed numbers. Large fire shapes remain intact.
    """

    rgba = image.copy()
    alpha = rgba.getchannel("A")
    pixels = alpha.load()
    width, height = rgba.size
    visited: set[tuple[int, int]] = set()
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
            box_w, box_h = max_x - min_x + 1, max_y - min_y + 1
            if len(component) < 120 or (box_h <= 8 and box_w >= 14) or (box_w <= 4 and box_h >= 28):
                for x, y in component:
                    rgba.putpixel((x, y), (0, 0, 0, 0))
    return rgba


def trim_alpha(image: Image.Image, padding: int = 2) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (1, 1))
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(image.width, right + padding),
            min(image.height, bottom + padding),
        )
    )


def normalize_frame(image: Image.Image) -> tuple[Image.Image, dict[str, object]]:
    trimmed = trim_alpha(remove_sheet_debris(remove_border_background(image)), 2)
    max_w, max_h = CONTENT_BOX
    scale = min(max_w / trimmed.width, max_h / trimmed.height)
    # Do not upscale tiny crops enough to magnify JPEG artifacts excessively.
    scale = min(scale, 1.45)
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


def save_procedural_effects(effect_dir: Path, frame_images: dict[str, Image.Image]) -> None:
    size = (160, 160)
    eye = Image.new("RGBA", size)
    draw = ImageDraw.Draw(eye)
    draw.ellipse((18, 48, 142, 112), outline=(245, 245, 255, 235), width=7)
    draw.ellipse((60, 45, 100, 115), fill=(117, 65, 235, 220))
    draw.ellipse((74, 59, 90, 101), fill=(255, 255, 255, 245))
    eye.save(effect_dir / "lens-eye.png")

    aura = Image.new("RGBA", size)
    draw = ImageDraw.Draw(aura)
    for radius in range(68, 24, -6):
        opacity = max(10, 92 - (68 - radius) * 2)
        draw.ellipse((80 - radius, 80 - radius, 80 + radius, 80 + radius), outline=(104, 54, 230, opacity), width=4)
    aura = aura.filter(ImageFilter.GaussianBlur(3))
    aura.save(effect_dir / "lens-aura.png")

    afterimage = tinted(frame_images["idle_01"], (108, 59, 230), 145)
    afterimage.save(effect_dir / "lens-afterimage.png")
    tinted(frame_images["idle_01"], (36, 217, 255), 210).save(effect_dir / "shots-clone.png")

    marker = Image.new("RGBA", (96, 96))
    draw = ImageDraw.Draw(marker)
    draw.rounded_rectangle((18, 28, 78, 78), 9, fill=(42, 45, 53, 255), outline=(255, 90, 45, 245), width=5)
    draw.line((30, 64, 48, 38, 67, 64), fill=(255, 180, 80, 255), width=5)
    marker.save(effect_dir / "object-swap-object.png")

    flash = Image.new("RGBA", size)
    draw = ImageDraw.Draw(flash)
    for radius in range(70, 2, -5):
        opacity = max(0, 150 - (70 - radius) * 2)
        draw.ellipse((80 - radius, 80 - radius, 80 + radius, 80 + radius), outline=(255, 117, 49, opacity), width=5)
    flash.filter(ImageFilter.GaussianBlur(4)).save(effect_dir / "object-swap-flash.png")


def animation(frames: list[str], duration: int, loop: bool = False, **extra: object) -> dict[str, object]:
    result: dict[str, object] = {
        "frames": frames,
        "frameDuration": duration,
        "loop": loop,
        "cancelable": extra.pop("cancelable", True),
    }
    result.update(extra)
    return result


def build_animations() -> dict[str, dict[str, object]]:
    idle = ["idle_01", "idle_02", "idle_03", "idle_04", "idle_05", "idle_06"]
    stance = ["stance_01", "stance_02", "stance_03", "stance_04"]
    run = ["run_01", "run_02", "run_03", "run_04"]
    animations = {
        "idle": animation(idle, 125, True),
        "fightingStance": animation(stance, 105, True),
        "run": animation(run, 82, True),
        "jumpStart": animation(["jump_01", "jump_02"], 75),
        "jumpRise": animation(["jump_02", "jump_03"], 110, True),
        "fall": animation(["jump_03", "jump_04"], 110, True),
        "land": animation(["jump_05", "stance_01"], 65),
        "dash": animation(["dash_01", "dash_02", "dash_03", "dash_04"], 60),
        "turn": animation(["turn_01", "turn_02", "turn_03", "turn_04", "turn_05"], 55),
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
        "fireBlastStartup": animation(["fire_01"], 95),
        "fireBlastFire": animation(["fire_02", "fire_03"], 72, events=[{"frame": 1, "type": "projectileSpawn"}]),
        "fireBlastRecovery": animation(["fire_01", "stance_01"], 85),
        "shotsStartup": animation(["shots_01"], 90),
        "shotsSummon": animation(["shots_01", "fire_01"], 100),
        "shotsCommand": animation(["fire_02"], 95),
        "shotsFire": animation(["fire_02", "fire_01"], 70, events=[{"frame": 0, "type": "projectileSpawn"}]),
        "shotsRecovery": animation(["fire_01", "stance_01"], 85),
        "lensActivate": animation(["lens_01", "lens_02", "lens_03"], 80),
        "lensActive": animation(["lens_03"], 100, True),
        "lensDodgeLeft": animation(["lens_04", "lens_05"], 55),
        "lensDodgeRight": animation(["lens_05", "lens_04"], 55),
        "lensEnd": animation(["lens_03", "lens_01"], 95),
        "objectSwapStartup": animation(["swap_01"], 75),
        "objectSwapDisappear": animation(["swap_02", "swap_03"], 60),
        "objectSwapReappear": animation(["swap_03", "swap_04"], 60),
        "objectSwapRecovery": animation(["swap_04", "stance_01"], 80),
        "ultimateStartup": animation(["hood_01", "hood_02"], 95, hoodState="up"),
        "ultimateCharge": animation(["hood_01", "hood_02", "hood_01"], 90, True, hoodState="up"),
        "ultimateAttack": animation(["hood_02", "hood_01"], 75, hoodState="up"),
        "ultimateRecovery": animation(["hood_01", "idle_01"], 100, hoodState="up"),
        "victory": animation(["victory_01", "victory_02", "victory_03", "victory_04"], 140, True),
        "defeat": animation(["hurt_03", "hurt_04", "hurt_05"], 150),
    }
    # Hood-up is a visual variant only. Keep the front pose stable during
    # ordinary actions instead of making the alternate randomly rotate.
    for data in animations.values():
        count = len(data["frames"])
        data["variants"] = {"up": ["hood_01"] * count}
    animations["turn"]["variants"]["up"]=["hood_01","hood_02","hood_03","hood_02","hood_01"]
    return animations


def build(source_path: Path, output_root: Path) -> None:
    source = Image.open(source_path).convert("RGB")
    output_root.mkdir(parents=True, exist_ok=True)
    effect_dir = output_root / "effects"
    effect_dir.mkdir(parents=True, exist_ok=True)
    source.save(output_root / "rrvvfo-source-sheet.png", optimize=True)

    frame_images: dict[str, Image.Image] = {}
    frame_meta: dict[str, dict[str, object]] = {}
    for name, crop in CROPS.items():
        frame, metadata = normalize_frame(source.crop(crop))
        frame_images[name] = frame
        frame_meta[name] = metadata

    rows = (len(frame_images) + ATLAS_COLUMNS - 1) // ATLAS_COLUMNS
    atlas = Image.new("RGBA", (ATLAS_COLUMNS * FRAME_SIZE[0], rows * FRAME_SIZE[1]))
    for index, (name, frame) in enumerate(frame_images.items()):
        x = index % ATLAS_COLUMNS * FRAME_SIZE[0]
        y = index // ATLAS_COLUMNS * FRAME_SIZE[1]
        atlas.alpha_composite(frame, (x, y))
        frame_meta[name]["source"] = [x, y, FRAME_SIZE[0], FRAME_SIZE[1]]
    atlas.save(output_root / "rrvvfo-atlas.png", optimize=True)

    for filename, crop in EFFECT_CROPS.items():
        effect = trim_alpha(remove_border_background(source.crop(crop)), 3)
        effect.save(effect_dir / filename, optimize=True)
    save_procedural_effects(effect_dir, frame_images)
    fire = Image.open(effect_dir / "fire-projectile.png").convert("RGBA")
    tinted(fire, (32, 210, 255), 235).save(effect_dir / "shots-projectile.png")
    spark = Image.open(effect_dir / "impact-sparks.png").convert("RGBA")
    tinted(spark, (32, 210, 255), 235).save(effect_dir / "shots-impact.png")

    manifest = {
        "version": 1,
        "fighter": "rrvvfo",
        "image": "./rrvvfo-atlas.png",
        "atlas": {
            "width": atlas.width,
            "height": atlas.height,
            "frameCanvas": list(FRAME_SIZE),
            "columns": ATLAS_COLUMNS,
        },
        "defaults": {
            "appearance": "down",
            "groundPivot": list(GROUND_PIVOT),
            "scale": 0.62,
            "pixelSmoothing": True,
            "depthScale": 0.08,
            "maxAfterimages": 3,
        },
        "frames": frame_meta,
        "animations": build_animations(),
        "effects": {
            key.removesuffix(".png"): f"./effects/{key}"
            for key in list(EFFECT_CROPS) + [
                "shots-clone.png",
                "shots-projectile.png",
                "shots-impact.png",
                "lens-eye.png",
                "lens-aura.png",
                "lens-afterimage.png",
                "object-swap-object.png",
                "object-swap-flash.png",
            ]
        },
        "notes": {
            "sourceRuntimeLoaded": False,
            "combatAuthoritative": True,
            "defaultHood": "down",
            "alternateHood": "up",
            "hoodGameplayDifference": False,
        },
    }
    (output_root / "rrvvfo-animations.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Built {len(frame_images)} frames: {atlas.width}x{atlas.height}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/fighters/rrvvfo"),
    )
    args = parser.parse_args()
    build(args.source, args.output)


if __name__ == "__main__":
    main()
