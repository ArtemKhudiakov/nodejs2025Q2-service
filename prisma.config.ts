import 'dotenv/config';

interface PrismaConfig {
  schema: string;
  datasource: {
    url: string;
  };
  migrations: {
    path: string;
  };
}

function env(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function defineConfig(config: PrismaConfig): PrismaConfig {
  return config;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
});

