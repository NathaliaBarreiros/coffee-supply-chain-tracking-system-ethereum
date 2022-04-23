const HDWalletProvider = require("@truffle/hdwallet-provider");
const { env } = require("process");
require("dotenv").config();
const my_address = "0x9E733B413600444663EF0FFd8116A279D8C07D7D";

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
		rinkeby: {
			provider: () =>
				new HDWalletProvider(
					env.MNEMONIC_2,
					`https://rinkeby.infura.io/v3/${env.PROJECT_ID}`
				),
			network_id: 4,
			gas: 6500000,
			confirmations: 2,
			timeoutBlocks: 200,
			skipDryRun: true,
			from: my_address,
		},
	},
	compilers: {
		solc: {
			version: "0.8.9",
		},
	},
	plugins: ["truffle-plugin-verify"],
	api_keys: {
		etherscan: `${env.MY_API_KEY}`,
	},
};
