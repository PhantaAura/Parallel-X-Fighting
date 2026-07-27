#!/usr/bin/env python3
"""CLI wrapper for the importable unified fighter atlas builder."""
from __future__ import annotations
import argparse
from pathlib import Path
from build_fighter_atlases import build_fighter


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
