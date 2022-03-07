const SupplyChainUser = artifacts.require("SupplyChainUser");
const SupplyChainStorage = artifacts.require("SupplyChainStorage");

const _name = "John Quevedo";
const _contactNo = "0979081091";
const _role = "FARMER";
const _isActive = true;
const _profileHash = "Qmadp4L61MaQQX5NFfjqaihnY8r7PmogqZL6wvX1HqwL";

contract("SupplyChainUser", function (accounts) {
	const spenderAddress = accounts[0];
	const userAddress = accounts[1];

	beforeEach(async () => {
		this.storageContract = await SupplyChainStorage.new({
			from: spenderAddress,
			gas: 6000000,
		});
		this.userContract = await SupplyChainUser.new(
			this.storageContract.address,
			{ from: spenderAddress, gas: 2000000 }
		);

		await this.storageContract.authorizeCaller(this.userContract.address, {
			from: spenderAddress,
		});
	});

	it("should Add/Update New User", async () => {
		const { logs } = await this.userContract.updateUser(
			_name,
			_contactNo,
			_role,
			_isActive,
			_profileHash,
			{ from: userAddress }
		);

		checkUserExists(logs, function (result) {
			console.log(result);
		});

		const user = await this.userContract.getUser.call(userAddress);

		checkUserData(user, function (result) {
			console.log(result);
		});
	});

	it("should Add/Update New User from Admin", async () => {
		const { logs } = await this.userContract.updateUserForAdmin(
			userAddress,
			_name,
			_contactNo,
			_role,
			_isActive,
			_profileHash,
			{ from: spenderAddress }
		);

		checkUserExists(logs, function (result) {
			console.log(result);
		});

		const user = await this.userContract.getUser.call(userAddress);

		checkUserData(user, function (result) {
			console.log(result);
		});
	});

	it("should all Get User Details", async () => {
		const { logs } = await this.userContract.updateUserForAdmin(
			userAddress,
			_name,
			_contactNo,
			_role,
			_isActive,
			_profileHash,
			{ from: spenderAddress }
		);

		checkUserExists(logs, function (result) {
			console.log(result);
		});

		const user = await this.userContract.getUser.call(userAddress);

		checkUserData(user, function (result) {
			console.log(result);
		});
	});
});

function checkUserExists(logs, callback) {
	const updateUserEvent = logs.find((e) => e.event === "UserUpdate");
	assert.exists(updateUserEvent, "UserUpdate does not exists");

	const updateUserRoleEvent = logs.find((e) => e.event == "UserRoleUpdate");
	assert.exists(updateUserRoleEvent, "UserRoleUpdate does not exists");

	callback(true);
}

function checkUserData(user, callback) {
	assert.equal(user[0], _name, "Name checked:");
	assert.equal(user[1], _contactNo, "Contact No checked:");
	assert.equal(user[2], _role, "Role checked:");
	assert.equal(user[3], _isActive, "isActive checked:");
	assert.equal(user[4], _profileHash, "Profile Hash checked:");
	assert.isTrue(true);

	callback(true);
}
