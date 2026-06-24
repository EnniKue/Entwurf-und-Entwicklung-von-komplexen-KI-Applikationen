from datetime import datetime
import json
import uuid


def log_request(
    route: str,
    category: str,
    source: str,
    latency_ms: int,
    guardrail_triggered=None,
    status="success",
    error=None
):

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "request_id": str(uuid.uuid4())[:8],

        "route": route,
        "category": category,
        "source": source,

        "latency_ms": latency_ms,

        "guardrail_triggered": guardrail_triggered,

        "status": status,
        "error": error
    }

    with open(
        "logs/chat.log",
        "a",
        encoding="utf-8"
    ) as file:

        file.write(
    json.dumps(
        log_entry,
        ensure_ascii=False
    )
    + "\n"
)