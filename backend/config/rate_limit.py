"""
Lightweight in-memory rate limiting for sensitive endpoints.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from functools import wraps

from flask import jsonify, request

_LOCK = threading.Lock()
_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def rate_limit(key_prefix: str, limit: int, window_seconds: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            now = time.time()
            client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
            bucket_key = f"{key_prefix}:{client_ip}"

            with _LOCK:
                bucket = _BUCKETS[bucket_key]
                while bucket and bucket[0] <= now - window_seconds:
                    bucket.popleft()
                if len(bucket) >= limit:
                    retry_after = max(1, int(window_seconds - (now - bucket[0])))
                    return (
                        jsonify(
                            {
                                "error": "Rate limit exceeded",
                                "retry_after_seconds": retry_after,
                            }
                        ),
                        429,
                    )
                bucket.append(now)

            return fn(*args, **kwargs)

        return wrapper

    return decorator
