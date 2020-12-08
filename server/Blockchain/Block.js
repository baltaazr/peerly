const crypto = require('crypto');

class Block {
  constructor(index, transactions, previous_hash, miner = null, nonce = 0) {
    this.index = index;
    this.transactions = transactions;
    this.previous_hash = previous_hash;
    this.timestamp = new Date().getTime() / 1000;
    this.miner = miner;
    this.nonce = nonce;
  }

  compute_hash() {
    // A function that returns the hash of the block contents
    const block_string = JSON.stringify(this);
    const digest = crypto
      .createHash('sha256')
      .update(block_string)
      .digest('hex');
    return digest;
  }

  get json() {
    return JSON.stringify(this);
  }

  load_block({ index, transactions, previous_hash, timestamp, miner, nonce }) {
    this.index = index;
    this.transactions = transactions;
    this.previous_hash = previous_hash;
    this.timestamp = timestamp;
    this.miner = miner;
    this.nonce = nonce;
  }
}

module.exports = Block;
