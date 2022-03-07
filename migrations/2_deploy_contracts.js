var SupplyChainStorage = artifacts.require(
	"../contracts/SupplyChainStorage.sol"
);
var CoffeeSupplyChain = artifacts.require("../contracts/CoffeeSupplyChain.sol");
var SupplyChainUser = artifacts.require("../contracts/SupplyChainUser.sol");

module.exports = function (deployer) {
	deployer
		.deploy(SupplyChainStorage)
		.then(() => {
			return deployer.deploy(CoffeeSupplyChain, SupplyChainStorage.address);
		})
		.then(() => {
			return deployer.deploy(SupplyChainUser, SupplyChainStorage.address);
		})
		.then(() => {
			return SupplyChainStorage.deployed();
		})
		.then(async function (instance) {
			await instance.authorizeCaller(CoffeeSupplyChain.address);
			await instance.authorizeCaller(SupplyChainUser.address);
			return instance;
		})
		.catch(function (error) {
			console.log(error);
		});
};
