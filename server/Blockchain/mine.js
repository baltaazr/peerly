const { parentPort } = require('worker_threads');
const chalk = require('chalk');

const read_blockchain = require('./read_blockchain');
const write_blockchain = require('./write_blockchain');

const log = console.log;

const blockchain = read_blockchain();
log(chalk.yellow('⛏  Mining...'));
blockchain.mine();
log(chalk.green('🧱  Block mined!'));
write_blockchain(blockchain);
parentPort.close();
