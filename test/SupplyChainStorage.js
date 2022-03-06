const SupplyChainStorage = artifacts.require('SupplyChainStorage');
// const assert = require('chai').assert;

const _name = 'Ram';
const _contactNo = '0979081091';
const _role = 'FARMER';
const _isActive = true;
const _profileHash = 'Qmadp4L61MaQQX5NFfjqaihnY8r7PmogqZL6wvX1HqwL';

contract('SupplyChainStorage', function(accounts){
    const spenderAddress = accounts[0];
    const authorizedCaller = accounts[1];
    const userAddress = accounts[2];

    beforeEach(async() => {
        this.storageContract = await SupplyChainStorage.new({from:spenderAddress, gas: 6000000});
    });

    it('should Authorize', async() => {
        const {logs} = await this.storageContract.authorizeCaller(authorizedCaller,{from: spenderAddress});

        const authorizedCallerEvent = logs.find(e => e.event === 'AuthorizedCaller');
        assert.exists(authorizedCallerEvent, "AuthorizedCaller does not exists");
        // console.log(authorizedCallerEvent);
    });

    it('should DeAuthorize', async() => {
        const {logs} = await this.storageContract.deAuthorizeCaller(authorizedCaller, {from: spenderAddress});

        const deAuthorizeCallerEvent = logs.find(e => e.event === 'DeAuthorizedCaller');
        assert.exists(deAuthorizeCallerEvent, "DeAuthorizedCaller does not exists");
        // console.log(deAuthorizeCallerEvent);
    });

    it('should Add/Update New User', async() => {
        const {logs} = await this.storageContract.setUser(userAddress,_name, _contactNo, _role, _isActive, _profileHash, {from: spenderAddress});

        console.log(typeof(logs));
        checkUserExists(logs, function(result){
            console.log(result);
        });

        const user = await this.storageContract.getUser(userAddress, {from: spenderAddress});
        // console.log("Here")
        // console.log(typeof(user));
        // console.log(user[0]);
        console.log(user[0]);

        // checkUserData(user, function(result){
        //     console.log("checkUserData");
        // });
    });
})

function checkUserExists(logs, callback) {
    const updateUserEvent = logs.find(e => e.event === 'UserUpdate');
    assert.exists(updateUserEvent, "UserUpdate does not exists");

    const updateUserRoleEvent = logs.find(e => e.event === 'UserRoleUpdate');
    assert.exists(updateUserRoleEvent, "UserRoleUpdate does not exists");

    callback(true);
}

function checkUserData(user, callback){
    assert.equal(user[0],_name,"Name checked:");
    assert.equal(user[1],_contactNo,"Contact No checked:");
    assert.equal(user[2],_role,"Role checked:");
    assert.equal(user[3],_isActive,"isActive checked:");
    assert.equal(user[4],_profileHash,"Profile Hash checked:");
    assert.isTrue(true);

    callback(true);
}
