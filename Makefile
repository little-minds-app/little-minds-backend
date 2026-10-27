# Little Minds backend — local infrastructure helpers (Blueprint §27.2).
# Nest API remains a host process (`npm run start:dev`); Compose is services only.

COMPOSE_FILE := infrastructure/docker-compose.yml
COMPOSE := docker compose -f $(COMPOSE_FILE) --env-file .env

.PHONY: dev-up dev-down dev-ps reset-local compose-config

## Start PostgreSQL, MinIO, and Mailpit in the background
dev-up:
	@test -f .env || cp .env.example .env
	$(COMPOSE) up -d

## Show compose service status
dev-ps:
	$(COMPOSE) ps

## Stop containers (keeps named volumes)
dev-down:
	$(COMPOSE) down

## Stop containers and delete local data volumes (destructive reset)
reset-local:
	$(COMPOSE) down -v

## Validate compose file (no containers started)
compose-config:
	@test -f .env || cp .env.example .env
	$(COMPOSE) config --quiet
	@echo "compose config OK"
