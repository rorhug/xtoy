import { enhancePrisma } from "blitz"
import { PrismaClient } from "@prisma/client"

const EnhancedPrisma = enhancePrisma(PrismaClient)

export * from "@prisma/client"
export default new EnhancedPrisma({
  log:
    process.env.NODE_ENV === "development"
      ? ["info", `warn`, `error`, "query"]
      : ["info", `warn`, `error`],
})
