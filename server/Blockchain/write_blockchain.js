const fs = require('fs');

module.exports = (blockchain) => {
  fs.writeFileSync('./server/Blockchain/ledger.json', blockchain.json);
};
