"""
Shared environment loading helpers for the backend.
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv


def load_environment(base_dir: Path, root_dir: Path) -> None:
    env_files = (
        base_dir / ".env",
        root_dir / ".env",
    )
    for env_file in env_files:
        if env_file.exists():
            load_dotenv(env_file, override=False)
