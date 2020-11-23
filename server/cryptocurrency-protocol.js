const pipe = require('it-pipe');
const chalk = require('chalk');
const PeerId = require('peer-id');
const NodeRSA = require('node-rsa');

const Blockchain = require('./Blockchain/Blockchain');
const read_blockchain = require('./Blockchain/read_blockchain');
const write_blockchain = require('./Blockchain/write_blockchain');

const LEDGER_PROTOCOL = '/cryptocurrency/ledger/1.0.0';

const ledger_handler = async ({ stream }) => {
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
          console.log(chalk.yellowBright('New ledger loaded!'));
          //TO DO: Add mechanism to stop mining if in progress
        }
      }
    });

    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
};

const ledger_send = async (message, stream) => {
  try {
    await pipe([message], stream, async () => {
      console.log(chalk.yellowBright('Ledger sent!'));
    });
  } catch (err) {
    console.error(err);
  }
};

const TRANSACTION_PROTOCOL = '/cryptocurrency/transaction/1.0.0';

const transaction_handler = async ({ connection, stream }) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        const transaction = JSON.parse(String(message));
        try {
          if (transaction.sender.id !== connection.remotePeer.toJSON().id)
            throw Error();

          PeerId.createFromJSON(transaction.sender);

          const key = new NodeRSA(transaction.sender.pubKey);

          const content = [...transaction];
          delete content.signature;

          if (!key.verify(content, transaction.signature)) throw Error();

          const blockchain = read_blockchain();
          blockchain.add_new_transaction(transaction);
          write_blockchain(blockchain);
          console.log(chalk.yellowBright('New transaction loaded!'));
        } catch (err) {
          console.log(chalk.red('Error loading transaction!'));
        }
      }
    });

    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
};

const transaction_send = async (message, stream) => {
  try {
    await pipe([message], stream, async () => {
      console.log(chalk.yellowBright('Transaction sent!'));
    });
  } catch (err) {
    console.error(err);
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
