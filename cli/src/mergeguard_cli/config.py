import json
import os
from pathlib import Path

CONFIG_DIR  = Path.home() / ".config" / "mergeguard"
CONFIG_FILE = CONFIG_DIR / "config.json"


def _load() -> dict:
    if not CONFIG_FILE.exists():
        return {}
    with open(CONFIG_FILE) as f:
        return json.load(f)


def _save(data: dict) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _set(key: str, value: str) -> None:
    cfg = _load()
    cfg[key] = value
    _save(cfg)


def get_api_key() -> str | None:
    return _load().get("api_key")

def set_api_key(key: str) -> None:
    _set("api_key", key)

def get_api_url() -> str:
    return _load().get("api_url", os.getenv("MERGEGUARD_API_URL", "http://localhost:3000"))

def set_api_url(url: str) -> None:
    _set("api_url", url)

def get_github_token() -> str | None:
    return _load().get("github_token")

def set_github_token(token: str) -> None:
    _set("github_token", token)

def clear_config() -> None:
    if CONFIG_FILE.exists():
        CONFIG_FILE.unlink()
