const SupplyChainStorage2 = artifacts.require("SupplyChainStorage2");
const SupplyChainStorage = artifacts.require("SupplyChainStorage");

contract("SupplyChainStorage2", function (accounts) {
	const spenderAddress = accounts[0];
	const authorizedCaller = accounts[1];

	beforeEach(async () => {
		this.storageContract = await SupplyChainStorage.new({
			from: spenderAddress,
			gas: 6000000,
		});
		this.storageContract2 = await SupplyChainStorage2.new(
			this.storageContract.address,
			{ from: spenderAddress, gas: 6000000 }
		);

		await this.storageContract.authorizeCaller(this.storageContract2.address, {
			from: spenderAddress,
		});
	});

	it("should Authorize", async () => {
		const { logs } = await this.storageContract2.authorizeCaller(
			authorizedCaller,
			{ from: spenderAddress }
		);

		const authorizedCallerEvent = logs.find(
			(e) => e.event === "AuthorizedCaller"
		);
		assert.exists(authorizedCallerEvent, "AuthorizedCaller does not exist");
	});

	it("should DeAuthorize", async () => {
		const { logs } = await this.storageContract2.deAuthorizeCaller(
			authorizedCaller,
			{ from: spenderAddress }
		);

		const deAuthorizeCallerEvent = logs.find(
			(e) => e.event === "DeAuthorizedCaller"
		);
		assert.exists(deAuthorizeCallerEvent, "DeAuthorizedCaller does not exist");
	});
});
