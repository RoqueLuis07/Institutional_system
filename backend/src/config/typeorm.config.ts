import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { entities } from '../entities';

loadEnv();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'sga',
  password: process.env.DB_PASSWORD ?? 'sga',
  database: process.env.DB_DATABASE ?? 'sga',
  entities,
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  // Solo para desarrollo local: en producción el esquema se aplica vía
  // migraciones versionadas (npm run migration:run), nunca por sync.
  synchronize: process.env.NODE_ENV !== 'production',
};

export default new DataSource(typeOrmConfig);
