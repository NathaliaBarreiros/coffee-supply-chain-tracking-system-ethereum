const HDWalletProvider = require("@truffle/hdwallet-provider");
const { env } = require("process");
require("dotenv").config();

module.exports = {
	networks: {
		ganache: {
			host: "localhost",
			port: 7545,
			gas: 6000000,
			network_id: "*",
		},
		ropsten: {
			provider: () =>
				new HDWalletProvider(
					env.MNEMONIC,
					`https://ropsten.infura.io/v3/${env.PROJECT_ID}`
				),
			network_id: 3,
			gas: 6500000,
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
		},
	},
	compilers: {
		solc: {
			version: "0.8.7",
		},
	},
};
