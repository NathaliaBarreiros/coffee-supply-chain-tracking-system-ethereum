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
		// Despliegue del contrato SupplyChainStorage
		.deploy(SupplyChainStorage)
		// Despliegue del contrato SupplyChainStorage2 con la dirección del contrato desplegado SupplyChainStorage
		.then(() => {
			return deployer.deploy(SupplyChainStorage2, SupplyChainStorage.address);
		})
		// Despliegue del contrato CoffeeSupplyChain con la dirección del contrato desplegado SupplyChainStorage
		.then(() => {
			return deployer.deploy(CoffeeSupplyChain, SupplyChainStorage.address);
		})
		// Despliegue del contrato SupplyChainStorage2 con las direcciones de los contratos
		// desplegados SupplyChainStorage y SupplyChainStorage2
		.then(() => {
			return deployer.deploy(
				CoffeeSupplyChain2,
				SupplyChainStorage.address,
				SupplyChainStorage2.address
			);
		})
		// Despliegue del contrato SupplyChainUser con la dirección del contrato desplegado SupplyChainStorage
		.then(() => {
			return deployer.deploy(SupplyChainUser, SupplyChainStorage.address);
		})
		// Una vez desplegado el contrato SupplyChainStorage, se autoriza la llamada de los otros contratos
		// empleando su dirección de contrato como argumento de la función de autorización
		.then(() => {
			return SupplyChainStorage.deployed();
		})
		.then(async function (instance) {
			await instance.authorizeCaller(SupplyChainStorage2.address);
			await instance.authorizeCaller(CoffeeSupplyChain.address);
			await instance.authorizeCaller(CoffeeSupplyChain2.address);
			await instance.authorizeCaller(SupplyChainUser.address);
			return instance;
		})
		// Una vez desplegado el contrato SupplyChainStorage2, se autoriza la llamada del contrato CoffeeSupplyChain2
		// empleando su dirección de contrato como argumento de la función de autorización
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
