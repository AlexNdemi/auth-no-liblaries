import { env } from "@/data/env/server"
import { Redis } from "ioredis"

export const redisClient = new Redis(env.REDIS_URL)
