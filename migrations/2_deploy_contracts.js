const SupplyChainStorage = artifacts.require(
	"../contracts/SupplyChainStorage.sol"
);
const SupplyChainStorage2 = artifacts.require(
	"../contracts/SupplyChainStorage2.sol"
);
const CoffeeSupplyChain = artifacts.require(
	"../contracts/CoffeeSupplyChain.sol"
);
const CoffeeSupplyChain2 = artifacts.require(
	"../contracts/CoffeeSupplyChain2.sol"
);
const SupplyChainUser = artifacts.require("../contracts/SupplyChainUser.sol");

module.exports = function (deployer) {
	deployer
		.deploy(SupplyChainStorage)

		.then(() => {
			return deployer.deploy(SupplyChainStorage2, SupplyChainStorage.address);
		})
		.then(() => {
			return deployer.deploy(CoffeeSupplyChain, SupplyChainStorage.address);
		})
		.then(() => {
			return deployer.deploy(
				CoffeeSupplyChain2,
				SupplyChainStorage.address,
				SupplyChainStorage2.address
			);
		})

		.then(() => {
			return deployer.deploy(SupplyChainUser, SupplyChainStorage.address);
		})
		.then(() => {
			return SupplyChainStorage.deployed();
		})
		.then(async function (instance) {
			// await instance.authorizeCaller(SupplyChainUser.address);
			await instance.authorizeCaller(SupplyChainStorage2.address);
			await instance.authorizeCaller(CoffeeSupplyChain.address);
			await instance.authorizeCaller(CoffeeSupplyChain2.address);

			return instance;
		})
		.then(() => {
			return SupplyChainStorage2.deployed();
		})
		.then(async function (instance) {
			await instance.authorizeCaller(CoffeeSupplyChain2.address);
		})

		.catch(function (error) {
			console.log(error);
		});
};

// module.exports = function (deployer) {
// 	deployer
// 		.deploy(SupplyChainStorage2)
// 		.then(() => {
// 			return deployer.deploy(CoffeeSupplyChain2, SupplyChainStorage2.address);
// 		})
// 		.then(() => {
// 			return SupplyChainStorage2.deployed();
// 		})
// 		.then(async function (instance) {
// 			await instance.authorizeCaller(CoffeeSupplyChain2.address);
// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 		});
// };
