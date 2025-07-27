import logging
import structlog
import sys
from app.core.config import settings

def redact_sensitive_info(logger, name, event_dict):
    """
    Structlog processor to redact all sensitive secrets from logs.
    """
    # Define values that should never appear in logs
    sensitive_values = [
        settings.SUPABASE_SERVICE_ROLE_KEY,
        settings.SUPABASE_JWT_SECRET,
        settings.PGCRYPTO_SECRET_KEY,
        settings.GOOGLE_CLIENT_SECRET,
        settings.GOOGLE_API_KEY,
        settings.LANGCHAIN_API_KEY,
    ]

    # Filter out None values in case some settings are optional
    sensitive_values = [v for v in sensitive_values if v is not None]

    for key, value in event_dict.items():
        if isinstance(value, str):
            for sensitive in sensitive_values:
                if sensitive in value:
                    event_dict[key] = value.replace(sensitive, "[REDACTED]")
    return event_dict


def setup_logging():
    """
    Configures structlog for structured, JSON-based logging.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        stream=sys.stdout,
    )

    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            redact_sensitive_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )