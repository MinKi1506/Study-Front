const HDWalletProvider = require('@truffle/hdwallet-provider');

const NETWORK_ID = '1001'; //1001 = 클레이튼의 test넷 network id
const GASLIMIT = '8500000';

const URL = 'https://api.baobab.klaytn.net:8651';
const PRIVATE_KEY = '0x3d54228003bf9a4d3e5c18dbb108e8e4dd6518a49cdb3c6480879b7061aa46dc';

module.exports = {
  network : {
    bapbab : {
      provider : () => new HDWalletProvider(PRIVATE_KEY, URL),
      network_id : NETWORK_ID,
      gas :GASLIMIT,
      pasPrise : null
    }
  }
}