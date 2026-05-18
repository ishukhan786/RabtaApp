import os

import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
client = redis.from_url(REDIS_URL, decode_responses=True)


def set_cache(key: str, value: str, seconds: int = 300) -> None:
    client.setex(key, seconds, value)


def get_cache(key: str) -> str | None:
    return client.get(key)
