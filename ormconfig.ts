const config = {
    host: process.env.POSTGRES_HOST,
    type: 'mysql',
    port: Number(process.env.POSTGRES_POST),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
        'src/domain/entity/**/**.entity{.ts,.js}',
    ],
    migrations: process.env.TESTING === 'true' ? undefined : ["src/migration/postgres/**/*.ts"],
    cli: {
        migrationsDir: 'src/migration/postgres',
    },
    synchronize: false,
};

export default config;