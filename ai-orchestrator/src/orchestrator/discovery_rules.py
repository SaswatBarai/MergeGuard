from typing import Dict, List, Set

# Detection rules for various technologies.
# Each category contains a mapping from the technology name to a list of patterns.
# Patterns can be:
# - Extension patterns: starting with "." (e.g., ".py")
# - Filename patterns: exact match (e.g., "package.json")
# - Substring patterns: checks if the pattern exists in the filename (e.g., "prisma")

DETECTION_RULES = {
    "languages": {
        "TypeScript": [".ts", ".tsx"],
        "JavaScript": [".js", ".jsx"],
        "Python": [".py"],
        "Go": [".go"],
        "Java": [".java"],
        "Rust": [".rs"],
        "Ruby": [".rb"],
        "PHP": [".php"],
        "C++": [".cpp", ".hpp", ".cc", ".h"],
        "C#": [".cs"],
        "Swift": [".swift"],
        "Kotlin": [".kt", ".kts"],
    },
    "frameworks": {
        "Node.js/NPM": ["package.json", "pnpm-lock.yaml", "yarn.lock"],
        "TypeScript Config": ["tsconfig.json"],
        "Docker": ["Dockerfile", "docker-compose.yml", ".dockerignore"],
        "Python Environment": ["requirements.txt", "pyproject.toml", "Pipfile", "uv.lock"],
        "Maven": ["pom.xml"],
        "Gradle": ["build.gradle", "build.gradle.kts"],
        "Go Modules": ["go.mod", "go.sum"],
        "Cargo": ["Cargo.toml", "Cargo.lock"],
        "RubyGems": ["Gemfile", "Gemfile.lock"],
        "Composer": ["composer.json", "composer.lock"],
        "Terraform": [".tf", ".tfvars"],
        "Kubernetes": ["k8s", "kubernetes", "chart.yaml"],
    },
    "db_layer": {
        "Prisma": ["prisma", "schema.prisma"],
        "SQLAlchemy": ["sqlalchemy"],
        "TypeORM": ["typeorm"],
        "Mongoose": ["mongoose"],
        "Hibernate": ["hibernate"],
        "Entity Framework": ["EntityFramework"],
        "Drizzle": ["drizzle"],
        "Alembic": ["alembic"],
        "Flyway": ["flyway"],
        "Liquibase": ["liquibase"],
    },
    "test_frameworks": {
        "Jest": ["jest", "jest.config.js", "jest.config.ts"],
        "Pytest": ["pytest", "conftest.py", "pytest.ini", "tox.ini"],
        "Mocha": ["mocha", ".mocharc"],
        "Cypress": ["cypress"],
        "JUnit": ["junit"],
        "TestNG": ["testng"],
        "Vitest": ["vitest"],
        "Playwright": ["playwright"],
        "RSpec": ["rspec"],
        "PHPUnit": ["phpunit"],
    }
}
