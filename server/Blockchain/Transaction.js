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
    const rsa = {
      n: Buffer.from(privKey.n, 'base64'),
      e: Buffer.from(privKey.e, 'base64'),
      d: Buffer.from(privKey.d, 'base64'),
      p: Buffer.from(privKey.p, 'base64'),
      q: Buffer.from(privKey.q, 'base64'),
      dmp1: Buffer.from(privKey.dp, 'base64'),
      dmq1: Buffer.from(privKey.dq, 'base64'),
      coeff: Buffer.from(privKey.qi, 'base64')
    };

    const key = new NodeRSA();
    key.importKey(rsa, 'components');
    const signature = key.sign(this.json);
    this.signature = signature;
  }
}

module.exports = Transaction;
