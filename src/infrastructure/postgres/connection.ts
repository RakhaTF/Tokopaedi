import { ShippingAddress, Users, DeliveryStatus, Log, OrderItem, Product, Transaction, TransactionStatus, UserGroup, UserGroupRules, UserRules } from "@domain/entity"
import "dotenv/config"
import DotenvFlow from "dotenv-flow"
import path from "path"
import { DataSource } from "typeorm"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

export const AppDataSource = new DataSource({
   type: 'postgres',
   host: process.env.POSTGRES_HOST,
   port: Number(process.env.POSTGRES_POST),
   username: process.env.POSTGRES_USER,
   password: process.env.POSTGRES_PASSWORD,
   database: process.env.POSTGRES_DB,
   migrations: process.env.TESTING === 'true' ? undefined : [migrationDir()],
   migrationsTableName: "custom_migration_table",
   migrationsRun: true,
   entities: [Users, ShippingAddress, DeliveryStatus, Log, OrderItem, Product, Transaction, TransactionStatus, UserGroup, UserGroupRules, UserRules],
   logging: true,
   logger: "file",
   synchronize: false,
})



function migrationDir() {
   const production = process.env.PRODUCTION

   if (production) {
      return "build/migration/**/*.js"
   } else {
      return "src/migration/**/*.ts"
   }
}
