import "dotenv/config"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
   type: process.env.DB_IDENTIFIER as "mysql" || "mysql",
   host: process.env.DB_HOST,
   port: Number(process.env.DB_MYSQL_PORT),
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   migrations: process.env.TESTING === 'true' ? undefined : [migrationDir()],
   migrationsTableName: "custom_migration_table",
   migrationsRun: true,
   timezone: "+07:00",
   logging: true,
   logger: "file",
})

function migrationDir() {
   const production = process.env.PRODUCTION

   if (production) {
      return "build/migration/**/*.js"
   } else {
      return "src/migration/**/*.ts"
   }
}
