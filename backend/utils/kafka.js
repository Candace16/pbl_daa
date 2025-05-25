const { Kafka } = require("kafkajs")

let kafka
let producer
let consumer

const initializeKafka = async () => {
  try {
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || "bookmyshow-backend",
      brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    })

    producer = kafka.producer()
    consumer = kafka.consumer({ groupId: "bookmyshow-group" })

    await producer.connect()
    await consumer.connect()

    // Subscribe to topics
    await consumer.subscribe({ topic: "seat-updates" })
    await consumer.subscribe({ topic: "booking-updates" })
    await consumer.subscribe({ topic: "payment-updates" })

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString())
        console.log(`Received message from ${topic}:`, data)

        // Handle different message types
        switch (topic) {
          case "seat-updates":
            await handleSeatUpdate(data)
            break
          case "booking-updates":
            await handleBookingUpdate(data)
            break
          case "payment-updates":
            await handlePaymentUpdate(data)
            break
        }
      },
    })

    console.log("Kafka initialized successfully")
  } catch (error) {
    console.error("Kafka initialization failed:", error)
  }
}

const publishToKafka = async (topic, message) => {
  try {
    if (!producer) {
      throw new Error("Kafka producer not initialized")
    }

    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    })
  } catch (error) {
    console.error("Failed to publish to Kafka:", error)
  }
}

const handleSeatUpdate = async (data) => {
  // Handle seat update logic
  console.log("Processing seat update:", data)
}

const handleBookingUpdate = async (data) => {
  // Handle booking update logic
  console.log("Processing booking update:", data)
}

const handlePaymentUpdate = async (data) => {
  // Handle payment update logic
  console.log("Processing payment update:", data)
}

module.exports = {
  initializeKafka,
  publishToKafka,
  getKafka: () => kafka,
  getProducer: () => producer,
  getConsumer: () => consumer,
}
