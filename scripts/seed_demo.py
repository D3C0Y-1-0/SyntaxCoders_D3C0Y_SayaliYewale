import sys
import os
import asyncio

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.app.db.init_db import seed_demo_data
from api.app.core.logging import setup_logging, logger


def main():
    setup_logging()
    logger.info("Executing demo data seed...")
    result = seed_demo_data()
    print("Seed completed successfully:", result, flush=True)


if __name__ == "__main__":
    main()
