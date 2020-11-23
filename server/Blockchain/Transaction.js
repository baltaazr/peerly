const NodeRSA = require('node-rsa');

class Transaction {
  constructor(sender, receiver, amount) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
  }

  get json() {
    return JSON.stringify(this);
  }

  sign(privKey) {
    const key = new NodeRSA(privKey);
    const signature = key.sign(this.json);
    this.signature = signature;
  }
}

module.exports = Transaction;
