//SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./SupplyChainStorage.sol";
import "./Ownable.sol";

contract CoffeeSupplyChain is Ownable {
    event SetFarmDetails(address indexed user, address indexed batchNo);
    event DoneHarvesting(address indexed user, address indexed batchNo);
    event DoneProcessing(address indexed user, address indexed batchNo);
    event DoneTasting(address indexed user, address indexed batchNo);
    event DoneCoffeeSelling(address indexed user, address indexed batchNo);

    modifier isValidPerformer(address batchNo, string memory role) {
        require(
            keccak256(
                abi.encodePacked(supplyChainStorage.getNextAction(batchNo))
            ) == keccak256(abi.encodePacked(role)),
            "NEXT ACTION AND ROLE DO NOT MATCH!"
        );

        bool status = false;

        for (
            uint256 i = 0;
            i < supplyChainStorage.getUserRoles(msg.sender).length;
            i++
        ) {
            status =
                status ||
                keccak256(
                    abi.encodePacked(
                        supplyChainStorage.getUserRoles(msg.sender)[i]
                    )
                ) ==
                keccak256(abi.encodePacked(role));
        }

        if (!status) {
            require(status, "THERE IS NO ROLE MATCHING!");
        }

        _;
    }

    SupplyChainStorage supplyChainStorage;

    constructor(address _supplyChainStorage) {
        supplyChainStorage = SupplyChainStorage(_supplyChainStorage);
    }

    function getNextAction(address _batchNo)
        public
        view
        returns (string memory action)
    {
        (action) = supplyChainStorage.getNextAction(_batchNo);
        return (action);
    }

    function getFarmDetails(address _batchNo)
        public
        view
        returns (
            string memory registrationNo,
            string memory farmName,
            string memory latitude,
            string memory longitude,
            string memory farmAddress
        )
    {
        (
            registrationNo,
            farmName,
            latitude,
            longitude,
            farmAddress
        ) = supplyChainStorage.getFarmDetails(_batchNo);
        return (registrationNo, farmName, latitude, longitude, farmAddress);
    }

    function addFarmDetails(
        string memory _registrationNo,
        string memory _farmName,
        string memory _latitude,
        string memory _longitude,
        string memory _farmAddress
    ) public onlyOwner returns (address) {
        address batchNo = supplyChainStorage.setFarmDetails(
            _registrationNo,
            _farmName,
            _latitude,
            _longitude,
            _farmAddress
        );

        emit SetFarmDetails(msg.sender, batchNo);

        return (batchNo);
    }

    function addHarvestData(
        address _batchNo,
        string memory _seedSupplier,
        string memory _typeOfSeed,
        string memory _coffeeFamily,
        string memory _fertilizerUsed,
        string memory _harvestDate,
        string memory _humidityPercentage,
        string memory _batchWeight
    ) public isValidPerformer(_batchNo, "FARMER") returns (bool) {
        bool status = supplyChainStorage.setHarvestData(
            _batchNo,
            _seedSupplier,
            _typeOfSeed,
            _coffeeFamily,
            _fertilizerUsed,
            _harvestDate,
            _humidityPercentage,
            _batchWeight
        );

        emit DoneHarvesting(msg.sender, _batchNo);

        return (status);
    }

    function getHarvestData(address _batchNo)
        public
        view
        returns (
            string memory seedSupplier,
            string memory typeOfSeed,
            string memory coffeeFamily,
            string memory fertilizerUsed,
            string memory harvestDate,
            string memory humidityPercentage,
            string memory batchWeight
        )
    {
        (
            seedSupplier,
            typeOfSeed,
            coffeeFamily,
            fertilizerUsed,
            harvestDate,
            humidityPercentage,
            batchWeight
        ) = supplyChainStorage.getHarvestData(_batchNo);

        return (
            seedSupplier,
            typeOfSeed,
            coffeeFamily,
            fertilizerUsed,
            harvestDate,
            humidityPercentage,
            batchWeight
        );
    }

    function addProcessData(
        address _batchNo,
        string[] memory _addressLatLngProcessor,
        string memory _typeOfDrying,
        string memory _humidityAfterDrying,
        string memory _roastImageHash,
        string[] memory _tempTypeRoast,
        string[] memory _roastMillDates,
        string memory _processorPricePerKilo,
        string memory _processBatchWeight
    ) public isValidPerformer(_batchNo, "PROCESSOR") returns (bool) {
        bool status = supplyChainStorage.setProcessData(
            _batchNo,
            _addressLatLngProcessor,
            _typeOfDrying,
            _humidityAfterDrying,
            _roastImageHash,
            _tempTypeRoast,
            _roastMillDates,
            _processorPricePerKilo,
            _processBatchWeight
        );

        emit DoneProcessing(msg.sender, _batchNo);

        return (status);
    }

    function getProcessData(address _batchNo)
        public
        view
        returns (
            string[] memory addressLatLngProcessor,
            string memory typeOfDrying,
            string memory humidityAfterDrying,
            string memory roastImageHash,
            string[] memory tempTypeRoast,
            string[] memory roastMillDates,
            string memory processorPricePerKilo,
            string memory processBatchWeight
        )
    {
        (
            addressLatLngProcessor,
            typeOfDrying,
            humidityAfterDrying,
            roastImageHash,
            tempTypeRoast,
            roastMillDates,
            processorPricePerKilo,
            processBatchWeight
        ) = supplyChainStorage.getProcessData(_batchNo);

        return (
            addressLatLngProcessor,
            typeOfDrying,
            humidityAfterDrying,
            roastImageHash,
            tempTypeRoast,
            roastMillDates,
            processorPricePerKilo,
            processBatchWeight
        );
    }

    function addTasteData(
        address _batchNo,
        string memory _tastingScore,
        string memory _tastingServicePrice
    ) public isValidPerformer(_batchNo, "TASTER") returns (bool) {
        bool status = supplyChainStorage.setTasteData(
            _batchNo,
            _tastingScore,
            _tastingServicePrice
        );

        emit DoneTasting(msg.sender, _batchNo);

        return (status);
    }

    function getTasteData(address _batchNo)
        public
        view
        returns (string memory tastingScore, string memory tastingServicePrice)
    {
        (tastingScore, tastingServicePrice) = supplyChainStorage.getTasteData(
            _batchNo
        );

        return (tastingScore, tastingServicePrice);
    }

    function addCoffeeSellData(
        address _batchNo,
        string memory _beanPricePerKilo
    ) public isValidPerformer(_batchNo, "SELLER") returns (bool) {
        bool status = supplyChainStorage.setCoffeeSellData(
            _batchNo,
            _beanPricePerKilo
        );

        emit DoneCoffeeSelling(msg.sender, _batchNo);

        return (status);
    }

    function getCoffeeSellData(address _batchNo)
        public
        view
        returns (string memory beanPricePerKilo)
    {
        (beanPricePerKilo) = supplyChainStorage.getCoffeeSellData(_batchNo);

        return (beanPricePerKilo);
    }
}
