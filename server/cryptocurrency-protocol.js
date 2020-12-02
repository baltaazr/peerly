const pipe = require('it-pipe');
const chalk = require('chalk');
const PeerId = require('peer-id');
const NodeRSA = require('node-rsa');

const Blockchain = require('./Blockchain/Blockchain');
const read_blockchain = require('./Blockchain/read_blockchain');
const write_blockchain = require('./Blockchain/write_blockchain');

const log = console.log;
const error = console.error;

const LEDGER_PROTOCOL = '/cryptocurrency/ledger/1.0.0';

const ledger_handler = async ({ stream }, io) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        const blockchain = new Blockchain();
        blockchain.load_chain(JSON.parse(String(message)));
        const result = blockchain.check_chain_validity();
        const currentBlockchain = read_blockchain();
        if (
          result &&
          blockchain.chain.length > currentBlockchain.chain.length
        ) {
          write_blockchain(blockchain);
          log(chalk.yellowBright('📒  New ledger loaded!'));
          io.emit('notification', 'New ledger loaded!');
          //TO DO: Add mechanism to stop mining if in progress
        }
      }
    });

    await pipe([], stream);
  } catch (err) {
    error(err);
  }
};

const ledger_send = async (message, stream) => {
  try {
    await pipe([message], stream, async () => {
      log(chalk.yellowBright('📒  Ledger sent!'));
    });
  } catch (err) {
    error(err);
  }
};

const TRANSACTION_PROTOCOL = '/cryptocurrency/transaction/1.0.0';

const transaction_handler = async ({ connection, stream }, io) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        const transaction = JSON.parse(String(message));
        try {
          if (transaction.sender.id !== connection.remotePeer.toB58String())
            throw Error();

          PeerId.createFromJSON(transaction.sender);

          const rsa = {
            n: Buffer.from(connection.remotePeer.pubKey._key.n, 'base64'),
            e: Buffer.from(connection.remotePeer.pubKey._key.e, 'base64')
          };
          const key = new NodeRSA();
          key.importKey(rsa, 'components-public');

          const content = { ...transaction };
          delete content.signature;

          if (
            !key.verify(
              JSON.stringify(content),
              Buffer.from(transaction.signature)
            )
          )
            throw Error();

          const blockchain = read_blockchain();
          blockchain.add_new_transaction(transaction);
          write_blockchain(blockchain);
          log(chalk.yellowBright('💸  New transaction loaded!'));
          io.emit('notification', 'New transaction loaded!');
        } catch (err) {
          log(chalk.red('Error loading transaction!'));
        }
      }
    });

    await pipe([], stream);
  } catch (err) {
    error(err);
  }
};

const transaction_send = async (message, stream) => {
  try {
    await pipe([message], stream, async () => {
      const blockchain = read_blockchain();
      blockchain.add_new_transaction(JSON.parse(String(message)));
      write_blockchain(blockchain);
      log(chalk.yellowBright('💸  Transaction sent!'));
    });
  } catch (err) {
    error(err);
  }
};

module.exports = {
  ledger: {
    PROTOCOL: LEDGER_PROTOCOL,
    handler: ledger_handler,
    send: ledger_send
  },
  transaction: {
    PROTOCOL: TRANSACTION_PROTOCOL,
    handler: transaction_handler,
    send: transaction_send
  }
};
