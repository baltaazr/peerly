const pipe = require('it-pipe');
const chalk = require('chalk');

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

const transaction_handler = async ({ stream }) => {
  try {
    await pipe(stream, async (source) => {
      for await (const message of source) {
        const blockchain = read_blockchain();
        blockchain.add_new_transaction(JSON.parse(String(message)));
        write_blockchain(blockchain);
        console.log(chalk.yellowBright('New transaction loaded!'));
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
