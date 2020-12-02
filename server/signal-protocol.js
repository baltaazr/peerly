const pipe = require('it-pipe');

const PROTOCOL = '/signal/1.0.0';

const handler = async ({ connection, stream }, io) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        io.emit('rtc', {
          id: connection.remotePeer.toB58String(),
          signal: message
        });
      }
    });

    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
};

const send = async (message, stream) => {
  try {
    await pipe([message], stream, async (source) => {});
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  PROTOCOL,
  handler,
  send
};
