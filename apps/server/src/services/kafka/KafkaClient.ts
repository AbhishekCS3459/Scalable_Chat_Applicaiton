import { Kafka, Producer, Consumer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "../PrismaService/prisma";
require("dotenv").config();
class KafkaConfig {
  private static kafkaInstance: KafkaConfig;
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  private constructor() {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_HOST || "Enter your kafka host here"],
      ssl: {
        ca: [fs.readFileSync(path.resolve(__dirname, "./ca.pem"), "utf-8")],
      },
      sasl: {
        username: process.env.KAFKA_USERNAME || "avnadmin",
        password: process.env.KAFKA_PASSWORD || "AVNS_ma2MAwQw91NL2oP2usK",
        mechanism: "plain",
      },
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "my-group" });
  }

  public static getInstance(): KafkaConfig {
    if (!KafkaConfig.kafkaInstance) {
      KafkaConfig.kafkaInstance = new KafkaConfig();
    }
    return KafkaConfig.kafkaInstance;
  }

  public async produce(topic: string, messages: string): Promise<boolean> {
    await this.producer.connect();
    console.log("connected to kafka producer 🟢🟢");
    await this.producer.send({
      topic,
      messages: [{ key: `message-${Date.now()}`, value: messages }],
    });
    console.log("send message in topic", topic);
    await this.producer.disconnect();
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  public async consume(topic: string): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: topic, fromBeginning: true });
    console.log("listening kafka topic", topic);
    await this.consumer.run({
      autoCommit: true,
      partitionsConsumedConcurrently: 1,
      autoCommitInterval: 100,
      eachMessage: async ({ message, pause }) => {
        try {
          await prismaClient.messages.create({
            data: {
              Text: message.value?.toString() || "",
            },
          });
          console.log("saved message", message.value?.toString());
        } catch (error) {
          pause();
          console.log("something is worng with kafka consumer");
          setTimeout(() => {
            this.consumer.resume([{ topic: topic }]);
          }, 60 * 1000);
        }

        // await this.consumer.disconnect();
      },
    });
  }

  public async make_topics(
    topics: string[],
    numPartitions: number
  ): Promise<boolean> {
    await this.kafka.admin().createTopics({
      topics: [{ topic: "MESSAGES", numPartitions: numPartitions }],
    });
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
}

export default KafkaConfig;
