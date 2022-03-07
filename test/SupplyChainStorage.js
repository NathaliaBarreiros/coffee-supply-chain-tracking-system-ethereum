const SupplyChainStorage = artifacts.require("SupplyChainStorage");

const _name = "John Quevedo";
const _contactNo = "0979081091";
const _role = "FARMER";
const _isActive = true;
const _profileHash = "Qmadp4L61MaQQX5NFfjqaihnY8r7PmogqZL6wvX1HqwL";

contract("SupplyChainStorage", function (accounts) {
	const spenderAddress = accounts[0];
	const authorizedCaller = accounts[1];
	const userAddress = accounts[2];

	beforeEach(async () => {
		this.storageContract = await SupplyChainStorage.new({
			from: spenderAddress,
			gas: 6000000,
		});
	});

	it("should Authorize", async () => {
		const { logs } = await this.storageContract.authorizeCaller(
			authorizedCaller,
			{ from: spenderAddress }
		);

		const authorizedCallerEvent = logs.find(
			(e) => e.event === "AuthorizedCaller"
		);
		assert.exists(authorizedCallerEvent, "AuthorizedCaller does not exists");
		// console.log(authorizedCallerEvent);
	});

	it("should DeAuthorize", async () => {
		const { logs } = await this.storageContract.deAuthorizeCaller(
			authorizedCaller,
			{ from: spenderAddress }
		);

		const deAuthorizeCallerEvent = logs.find(
			(e) => e.event === "DeAuthorizedCaller"
		);
		assert.exists(deAuthorizeCallerEvent, "DeAuthorizedCaller does not exists");
		// console.log(deAuthorizeCallerEvent);
	});

	it("should Add New User", async () => {
		const { logs } = await this.storageContract.setUser(
			userAddress,
			_name,
			_contactNo,
			_role,
			_isActive,
			_profileHash
		);

		const updateUserEvent = logs.find((e) => e.event === "UserUpdate");
		assert.exists(updateUserEvent, "UserUpdate does not exists");

		const updateUserRoleEvent = logs.find((e) => e.event === "UserRoleUpdate");
		assert.exists(updateUserRoleEvent, "UserRoleUpdate does not exists");

		const user = await this.storageContract.getUser.call(userAddress);

		//expect(_contactNo).to.equal(user[1]);
		assert.equal(user[0], _name, "Name checked:");
		assert.equal(user[1], _contactNo, "Contact No checked:");
		assert.equal(user[2], _role, "Role checked:");
		assert.equal(user[3], _isActive, "isActive checked:");
		assert.equal(user[4], _profileHash, "Profile Hash checked:");
	});
});
