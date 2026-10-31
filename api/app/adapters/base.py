from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseAdvisoryAdapter(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def kind(self) -> str:
        pass

    @abstractmethod
    def fetch_advisories(self) -> List[Dict[str, Any]]:
        """Fetch raw advisory items from data source."""
        pass
