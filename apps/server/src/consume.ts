import KafkaConfig from "./services/kafka/KafkaClient";
export default async function MessageConsumer() {
  try {
    await KafkaConfig.getInstance().consume("MESSAGES");
    console.log("consuming messages..........")
  } catch (error) {
    console.log("error in subscriber", error);
  }
}
