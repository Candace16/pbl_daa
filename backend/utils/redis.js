const redis = require("redis")

let redisClient

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    })

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err)
    })

    redisClient.on("connect", () => {
      console.log("Connected to Redis")
    })

    await redisClient.connect()
  } catch (error) {
    console.error("Redis connection failed:", error)
  }
}

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized")
  }
  return redisClient
}

// Cache helper functions
const setCache = async (key, value, expireInSeconds = 3600) => {
  try {
    await redisClient.setEx(key, expireInSeconds, JSON.stringify(value))
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

const getCache = async (key) => {
  try {
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

const deleteCache = async (key) => {
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
}
