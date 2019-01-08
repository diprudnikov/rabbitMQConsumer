'use strict';

const https = require('https');
const amqp = require('amqplib/callback_api');
const AMPQ_URL = 'amqp://zwousfrg:7wkM11gLX4gYjNGYMRtpcsJqzwHW3YUp@shark.rmq.cloudamqp.com/zwousfrg';
const LAMBDA_URL = 'https://f8vl0p1by3.execute-api.us-east-2.amazonaws.com/default/myFunction';
const QUEUE_NAME = 'Hello World Queue';

const options = {
    headers: {
        "Content-Type": "application/json",
    },
    method: 'POST',
};

amqp.connect(AMPQ_URL, (err, connection) => {
    connection.createChannel((err, channel) => {

        channel.assertQueue(QUEUE_NAME, { durable: false });

        console.log(`Waiting for messages in ${QUEUE_NAME}`);

        channel.consume(QUEUE_NAME, (message) => {
            console.log(`Received ${message.content.toString()}`);
            const data = message.content.toString();

            const req = createHttpsRequest();
            req.on('error', (err) => {
                console.log(err.message);
            });
            req.write(JSON.stringify(data));
            req.end();
        }, { noAck: true });
    });
});

function createHttpsRequest() {
    return https.request(LAMBDA_URL, options, (res) => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        }).on('end', () => {
            console.log(`Message from lambda: ${JSON.parse(data)}`);
        }).on('error', (err) => {
            console.log(err.message);
        });
    });
}