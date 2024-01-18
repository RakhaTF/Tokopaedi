import "dotenv/config"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
   type: 'postgres',
   host: process.env.POSTGRES_HOST,
   port: Number(process.env.POSTGRES_POST),
   username: process.env.POSTGRES_USER,
   password: process.env.POSTGRES_PASSWORD,
   database: process.env.POSTGRES_DB,
   migrations: process.env.TESTING === 'true' ? undefined : ["src/migration/postgres/**/*.ts"],
   migrationsTableName: "custom_migration_table",
   migrationsRun: true,
   logging: true,
   logger: "file",
   synchronize: true,
})



// function migrationDir() {
//    const production = process.env.PRODUCTION

//    if (production) {
//       return "build/migration/**/*.js"
//    } else {
//       return "src/migration/**/*.ts"
//    }
// }
