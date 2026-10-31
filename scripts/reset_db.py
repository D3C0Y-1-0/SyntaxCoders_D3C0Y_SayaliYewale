import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.app.db.init_db import reset_db
from api.app.core.logging import logger


def main():
    logger.info("Resetting database...")
    reset_db()
    print("Database reset completed successfully.")


if __name__ == "__main__":
    main()

