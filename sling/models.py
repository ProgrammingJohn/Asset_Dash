from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    id: int
    first_name: str
    last_name: str

@dataclass
class Event:
    id: int
    location_id: int
    location_name: str
    date_start: datetime
    date_end: datetime
    worker: User