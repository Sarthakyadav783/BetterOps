import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(import.meta.dir, ".env") })
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prismaClient = new PrismaClient({ adapter })
export { prismaClient }