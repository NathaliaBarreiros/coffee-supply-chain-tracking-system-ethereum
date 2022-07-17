const CoffeeSupplyChain = artifacts.require(
	"../contracts/CoffeeSupplyChain.sol"
);
const CoffeeSupplyChain2 = artifacts.require(
	"../contracts/CoffeeSupplyChain2.sol"
);
const SupplyChainUser = artifacts.require("SupplyChainUser");
const SupplyChainStorage = artifacts.require("SupplyChainStorage");
const SupplyChainStorage2 = artifacts.require("SupplyChainStorage2");

contract("CoffeeSupplyChain", function (accounts) {
	const authorizedCaller = accounts[0];
	const farmer = accounts[1];
	const processor = accounts[2];
	const taster = accounts[3];
	const warehouse = accounts[4];
	const shipperPacker = accounts[5];
	const packer = accounts[6];
	const shipperRetailer = accounts[7];
	const retailer = accounts[8];

	let _name = "Martha Granja";
	let _email = "farmertest@gmail.com";
	let _role = ["FARMER", "SELLER"];
	let _isActive = true;
	let _profileHash = "Sample Hash";

	let _registrationNo = "123456789";
	let _farmName = "Finca Santa Elena Fomento Pecuario";
	let _latitude = "0.08476656770458219";
	let _longitude = "-78.48462308297093";
	let _farmAddress = "37QM+GM2, Nanegalito";

	let _seedSupplier = "Municipio de Quito";
	let _typeOfSeed = "Arabica";
	let _coffeeFamily = "Rubiaceas";
	let _fertilizerUsed = "Orgánico";
	let _harvestDate = "10-08-2020";
	let _humidityPercentage = "34";
	let _batchWeight = "10000";

	beforeEach(async () => {
		this.supplyChainStorage = await SupplyChainStorage.new({
			from: authorizedCaller,
			gas: 6000000,
		});
		this.supplyChainStorage2 = await SupplyChainStorage2.new(
			this.supplyChainStorage.address,
			{
				from: authorizedCaller,
				gas: 6000000,
			}
		);
		this.coffeeSupplyChain = await CoffeeSupplyChain.new(
			this.supplyChainStorage.address,
			{ from: authorizedCaller, gas: 6000000 }
		);
		this.coffeeSupplyChain2 = await CoffeeSupplyChain2.new(
			this.supplyChainStorage.address,
			this.supplyChainStorage2.address,
			{ from: authorizedCaller, gas: 6000000 }
		);
		this.supplyChainUser = await SupplyChainUser.new(
			this.supplyChainStorage.address,
			{ from: authorizedCaller, gas: 2000000 }
		);
		await this.supplyChainStorage.authorizeCaller(
			this.coffeeSupplyChain.address,
			{ from: authorizedCaller }
		);
		await this.supplyChainStorage.authorizeCaller(
			this.supplyChainUser.address,
			{ from: authorizedCaller }
		);
		await this.supplyChainStorage.authorizeCaller(
			this.supplyChainStorage2.address,
			{ from: authorizedCaller }
		);
		await this.supplyChainStorage.authorizeCaller(
			this.coffeeSupplyChain2.address,
			{ from: authorizedCaller }
		);
		await this.supplyChainStorage2.authorizeCaller(
			this.coffeeSupplyChain2.address,
			{ from: authorizedCaller }
		);
	});

	async function prepareFarmer(contract) {
		_name = "Martha Granja";
		_email = "farmertest@gmail.com";
		_role = ["FARMER", "SELLER"];
		_isActive = true;
		_profileHash = "Sample Hash";

		return contract.updateUserForAdmin(
			farmer,
			_name,
			_email,
			_role,
			_isActive,
			_profileHash,
			{ from: authorizedCaller }
		);
	}

	async function addFarmBasicDetails(contract) {
		_registrationNo = "123456789";
		_farmName = "Finca Santa Elena Fomento Pecuario";
		_latitude = "0.08476656770458219";
		_longitude = "-78.48462308297093";
		_farmAddress = "37QM+GM2, Nanegalito";

		return contract.addFarmDetails(
			_registrationNo,
			_farmName,
			_latitude,
			_longitude,
			_farmAddress,
			{ from: authorizedCaller }
		);
	}

	async function addHarvestData(contract, batchNo) {
		_seedSupplier = "Munipalidad de Quito";
		_typeOfSeed = "Arabica";
		_coffeeFamily = "Rubiaceas";
		_fertilizerUsed = "Orgánico";
		_harvestDate = "10-08-2020";
		_humidityPercentage = "34";
		_batchWeight = "10000";

		return contract.addHarvestData(
			batchNo,
			_seedSupplier,
			_typeOfSeed,
			_coffeeFamily,
			_fertilizerUsed,
			_harvestDate,
			_humidityPercentage,
			_batchWeight,
			{ from: farmer }
		);
	}

	describe("Cultivation Activities", () => {
		it("should add warehouse data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			var { logs } = await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const warehouseEvent = logs.find((e) => e.event === "DoneWarehousing");
			assert.exists(warehouseEvent, "DoneWarehousing event does not exists");
		});

		it("should get warehouse data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const activityData =
				await this.coffeeSupplyChain2.getWarehousingData.call(batchNo, {
					from: warehouse,
				});

			assert.equal(
				activityData[0],
				_warehouseAddress,
				"Warehouse address checked:"
			);
			assert.equal(
				activityData[1],
				_warehouseArrivalDate,
				"Warehouse Arrival Date checked:"
			);
			assert.equal(
				activityData[2],
				_storagePricePerKiloPerTime,
				"Storage Price Per Kilo Per Time checked:"
			);
		});

		it("should add shipping to packer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			var { logs } = await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const shipPackerEvent = logs.find(
				(e) => e.event === "DoneShippingPacker"
			);
			assert.exists(shipPackerEvent, "DoneShippingPacker event does not exist");
		});

		it("should get shipping to packer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const activityData = await this.coffeeSupplyChain2.getShipPackerData.call(
				batchNo,
				{ from: shipperPacker }
			);

			assert.equal(
				activityData[0],
				_toPackerTransportType,
				"Transport type for shipping to packer checked:"
			);
			assert.exists(
				activityData[1],
				_warehousePickupDate,
				"Pickup date at warehouse checked:"
			);
			assert.exists(
				activityData[2],
				_toPackerShippingPrice,
				"Shipping to packer price checked:"
			);
		});

		it("should add packaging data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			var { logs } = await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const packEvent = logs.find((e) => e.event === "DonePackaging");
			assert.exists(packEvent, "DonePackaging event does not exist");
		});

		it("should get packaging data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			var { logs } = await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const activityData = await this.coffeeSupplyChain2.getPackData.call(
				batchNo,
				{ from: packer }
			);

			assert.equal(activityData[0], _packerAddress, "Packer address checked:");
			assert.equal(
				activityData[1],
				_packerArrivalDate,
				"Arrival date at packer checked:"
			);
			assert.equal(activityData[2], _packingDate, "Packaging date checked:");
			assert.equal(
				activityData[3],
				_packingPricePerKilo,
				"Packaging price per kilo checked:"
			);
		});

		it("should add shipping to retailer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ricardo Moreno";
			_email = "sretailertest@gmail.com";
			_role = ["SHIPPER_RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperRetailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const _toRetailerTransportType = "Camión";
			const _packerPickupDate = "05-10-2020";
			const _toReatilerShippingPrice = "50";

			var { logs } = await this.coffeeSupplyChain2.addShipRetailerData(
				batchNo,
				_toRetailerTransportType,
				_packerPickupDate,
				_toReatilerShippingPrice,
				{ from: shipperRetailer }
			);

			const shipRetailerEvent = logs.find(
				(e) => e.event === "DoneShippingRetailer"
			);
			assert.exists(
				shipRetailerEvent,
				"DoneShippingRetailer event does not exist"
			);
		});

		it("should get shipping to retailer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ricardo Moreno";
			_email = "sretailertest@gmail.com";
			_role = ["SHIPPER_RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperRetailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const _toRetailerTransportType = "Camión";
			const _packerPickupDate = "05-10-2020";
			const _toReatilerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipRetailerData(
				batchNo,
				_toRetailerTransportType,
				_packerPickupDate,
				_toReatilerShippingPrice,
				{ from: shipperRetailer }
			);

			const activityData =
				await this.coffeeSupplyChain2.getShipRetailerData.call(batchNo, {
					from: shipperRetailer,
				});

			assert.equal(
				activityData[0],
				_toRetailerTransportType,
				"Transport type for shipping to retailer checked:"
			);
			assert.equal(
				activityData[1],
				_packerPickupDate,
				"Pickup date at packer checked:"
			);
			assert.equal(
				activityData[2],
				_toReatilerShippingPrice,
				"Shipping to retailer price checked:"
			);
		});

		it("should add retailer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ricardo Moreno";
			_email = "sretailertest@gmail.com";
			_role = ["SHIPPER_RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperRetailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Sandra Sandoval";
			_email = "retailertest@gmail.com";
			_role = ["RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				retailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const _toRetailerTransportType = "Camión";
			const _packerPickupDate = "05-10-2020";
			const _toReatilerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipRetailerData(
				batchNo,
				_toRetailerTransportType,
				_packerPickupDate,
				_toReatilerShippingPrice,
				{ from: shipperRetailer }
			);

			const _warehouseSalepointArrivalDate = ["08-10-2020", "10-10-2020"];
			const _warehouseRetailerName = "La Favorita";
			const _salepointRetailerName = "Supermaxi de La América";
			const _warehouseRetailerAddress = "Av Gral Enriquez";
			const _salepointRetailerAddress =
				"Gaspar de Carvajal s/n y, Av. la Gasca, Quito 170521";
			const _toSalepointTransportType = "Camión";
			const _toSalepointShippingPrice = "30";
			const _retailerPricePerKilo = "15";

			var { logs } = await this.coffeeSupplyChain2.addRetailerData(
				batchNo,
				_warehouseSalepointArrivalDate,
				_warehouseRetailerAddress,
				_salepointRetailerAddress,
				_warehouseRetailerName,
				_salepointRetailerName,
				_toSalepointTransportType,
				_toSalepointShippingPrice,
				_retailerPricePerKilo,
				{ from: retailer }
			);

			const retailerEvent = logs.find((e) => e.event === "DoneRetailer");
			assert.exists(retailerEvent, "DoneRetailer event does not exists");
		});

		it("should get retailer data", async () => {
			_name = "Santiago Endara";
			_email = "processortest@gmail.com";
			_role = ["PROCESSOR"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				processor,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ernesto Villacis";
			_email = "tastertest@gmail.com";
			_role = ["TASTER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				taster,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Carmen Buitron";
			_email = "warehousetest@gmail.com";
			_role = ["WAREHOUSE"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				warehouse,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Manuel Utreras";
			_email = "spackertest@gmail.com";
			_role = ["SHIPPER_PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperPacker,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Pamela Feder";
			_email = "packertest@gmail.com";
			_role = ["PACKER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				packer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Ricardo Moreno";
			_email = "sretailertest@gmail.com";
			_role = ["SHIPPER_RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				shipperRetailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			_name = "Sandra Sandoval";
			_email = "retailertest@gmail.com";
			_role = ["RETAILER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				retailer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_processorAddress,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const _tastingScore = "85";
			const _tastingServicePrice = "500";

			await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const _warehouseAddress =
				"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
			const _warehouseArrivalDate = "10-09-2020";
			const _storagePricePerKiloPerTime = "100";

			await this.coffeeSupplyChain2.addWarehousingData(
				batchNo,
				_warehouseAddress,
				_warehouseArrivalDate,
				_storagePricePerKiloPerTime,
				{ from: warehouse }
			);

			const _toPackerTransportType = "Camión";
			const _warehousePickupDate = "24-09-2020";
			const _toPackerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipPackerData(
				batchNo,
				_toPackerTransportType,
				_warehousePickupDate,
				_toPackerShippingPrice,
				{ from: shipperPacker }
			);

			const _packerAddress =
				"Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
			const _packerArrivalDate = "26-09-2020";
			const _packingDate = "30-09-20202";
			const _packingPricePerKilo = "100";

			await this.coffeeSupplyChain2.addPackData(
				batchNo,
				_packerAddress,
				_packerArrivalDate,
				_packingDate,
				_packingPricePerKilo,
				{ from: packer }
			);

			const _toRetailerTransportType = "Camión";
			const _packerPickupDate = "05-10-2020";
			const _toReatilerShippingPrice = "50";

			await this.coffeeSupplyChain2.addShipRetailerData(
				batchNo,
				_toRetailerTransportType,
				_packerPickupDate,
				_toReatilerShippingPrice,
				{ from: shipperRetailer }
			);

			const _warehouseSalepointArrivalDate = ["08-10-2020", "10-10-2020"];
			const _warehouseRetailerName = "La Favorita";
			const _salepointRetailerName = "Supermaxi de La América";
			const _warehouseRetailerAddress = "Av Gral Enriquez";
			const _salepointRetailerAddress =
				"Gaspar de Carvajal s/n y, Av. la Gasca, Quito 170521";
			const _toSalepointTransportType = "Camión";
			const _toSalepointShippingPrice = "30";
			const _retailerPricePerKilo = "15";

			await this.coffeeSupplyChain2.addRetailerData(
				batchNo,
				_warehouseSalepointArrivalDate,
				_warehouseRetailerAddress,
				_salepointRetailerAddress,
				_warehouseRetailerName,
				_salepointRetailerName,
				_toSalepointTransportType,
				_toSalepointShippingPrice,
				_retailerPricePerKilo,
				{ from: retailer }
			);

			const activityData = await this.coffeeSupplyChain2.getRetailerData.call(
				batchNo,
				{ from: retailer }
			);

			for (let i = 0; i < activityData[0].length; i++) {
				assert.equal(
					activityData[0][i],
					_warehouseSalepointArrivalDate[i],
					"Arrival date at warehouse and arrival date at salepoint checked: "
				);
			}

			assert.equal(
				activityData[1],
				_warehouseRetailerAddress,
				"Warehouse Retailer Name checked:"
			);
			assert.equal(
				activityData[2],
				_salepointRetailerAddress,
				"salepoint Retailer Name checked:"
			);
			assert.equal(
				activityData[3],
				_warehouseRetailerName,
				"Warehouse address checked:"
			);
			assert.equal(
				activityData[4],
				_salepointRetailerName,
				"Salepoint address checked:"
			);
			assert.equal(
				activityData[5],
				_toSalepointTransportType,
				"To Salepoint Transport Type checked:"
			);
			assert.equal(
				activityData[6],
				_toSalepointShippingPrice,
				"To Salepoint Shipping Price checked:"
			);
			assert.equal(
				activityData[7],
				_retailerPricePerKilo,
				"Retailer Price Per Kilo checked:"
			);
		});
	});
});
