from setuptools import setup, find_packages

setup(
    name="mergeguard-cli",
    version="1.0.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "typer>=0.9.0",
        "rich>=13.0.0",
        "requests>=2.31.0",
        "sseclient-py>=1.8.0",
    ],
    entry_points={
        "console_scripts": [
            "mergeguard=mergeguard_cli.main:app",
        ],
    },
)
