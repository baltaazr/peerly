const fs = require('fs');

module.exports = (blockchain) => {
  fs.writeFileSync('ledger.json', blockchain.json);
};
