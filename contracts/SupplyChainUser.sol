//SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "./SupplyChainStorage.sol";
import "./Ownable.sol";

contract SupplyChainUser is Ownable {
    event UserUpdate(
        address indexed user,
        string name,
        string email,
        string[] role,
        bool isActive,
        string profileHash
    );
    event UserRoleUpdate(address indexed user, string[] role);

    SupplyChainStorage supplyChainStorage;

    constructor(address _supplyChainAddress) {
        supplyChainStorage = SupplyChainStorage(_supplyChainAddress);
    }

    function updateUser(
        string memory _name,
        string memory _email,
        bool _isActive,
        string memory _profileHash
    ) public returns (bool) {
        require(msg.sender != address(0));

        (, , string[] memory lastRole, , ) = supplyChainStorage.getUser(
            msg.sender
        );

        bool status = supplyChainStorage.setUser(
            msg.sender,
            _name,
            _email,
            lastRole,
            _isActive,
            _profileHash
        );

        emit UserUpdate(
            msg.sender,
            _name,
            _email,
            lastRole,
            _isActive,
            _profileHash
        );
        emit UserRoleUpdate(msg.sender, lastRole);

        return status;
    }

    function updateUserForAdmin(
        address _userAddress,
        string memory _name,
        string memory _email,
        string[] memory _role,
        bool _isActive,
        string memory _profileHash
    ) public onlyOwner returns (bool) {
        require(_userAddress != address(0));

        bool status = supplyChainStorage.setUser(
            _userAddress,
            _name,
            _email,
            _role,
            _isActive,
            _profileHash
        );

        emit UserUpdate(
            _userAddress,
            _name,
            _email,
            _role,
            _isActive,
            _profileHash
        );
        emit UserRoleUpdate(_userAddress, _role);

        return status;
    }

    function getUser(address _userAddress)
        public
        view
        returns (
            string memory name,
            string memory email,
            string[] memory role,
            bool isActive,
            string memory profileHash
        )
    {
        require(_userAddress != address(0));

        (name, email, role, isActive, profileHash) = supplyChainStorage.getUser(
            _userAddress
        );

        return (name, email, role, isActive, profileHash);
    }
}
