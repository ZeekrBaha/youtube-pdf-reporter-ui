import sys
from pathlib import Path

# Make `app.*` importable without installing the package every time.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
