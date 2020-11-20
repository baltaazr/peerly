const fs = require('fs');

module.exports = (blockchain) => {
  fs.writeFile('ledger.json', blockchain.json, (err) => {
    if (err) throw err;
    console.log('Your blockchain has been saved.');
  });
};
