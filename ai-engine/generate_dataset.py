"""
Convenience entry point to generate dataset from ai-engine root.

Run:
    python generate_dataset.py
"""

from pathlib import Path
import runpy


if __name__ == "__main__":
    target = Path(__file__).parent / "dataset" / "generate_dataset.py"
    runpy.run_path(str(target), run_name="__main__")
