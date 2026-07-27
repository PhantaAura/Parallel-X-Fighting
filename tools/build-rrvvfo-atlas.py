#!/usr/bin/env python3
"""Compatibility wrapper for the unified fighter atlas builder."""
from __future__ import annotations
import argparse
from pathlib import Path
from build_fighter_atlases import build_fighter


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--alternate", type=Path)
    parser.add_argument("--output", type=Path, default=Path("assets/fighters/rrvvfo"))
    args = parser.parse_args()
    build_fighter("rrvvfo", args.source, args.output, args.alternate)


if __name__ == "__main__":
    main()
