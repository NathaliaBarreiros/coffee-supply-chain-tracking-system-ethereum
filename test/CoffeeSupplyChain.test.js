const CoffeeSupplyChain = artifacts.require(
	"../contracts/CoffeeSupplyChain.sol"
);
const SupplyChainUser = artifacts.require("SupplyChainUser");
const SupplyChainStorage = artifacts.require("SupplyChainStorage");

contract("CoffeeSupplyChain", function (accounts) {
	const authorizedCaller = accounts[0];
	const farmer = accounts[1];
	const processor = accounts[2];
	const taster = accounts[3];
	const seller = accounts[4];

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
		this.coffeeSupplyChain = await CoffeeSupplyChain.new(
			this.supplyChainStorage.address,
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
		_seedSupplier = "Municipalidad de Quito";
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

	describe("Coffee Supply Chain Activities", () => {
		// var batchNo = false;

		it("should add farm details", async () => {
			const { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const event = logs.find((e) => e.event === "SetFarmDetails");
			assert.exists(event, "SetFarmDetails event does not exist");

			batchNo = event.args.batchNo;
		});

		it("should get farm details", async () => {
			const { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const event = logs.find((e) => e.event === "SetFarmDetails");

			batchNo = event.args.batchNo;

			const activityData = await this.coffeeSupplyChain.getFarmDetails.call(
				batchNo,
				{ from: authorizedCaller }
			);

			assert.equal(
				activityData[0],
				_registrationNo,
				"Registration No checked:"
			);
			assert.equal(activityData[1], _farmName, "Farm Name checked:");
			assert.equal(activityData[2], _latitude, "Latitude checked:");
			assert.equal(activityData[3], _longitude, "Longitude checked:");
			assert.equal(activityData[4], _farmAddress, "Farm Address checked:");
		});

		it("should add harvest data", async () => {
			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			var { logs } = await addHarvestData(this.coffeeSupplyChain, batchNo);

			const harvestEvent = logs.find((e) => e.event === "DoneHarvesting");
			assert.exists(harvestEvent, "DoneHarvesting event does not exist");
		});

		it("should get harvest data", async () => {
			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			// console.log("batchNo 2:", batchNo);
			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const activityData = await this.coffeeSupplyChain.getHarvestData.call(
				batchNo,
				{ from: farmer }
			);

			assert.equal(activityData[0], _seedSupplier, "Seed supplier checked:");
			assert.equal(activityData[1], _typeOfSeed, "Type of seed checked:");
			assert.equal(activityData[2], _coffeeFamily, "Coffee family checked:");
			assert.equal(
				activityData[3],
				_fertilizerUsed,
				"Fertilizer used checked:"
			);
			assert.equal(activityData[4], _harvestDate, "Harvest date checked:");
			assert.equal(
				activityData[5],
				_humidityPercentage,
				"Humidity Percentage checked:"
			);
			assert.equal(activityData[6], _batchWeight, "Batch Weight checked:");
		});

		it("should add process data", async () => {
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

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			var { logs } = await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const processEvent = logs.find((e) => e.event === "DoneProcessing");
			assert.exists(processEvent, "DoneProcessing event does not exist");
		});

		it("should get process data", async () => {
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

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
				_typeOfDrying,
				_humidityAfterDrying,
				_roastImageHash,
				_tempTypeRoast,
				_roastMillDate,
				_processorPricePerKilo,
				_processBatchWeight,
				{ from: processor }
			);

			const activityData = await this.coffeeSupplyChain.getProcessData.call(
				batchNo,
				{ from: processor }
			);

			for (let i = 0; i < activityData[0]; i++) {
				assert.equal(
					activityData[0][i],
					_addressLatLngProcessor[i],
					"Processor address, latitude & longitude checked: "
				);
			}
			assert.equal(activityData[1], _typeOfDrying, "Type of drying checked:");
			assert.equal(
				activityData[2],
				_humidityAfterDrying,
				"Humidity After Drying checked:"
			);
			assert.equal(
				activityData[3],
				_roastImageHash,
				"Roasting image hash checked:"
			);
			for (let i = 0; i < activityData[4]; i++) {
				assert.equal(
					activityData[4][i],
					_tempTypeRoast[i],
					"Roasting temperature & type of roasting checked: "
				);
			}
			for (let i = 0; i < activityData[5]; i++) {
				assert.equal(
					activityData[5][i],
					_roastMillDate[i],
					"Roast date & mill dates checked: "
				);
			}
			assert.equal(
				activityData[6],
				_processorPricePerKilo,
				"Processing price checked:"
			);
			assert.equal(
				activityData[7],
				_processBatchWeight,
				"Processing Batch Weight checked:"
			);
		});

		it("should add tasting data", async () => {
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

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
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

			var { logs } = await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const tastingEvent = logs.find((e) => e.event === "DoneTasting");
			assert.exists(tastingEvent, "DoneTasting event does not exist");
		});

		it("should get tasting data", async () => {
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

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
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

			const activityData = await this.coffeeSupplyChain.getTasteData.call(
				batchNo,
				{ from: taster }
			);

			assert.equal(activityData[0], _tastingScore, "Tasting score checked:");
			assert.equal(
				activityData[1],
				_tastingServicePrice,
				"Tasting Service Price checked:"
			);
		});

		it("should add coffee selling data", async () => {
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

			_name = "Martha Granja";
			_email = "farmertest@gmail.com";
			_role = ["FARMER", "SELLER"];
			_isActive = true;
			_profileHash = "Sample Hash";

			await this.supplyChainUser.updateUserForAdmin(
				farmer,
				_name,
				_email,
				_role,
				_isActive,
				_profileHash,
				{ from: authorizedCaller }
			);

			// await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
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

			var { logs } = await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const tastingEvent = logs.find((e) => e.event === "DoneTasting");
			assert.exists(tastingEvent, "DoneTasting event does not exist");

			const _coffeeSellingBatchWeight = "30";
			const _beanPricePerKilo = "50";

			var { logs } = await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_coffeeSellingBatchWeight,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const sellingEvent = logs.find((e) => e.event === "DoneCoffeeSelling");
			assert.exists(sellingEvent, "DoneCoffeeSelling event does not exist");
		});

		it("should get coffee selling data", async () => {
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

			await prepareFarmer(this.supplyChainUser);

			var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

			const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
			batchNo = farmDetailsEvent.args.batchNo;

			await addHarvestData(this.coffeeSupplyChain, batchNo);

			const _addressLatLngProcessor = [
				"37QM+GM2, Nanegalito",
				"0.08899853404673483",
				"-78.71585940288742",
			];
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			await this.coffeeSupplyChain.addProcessData(
				batchNo,
				_addressLatLngProcessor,
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

			var { logs } = await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const tastingEvent = logs.find((e) => e.event === "DoneTasting");
			assert.exists(tastingEvent, "DoneTasting event does not exist");

			const _coffeeSellingBatchWeight = "30";
			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_coffeeSellingBatchWeight,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const activityData = await this.coffeeSupplyChain.getCoffeeSellData.call(
				batchNo,
				{ from: farmer }
			);

			assert.equal(
				activityData[0],
				_coffeeSellingBatchWeight,
				"Coffee Batch Selling Weight checked:"
			);

			assert.equal(
				activityData[1],
				_beanPricePerKilo,
				"Bean Price Per Kilo checked:"
			);
		});
	});
});
