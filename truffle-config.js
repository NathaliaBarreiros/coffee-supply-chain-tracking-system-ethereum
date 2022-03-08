const HDWalletProvider = require("@truffle/hdwallet-provider");
const { env } = require("process");
require("dotenv").config();

module.exports = {
	networks: {
		ganache: {
			host: "localhost",
			port: 7545,
			gas: 6000000, //default gas limit
			network_id: "*", //Match any network id (connect to any network available on port 7545 of localhost)
		},
		ropsten: {
			provider: () =>
				new HDWalletProvider(
					env.MNEMONIC,
					`https://ropsten.infura.io/v3/${env.PROJECT_ID}`
				),
			network_id: 3, // Ropsten's id
			gas: 6500000, // Ropsten has a lower block limit than mainnet
			confirmations: 2, // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true,
		},
	},
	compilers: {
		solc: {
			version: "0.8.7",
		},
	},
};
