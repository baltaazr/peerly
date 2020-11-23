const pipe = require('it-pipe');

const PROTOCOL = '/signal/1.0.0';

const handler = async ({ connection, stream }) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        console.log(connection.remotePeer);
        console.info(
          `${connection.remotePeer.toB58String().slice(0, 8)}: ${String(
            message
          )}`
        );
      }
    });

    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
};

const send = async (message, stream) => {
  try {
    await pipe([message], stream, async (source) => {
      for await (const message of source) {
        console.info(`Me: ${String(message)}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  PROTOCOL,
  handler,
  send
};
