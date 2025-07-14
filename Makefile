.PHONY: help build run stop clean logs shell dev prod

# Default target
help:
	@echo "Available commands:"
	@echo "  build    - Build the Docker image"
	@echo "  run      - Run the application with Docker Compose"
	@echo "  stop     - Stop the application"
	@echo "  clean    - Remove containers and images"
	@echo "  logs     - Show application logs"
	@echo "  shell    - Open shell in running container"
	@echo "  dev      - Run in development mode"
	@echo "  prod     - Run in production mode with nginx"

# Build the Docker image
build:
	docker-compose -f docker-compose.dev.yml build

# Run the application
run:
	docker-compose -f docker-compose.dev.yml up -d

# Stop the application
stop:
	docker-compose -f docker-compose.dev.yml down

# Clean up containers and images
clean:
	docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
	docker system prune -f

# Show logs
logs:
	docker-compose -f docker-compose.dev.yml logs -f feed-crawler

# Open shell in container
shell:
	docker-compose -f docker-compose.dev.yml exec feed-crawler sh

# Development mode
dev:
	docker-compose -f docker-compose.dev.yml up --build

# Production mode with nginx
prod:
	docker-compose --profile production up -d --build

# Production mode without nginx
prod-app:
	docker-compose -f docker-compose.dev.yml up -d --build

# Stop production
prod-stop:
	docker-compose --profile production down

# Show production logs
prod-logs:
	docker-compose --profile production logs -f

# Health check
health:
	curl -f http://localhost:3000/api/source || echo "Application is not healthy"

# Backup data
backup:
	tar -czf backup-$(shell date +%Y%m%d-%H%M%S).tar.gz sources/

# Restore data
restore:
	@echo "Usage: make restore BACKUP_FILE=backup-20231201-120000.tar.gz"
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE"; exit 1; fi
	tar -xzf $(BACKUP_FILE) 