# Home Library Service

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Docker and Docker Compose - [Download & Install Docker Desktop](https://www.docker.com/get-started).

## Downloading

```
git clone git@github.com:ArtemKhudiakov/nodejs2025Q2-service.git --branch=develop
cd nodejs2025Q2-service
```

## Running application with Docker

### Quick Start

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Start Docker Desktop, build and start containers:
```bash
docker-compose up -d --build
```

3. Wait for the application to start (migrations will run automatically).

4. Open OpenAPI documentation: http://localhost:4000/doc/

### Troubleshooting

#### PostgreSQL Version Incompatibility Error

Если вы видите ошибку:
```
FATAL: database files are incompatible with server
The data directory was initialized by PostgreSQL version 15, which is not compatible with this version 16.11.
```

**Причина:** Эта ошибка возникает, если:
- Вы ранее запускали другие проекты с PostgreSQL 15, и Docker volumes остались с данными от старой версии
- Вы обновили версию PostgreSQL в `docker-compose.yml` с 15 на 16
- Docker пытается использовать существующий volume с данными от несовместимой версии

**Решение:** Удалите старые volumes и пересоздайте контейнеры:

```bash
# Остановить и удалить контейнеры и volumes текущего проекта
docker-compose down -v

# Если проблема сохраняется, проверьте все volumes PostgreSQL
docker volume ls | grep postgres

# Удалите конкретный volume (замените имя на ваше)
docker volume rm <volume_name>

# Пересоздайте контейнеры
docker-compose up -d --build
```

Флаг `-v` удаляет все volumes проекта, включая данные базы данных. После этого база данных будет инициализирована заново с правильной версией PostgreSQL.

**Внимание:** Это удалит все данные из базы данных. Если у вас есть важные данные, сделайте резервную копию перед выполнением команды.

### Development Mode (with hot reload)

For development with automatic restart on code changes:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This will mount the `src` folder and restart the application automatically when files change.

### Production Mode

```bash
docker-compose up -d
```

The application will:
- Automatically restart on crash (`restart: unless-stopped`)
- Run database migrations on startup
- Store database files and logs in Docker volumes (persistent storage)

### Stopping the application

```bash
docker-compose down
```

To remove volumes (database data will be lost):
```bash
docker-compose down -v
```

## Running application locally (without Docker)

### Installing NPM modules

```
npm install
```

### Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your local PostgreSQL connection string:
```
DATABASE_URL=postgresql://user:password@localhost:5432/home_library?schema=public
```

3. Run database migrations:
```bash
npx prisma migrate deploy
```

### Start

```
npm start
```

After starting the app on port (4000 as default) you can open

in your browser OpenAPI documentation by typing http://localhost:4000/doc/.

## Database Migrations

The project uses Prisma migrations to manage database schema. Migrations are located in `prisma/migrations/`.

- Migrations run automatically when starting the application with Docker
- To run migrations manually: `npx prisma migrate deploy`
- To create a new migration: `npx prisma migrate dev --name migration_name`


## Database Relations

The project uses Prisma relations defined in `prisma/schema.prisma`:
- Artists can have multiple Albums and Tracks
- Albums belong to an Artist and can have multiple Tracks
- Tracks belong to an Artist and optionally to an Album
- Favorites can reference Artists, Albums, or Tracks

All relations are configured with proper foreign keys and cascade delete behavior using Prisma decorators (`@relation`).

**Note:** Local PostgreSQL installation is not required. The application connects to PostgreSQL running in a Docker container. All database operations are performed through Prisma ORM.

## Docker Image

The application Docker image is optimized to be under 500MB using multi-stage builds.

### Using Pre-built Image from Docker Hub

The application image is available on Docker Hub:

```bash
docker pull khudiakovdev/home-library:latest
```

You can use it in `docker-compose.yml`:

```yaml
services:
  app:
    image: khudiakovdev/home-library:latest
    # ... rest of configuration
```

### Building and Pushing to DockerHub

1. Build the image:
```bash
docker build -t home-library:latest .
```

2. Tag the image:
```bash
docker tag home-library:latest khudiakovdev/home-library:latest
```

3. Push to DockerHub:
```bash
docker push khudiakovdev/home-library:latest
```

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

## Security

### Vulnerability Scanning

Scan for vulnerabilities in dependencies:

```bash
npm run audit
```

Fix automatically fixable vulnerabilities:

```bash
npm run audit:fix
```
