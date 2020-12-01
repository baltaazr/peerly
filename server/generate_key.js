const fs = require('fs');
const PeerId = require('peer-id');

module.exports = async () => {
  const id = await PeerId.create({ bits: 2048, keyType: 'rsa' });

  fs.writeFileSync('peer-id.json', JSON.stringify(id.toJSON(), null, 2));
};
