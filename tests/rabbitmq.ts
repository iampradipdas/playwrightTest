import amqp from 'amqplib';
export async function publishToQueue(queueName: string, data: any) {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672"); // RabbitMQ URL
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    const jsonData = JSON.stringify(data);

    channel.sendToQueue(queueName, Buffer.from(jsonData), {
        persistent: true
    });

    console.log("Message sent:", jsonData);

    await channel.close();
    await connection.close();
}
