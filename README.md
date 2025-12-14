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

2. Update `.env` with your local PostgreSQL connection string and other required variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/home_library?schema=public
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-this-in-production
JWT_ACCESS_EXPIRATION=10m
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=7d

# Logging Configuration
LOG_LEVEL=log
MAX_LOG_FILE_SIZE_KB=10240
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

## Using Authentication in Swagger

### Step 1: Register a new user

1. Open Swagger UI: http://localhost:4000/doc/
2. Navigate to the **Authentication** section
3. Find `POST /auth/signup` endpoint
4. Click "Try it out"
5. Enter your credentials in the request body:
   ```json
   {
     "login": "your_username",
     "password": "your_password"
   }
   ```
6. Click "Execute"
7. You should receive a response with status `201` containing your user data (without password)

### Step 2: Login to get tokens

1. Find `POST /auth/login` endpoint in the **Authentication** section
2. Click "Try it out"
3. Enter the same credentials you used for signup:
   ```json
   {
     "login": "your_username",
     "password": "your_password"
   }
   ```
4. Click "Execute"
5. Copy the `accessToken` and `refreshToken` from the response

### Step 3: Authorize in Swagger

1. Scroll to the top of the Swagger UI page
2. Find the **Authorize** button (lock icon) in the top right
3. Click on it
4. In the `bearerAuth` field, paste your `accessToken` (without the word "Bearer")
5. Click "Authorize"
6. Click "Close"

Now you can use all protected endpoints! Your requests will automatically include the Authorization header.

### Refreshing tokens

If your access token expires:

1. Use `POST /auth/refresh` endpoint
2. Send your `refreshToken` in the request body:
   ```json
   {
     "refreshToken": "your_refresh_token_here"
   }
   ```
3. You'll receive a new pair of `accessToken` and `refreshToken`
4. Update your authorization in Swagger with the new `accessToken`

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

## Authentication & Authorization

The service implements JWT-based authentication with Access and Refresh tokens.

### Authentication Endpoints

- `POST /auth/signup` - Register a new user account
- `POST /auth/login` - Login and receive Access and Refresh tokens
- `POST /auth/refresh` - Refresh Access token using Refresh token

### Security

- All routes are protected by default, except:
  - `/auth/signup`
  - `/auth/login`
  - `/auth/refresh`
  - `/doc` (Swagger documentation)
  - `/` (root endpoint)

- Access tokens are validated on each protected request via Bearer token in Authorization header:
  ```
  Authorization: Bearer <access_token>
  ```

- User passwords are hashed using bcrypt before storing in database

- Refresh tokens are stored in database with expiration tracking

### Environment Variables for Authentication

```env
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key
JWT_ACCESS_EXPIRATION=10m
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key
JWT_REFRESH_EXPIRATION=7d
```

## Logging & Error Handling

The service includes comprehensive logging and error handling capabilities.

### Features

- **Custom LoggingService** with multiple log levels (verbose, debug, log, warn, error, fatal)
- **HTTP Request/Response Logging** - All incoming requests and responses are logged (URL, query params, body, status codes)
- **Exception Filter** - All errors are caught and logged with appropriate HTTP status codes
- **Global Error Handlers** - Handles `uncaughtException` and `unhandledRejection` events
- **File Logging** - Logs are written to files with automatic rotation
  - `logs/app.log` - General application logs
  - `logs/error.log` - Error logs only
- **Log Rotation** - Automatic log file rotation based on configurable file size

### Environment Variables for Logging

```env
LOG_LEVEL=log  # Options: verbose, debug, log, warn, error, fatal
MAX_LOG_FILE_SIZE_KB=10240  # Maximum log file size in KB before rotation
```

### Log Levels

Logs are filtered by level. If `LOG_LEVEL=log`, all messages with level `log`, `warn`, `error`, and `fatal` will be logged (higher priority levels are always logged).

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
