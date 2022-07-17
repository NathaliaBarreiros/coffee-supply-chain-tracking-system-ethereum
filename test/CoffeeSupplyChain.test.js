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
	// const warehouse = accounts[5];
	// const packer = accounts[6];
	// const shipperRetailer = accounts[7];
	// const retailer = accounts[8];

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

			const _processorAddress = "37QM+GM2, Nanegalito";
			const _typeOfDrying = "Artesanal";
			const _humidityAfterDrying = "18";
			const _roastImageHash = "0x40op09";
			const _tempTypeRoast = ["34", "Tueste medio"];
			const _roastMillDate = ["15-08-2020", "16-08-2020"];
			const _processorPricePerKilo = "250";
			const _processBatchWeight = "30";

			// string processorAddress;
			// string typeOfDrying;
			// string humidityAfterDrying;
			// string roastImageHash;
			// string[] tempTypeRoast;
			// string[] roastMillDates;
			// string processorPricePerKilo;
			// string processBatchWeight;

			var { logs } = await this.coffeeSupplyChain.addProcessData(
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

			const activityData = await this.coffeeSupplyChain.getProcessData.call(
				batchNo,
				{ from: processor }
			);

			assert.equal(
				activityData[0],
				_processorAddress,
				"Processor address checked:"
			);
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

			var { logs } = await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const tastingEvent = logs.find((e) => e.event === "DoneTasting");
			assert.exists(tastingEvent, "DoneTasting event does not exist");

			const _beanPricePerKilo = "50";

			var { logs } = await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
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

			var { logs } = await this.coffeeSupplyChain.addTasteData(
				batchNo,
				_tastingScore,
				_tastingServicePrice,
				{ from: taster }
			);

			const tastingEvent = logs.find((e) => e.event === "DoneTasting");
			assert.exists(tastingEvent, "DoneTasting event does not exist");

			const _beanPricePerKilo = "50";

			await this.coffeeSupplyChain.addCoffeeSellData(
				batchNo,
				_beanPricePerKilo,
				{ from: farmer }
			);

			const activityData = await this.coffeeSupplyChain.getCoffeeSellData.call(
				batchNo,
				{ from: farmer }
			);

			assert.equal(
				activityData,
				_beanPricePerKilo,
				"Bean Price Per Kilo checked:"
			);
		});
		// it("should add agglomeration data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	var { logs } = await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const agglomerationEvent = logs.find(
		// 		(e) => e.event === "DoneAgglomeration"
		// 	);
		// 	assert.exists(
		// 		agglomerationEvent,
		// 		"DoneAgglomeration event does not exists"
		// 	);
		// });

		// it("should get agglomeration data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const activityData = await this.coffeeSupplyChain.getAgglomData.call(
		// 		batchNo,
		// 		{ from: agglomerator }
		// 	);

		// 	assert.equal(
		// 		activityData[0],
		// 		_agglomAddress,
		// 		"Agglomerator address checked:"
		// 	);
		// 	assert.equal(activityData[1], _agglomDate, "Agglomeration date checked:");
		// 	assert.equal(activityData[2], _storagePrice, "Storage price checked:");
		// });

		// it("should add shipping to packer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	var { logs } = await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const shipPackerEvent = logs.find(
		// 		(e) => e.event === "DoneShippingPacker"
		// 	);
		// 	assert.exists(
		// 		shipPackerEvent,
		// 		"DoneShippingPacker event does not exists"
		// 	);
		// });

		// it("should get shipping to packer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const activityData = await this.coffeeSupplyChain.getShipPackerData.call(
		// 		batchNo,
		// 		{ from: shipperPacker }
		// 	);

		// 	assert.equal(
		// 		activityData[0],
		// 		_transportTypeP,
		// 		"Transport type for shipping to packer checked:"
		// 	);
		// 	assert.exists(
		// 		activityData[1],
		// 		_pickupDateP,
		// 		"Pickup date at agglomerator checked:"
		// 	);
		// 	assert.exists(
		// 		activityData[2],
		// 		_shipPriceP,
		// 		"Shipping to packer price checked:"
		// 	);
		// });

		// it("should add packaging data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "packertest@gmail.com";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	var { logs } = await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const packEvent = logs.find((e) => e.event === "DonePackaging");
		// 	assert.exists(packEvent, "DonePackaging event does not exists");
		// });

		// it("should get packaging data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "packertest@gmail.com";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	var { logs } = await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const activityData = await this.coffeeSupplyChain.getPackData.call(
		// 		batchNo,
		// 		{ from: packer }
		// 	);

		// 	assert.equal(activityData[0], _packAddress, "Packer address checked:");
		// 	assert.equal(
		// 		activityData[1],
		// 		_arrivalDateP,
		// 		"Arrival date at packer checked:"
		// 	);
		// 	assert.equal(activityData[2], _packDate, "Packaging date checked:");
		// 	assert.equal(activityData[3], _packPrice, "Packaging price checked:");
		// });

		// it("should add shipping to retailer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "packertest@gmail.com";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ricardo Moreno";
		// 	_email = "sretailertest@gmail.com";
		// 	_role = "TRANSPORTISTA A RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperRetailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const _transportTypeR = "Camion";
		// 	const _pickupDateR = "05-10-2020";
		// 	const _shipPriceR = 50;

		// 	var { logs } = await this.coffeeSupplyChain.addShipRetailerData(
		// 		batchNo,
		// 		_transportTypeR,
		// 		_pickupDateR,
		// 		_shipPriceR,
		// 		{ from: shipperRetailer }
		// 	);

		// 	const shipRetailerEvent = logs.find(
		// 		(e) => e.event === "DoneShippingRetailer"
		// 	);
		// 	assert.exists(
		// 		shipRetailerEvent,
		// 		"DoneShippingRetailer event does not exists"
		// 	);
		// });

		// it("should get shipping to retailer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "packertest@gmail.com";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ricardo Moreno";
		// 	_email = "sretailertest@gmail.com";
		// 	_role = "TRANSPORTISTA A RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperRetailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const _transportTypeR = "Camion";
		// 	const _pickupDateR = "05-10-2020";
		// 	const _shipPriceR = 50;

		// 	await this.coffeeSupplyChain.addShipRetailerData(
		// 		batchNo,
		// 		_transportTypeR,
		// 		_pickupDateR,
		// 		_shipPriceR,
		// 		{ from: shipperRetailer }
		// 	);

		// 	const activityData =
		// 		await this.coffeeSupplyChain.getShipRetailerData.call(batchNo, {
		// 			from: shipperRetailer,
		// 		});

		// 	assert.equal(
		// 		activityData[0],
		// 		_transportTypeR,
		// 		"Transport type for shipping to retailer checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[1],
		// 		_pickupDateR,
		// 		"Pickup date at packer checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[2],
		// 		_shipPriceR,
		// 		"Shipping to retailer price checked:"
		// 	);
		// });

		// it("should add retailer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "agglomeratortest@gmail.com";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "spackertest@gmail.com";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "packertest@gmail.com";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ricardo Moreno";
		// 	_email = "sretailertest@gmail.com";
		// 	_role = "TRANSPORTISTA A RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperRetailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Sandra Sandoval";
		// 	_email = "retailertest@gmail.com";
		// 	_role = "RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		retailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const _transportTypeR = "Camion";
		// 	const _pickupDateR = "05-10-2020";
		// 	const _shipPriceR = 50;

		// 	await this.coffeeSupplyChain.addShipRetailerData(
		// 		batchNo,
		// 		_transportTypeR,
		// 		_pickupDateR,
		// 		_shipPriceR,
		// 		{ from: shipperRetailer }
		// 	);

		// 	const _arrivalDateW = "08-10-2020";
		// 	const _arrivalDateSP = "10-10-2020";
		// 	const _warehouseName = "La Favorita";
		// 	const _warehouseAddress = "Av Gral Enriquez";
		// 	const _salePointAddress =
		// 		"Gaspar de Carvajal s/n y, Av. la Gasca, Quito 170521";
		// 	const _shipPriceSP = 30;
		// 	const _productPrice = 5;

		// 	var { logs } = await this.coffeeSupplyChain.addRetailerData(
		// 		batchNo,
		// 		_arrivalDateW,
		// 		_arrivalDateSP,
		// 		_warehouseName,
		// 		_warehouseAddress,
		// 		_salePointAddress,
		// 		_shipPriceSP,
		// 		_productPrice,
		// 		{ from: retailer }
		// 	);

		// 	const retailerEvent = logs.find((e) => e.event === "DoneRetailer");
		// 	assert.exists(retailerEvent, "DoneRetailer event does not exists");
		// });

		// it("should get retailer data", async () => {
		// 	_name = "Santiago Endara";
		// 	_email = "processortest@gmail.com";
		// 	_role = "PROCESADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		processor,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ernesto Villacis";
		// 	_email = "ginspectortest@gmail.com";
		// 	_role = "INSPECTOR DE GRANO/AGRICULTOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		grainInspector,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Carmen Buitron";
		// 	_email = "0967854734";
		// 	_role = "AGLOMERADOR";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		agglomerator,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Manuel Utreras";
		// 	_email = "0934765345";
		// 	_role = "TRANSPORTISTA A EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperPacker,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Pamela Feder";
		// 	_email = "0956876456";
		// 	_role = "EMPACADORA";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		packer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Ricardo Moreno";
		// 	_email = "0934568231";
		// 	_role = "TRANSPORTISTA A RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		shipperRetailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	_name = "Sandra Sandoval";
		// 	_email = "0979065456";
		// 	_role = "RETAILER";
		// 	_isActive = true;
		// 	_profileHash = "Sample Hash";

		// 	await this.supplyChainUser.updateUserForAdmin(
		// 		retailer,
		// 		_name,
		// 		_email,
		// 		_role,
		// 		_isActive,
		// 		_profileHash,
		// 		{ from: authorizedCaller }
		// 	);

		// 	await prepareFarmer(this.supplyChainUser);

		// 	var { logs } = await addFarmBasicDetails(this.coffeeSupplyChain);

		// 	const farmDetailsEvent = logs.find((e) => e.event === "SetFarmDetails");
		// 	batchNo = farmDetailsEvent.args.batchNo;

		// 	await addHarvestData(this.coffeeSupplyChain, batchNo);

		// 	const _procAddress = "37QM+GM2, Nanegalito";
		// 	const _typeOfDrying = "Artesanal";
		// 	const _roastImageHash = "0x40op09";
		// 	const _roastTemp = "34";
		// 	const _typeOfRoast = "Rubio";
		// 	const _roastDate = "15-08-2020";
		// 	const _millDate = "16-08-2020";
		// 	const _processorPrice = 250;

		// 	await this.coffeeSupplyChain.addProcessData(
		// 		batchNo,
		// 		_procAddress,
		// 		_typeOfDrying,
		// 		_roastImageHash,
		// 		_roastTemp,
		// 		_typeOfRoast,
		// 		_roastDate,
		// 		_millDate,
		// 		_processorPrice,
		// 		{ from: processor }
		// 	);

		// 	const _tasteScore = 85;
		// 	const _grainPrice = 500;

		// 	await this.coffeeSupplyChain.addGrainData(
		// 		batchNo,
		// 		_tasteScore,
		// 		_grainPrice,
		// 		{ from: grainInspector }
		// 	);

		// 	const _agglomAddress =
		// 		"17 DE JULIO Y JAIME ROLDOS 0.0228954,-78.893441, San Miguel de Los Bancos 171202";
		// 	const _agglomDate = "10-09-2020";
		// 	const _storagePrice = 100;

		// 	await this.coffeeSupplyChain.addAgglomData(
		// 		batchNo,
		// 		_agglomAddress,
		// 		_agglomDate,
		// 		_storagePrice,
		// 		{ from: agglomerator }
		// 	);

		// 	const _transportTypeP = "Camion";
		// 	const _pickupDateP = "24-09-2020";
		// 	const _shipPriceP = 50;

		// 	await this.coffeeSupplyChain.addShipPackerData(
		// 		batchNo,
		// 		_transportTypeP,
		// 		_pickupDateP,
		// 		_shipPriceP,
		// 		{ from: shipperPacker }
		// 	);

		// 	const _packAddress = "Av. Pichincha s/n, Pedro Vicente Maldonado 170850";
		// 	const _arrivalDateP = "26-09-2020";
		// 	const _packDate = "30-09-20202";
		// 	const _packPrice = 100;

		// 	await this.coffeeSupplyChain.addPackData(
		// 		batchNo,
		// 		_packAddress,
		// 		_arrivalDateP,
		// 		_packDate,
		// 		_packPrice,
		// 		{ from: packer }
		// 	);

		// 	const _transportTypeR = "Camion";
		// 	const _pickupDateR = "05-10-2020";
		// 	const _shipPriceR = 50;

		// 	await this.coffeeSupplyChain.addShipRetailerData(
		// 		batchNo,
		// 		_transportTypeR,
		// 		_pickupDateR,
		// 		_shipPriceR,
		// 		{ from: shipperRetailer }
		// 	);

		// 	const _arrivalDateW = "08-10-2020";
		// 	const _arrivalDateSP = "10-10-2020";
		// 	const _warehouseName = "La Favorita";
		// 	const _warehouseAddress = "Av Gral Enriquez";
		// 	const _salePointAddress =
		// 		"Gaspar de Carvajal s/n y, Av. la Gasca, Quito 170521";
		// 	const _shipPriceSP = 30;
		// 	const _productPrice = 5;

		// 	await this.coffeeSupplyChain.addRetailerData(
		// 		batchNo,
		// 		_arrivalDateW,
		// 		_arrivalDateSP,
		// 		_warehouseName,
		// 		_warehouseAddress,
		// 		_salePointAddress,
		// 		_shipPriceSP,
		// 		_productPrice,
		// 		{ from: retailer }
		// 	);

		// 	const activityData = await this.coffeeSupplyChain.getRetailerData.call(
		// 		batchNo,
		// 		{ from: retailer }
		// 	);

		// 	assert.equal(
		// 		activityData[0],
		// 		_arrivalDateW,
		// 		"Arrival date at warehouse checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[1],
		// 		_arrivalDateSP,
		// 		"Arrival date at final sale point checked:"
		// 	);
		// 	assert.equal(activityData[2], _warehouseName, "Warehouse name checked:");
		// 	assert.equal(
		// 		activityData[3],
		// 		_warehouseAddress,
		// 		"Warehouse address checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[4],
		// 		_salePointAddress,
		// 		"Final sale point address checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[5],
		// 		_shipPriceSP,
		// 		"Shipping at final sale point price checked:"
		// 	);
		// 	assert.equal(
		// 		activityData[6],
		// 		_productPrice,
		// 		"Final product price at sale point checked:"
		// 	);
		// });
	});
});
