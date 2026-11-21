const { createClient } = require("redis");

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on("error", (error) => {
    console.log("Redis bağlantı hatası:", error.message);
});

module.exports = redisClient;