const Supplychain = artifacts.require('Supplychain');

const _name = 'Mat';
const _contactNo = '0979081091';
const _role = 'FARMER';
const _isActive = true;
const _profileHash = 'Qmadp4L61MaQQX5NFfjqaihnY8r7PmogqZL6wvX1HqwL';

contract('Supplychain', function(accounts){
    const spenderAddress = accounts[0];
    const userAddress = accounts[2];

    beforeEach(async() => {
        this.storageContract = await Supplychain.new({from:spenderAddress, gas: 6000000});
    });

    it('should Add New User', async() => {
        const {logs} = await this.storageContract.setUser(userAddress,_name, _contactNo, _role, _isActive, _profileHash, {from: spenderAddress});

        const updateUserEvent = logs.find(e => e.event === 'UserUpdate');
        assert.exists(updateUserEvent, "UserUpdate does not exists");
    
        const updateUserRoleEvent = logs.find(e => e.event === 'UserRoleUpdate');
        assert.exists(updateUserRoleEvent, "UserRoleUpdate does not exists");

        const user = await this.storageContract.getUser.call(userAddress);


        assert.equal(user[0],_name,"Name checked:");
    });
})