"""CLI script to seed database with demo fixtures."""
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from api.app.db.session import SessionLocal
from api.app.db.seed import seed_database


def main():
    print("[SentinelScope] Seeding database with demo records...")
    db = SessionLocal()
    try:
        seed_database(db, force_reset=False)
        print("[SentinelScope] Database seeding completed successfully.")
    except Exception as e:
        print(f"[SentinelScope] Seeding failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

