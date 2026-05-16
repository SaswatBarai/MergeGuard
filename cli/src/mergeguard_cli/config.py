import json
import os
from pathlib import Path

CONFIG_DIR = Path.home() / ".config" / "mergeguard"
CONFIG_FILE = CONFIG_DIR / "config.json"

def load_config():
    if not CONFIG_FILE.exists():
        return {}
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def save_config(config_data):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config_data, f, indent=2)

def get_api_key():
    return load_config().get("api_key")

def set_api_key(api_key):
    config = load_config()
    config["api_key"] = api_key
    save_config(config)

def get_api_url():
    return load_config().get("api_url", os.getenv("MERGEGUARD_API_URL", "http://localhost:3000"))

def set_api_url(url):
    config = load_config()
    config["api_url"] = url
    save_config(config)
