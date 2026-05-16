import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
KAFKA_CONSUMER_GROUP_ID = os.getenv("KAFKA_CONSUMER_GROUP_ID", "ai-orchestrator-group")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
REDIS_KEY_TTL = int(os.getenv("REDIS_KEY_TTL", "3600"))

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

TOPIC_REVIEW_JOB_REQUESTED = "review-job-requested"
TOPIC_REVIEW_JOB_FEEDBACK = "review-job-feedback"
TOPIC_AGENT_PROGRESS = "agent-progress"
TOPIC_REVIEW_COMPLETED = "review-completed"
