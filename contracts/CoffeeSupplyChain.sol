//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./SupplyChainStorage.sol";
import "./Ownable.sol";

contract CoffeeSupplyChain is Ownable {
    event SetFarmDetails(address indexed user, address indexed batchNo);
    event DoneHarvesting(address indexed user, address indexed batchNo);
    event DoneProcessing(address indexed user, address indexed batchNo);
    event SetGrainData(address indexed user, address indexed batchNo);
    event DoneAgglomeration(address indexed user, address indexed batchNo);
    event DoneShippingPacker(address indexed user, address indexed batchNo);
    event DonePackaging(address indexed user, address indexed batchNo);
    event DoneShippingRetailer(address indexed user, address indexed batchNo);
    event DoneRetailer(address indexed user, address indexed batchNo);

    modifier isValidPerformer(address batchNo, string memory role) {
        require(
            keccak256(
                abi.encodePacked(supplyChainStorage.getUserRole(msg.sender))
            ) == keccak256(abi.encodePacked(role))
        );
        require(
            keccak256(
                abi.encodePacked(supplyChainStorage.getNextAction(batchNo))
            ) == keccak256(abi.encodePacked(role))
        );
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
        string memory _coffeeFamily,
        string memory _typeOfSeed,
        string memory _fertilizerUsed,
        string memory _harvestDate
    ) public isValidPerformer(_batchNo, "AGRICULTOR/PRODUCTOR") returns (bool) {
        bool status = supplyChainStorage.setHarvestData(
            _batchNo,
            _coffeeFamily,
            _typeOfSeed,
            _fertilizerUsed,
            _harvestDate
        );

        emit DoneHarvesting(msg.sender, _batchNo);

        return (status);
    }

    function getHarvestData(address _batchNo)
        public
        view
        returns (
            string memory coffeeFamily,
            string memory typeOfSeed,
            string memory fertilizerUsed,
            string memory harvestDate
        )
    {
        (
            coffeeFamily,
            typeOfSeed,
            fertilizerUsed,
            harvestDate
        ) = supplyChainStorage.getHarvestData(_batchNo);

        return (coffeeFamily, typeOfSeed, fertilizerUsed, harvestDate);
    }

    function addProcessData(
        address _batchNo,
        string memory _procAddress,
        string memory _typeOfDrying,
        string memory _roastImageHash,
        string memory _roastTemp,
        string memory _typeOfRoast,
        string memory _roastDate,
        string memory _millDate,
        uint256 _processorPrice
    ) public isValidPerformer(_batchNo, "PROCESADOR") returns (bool) {
        bool status = supplyChainStorage.setProcessData(
            _batchNo,
            _procAddress,
            _typeOfDrying,
            _roastImageHash,
            _roastTemp,
            _typeOfRoast,
            _roastDate,
            _millDate,
            _processorPrice
        );

        emit DoneProcessing(msg.sender, _batchNo);

        return (status);
    }

    function getProcessData(address _batchNo)
        public
        view
        returns (
            string memory procAddress,
            string memory typeOfDrying,
            string memory roastImageHash,
            string memory roastTemp,
            string memory typeOfRoast,
            string memory roastDate,
            string memory millDate,
            uint256 processorPrice
        )
    {
        (
            procAddress,
            typeOfDrying,
            roastImageHash,
            roastTemp,
            typeOfRoast,
            roastDate,
            millDate,
            processorPrice
        ) = supplyChainStorage.getProcessData(_batchNo);

        return (
            procAddress,
            typeOfDrying,
            roastImageHash,
            roastTemp,
            typeOfRoast,
            roastDate,
            millDate,
            processorPrice
        );
    }

    function addGrainData(
        address _batchNo,
        uint256 _tasteScore,
        uint256 _grainPrice
    )
        public
        isValidPerformer(_batchNo, "INSPECTOR DE GRANO/AGRICULTOR")
        returns (bool)
    {
        bool status = supplyChainStorage.setGrainData(
            _batchNo,
            _tasteScore,
            _grainPrice
        );

        emit SetGrainData(msg.sender, _batchNo);

        return (status);
    }

    function getGrainData(address _batchNo)
        public
        view
        returns (uint256 tasteScore, uint256 grainPrice)
    {
        (tasteScore, grainPrice) = supplyChainStorage.getGrainData(_batchNo);

        return (tasteScore, grainPrice);
    }

    function addAgglomData(
        address _batchNo,
        string memory _agglomAddress,
        string memory _agglomDate,
        uint256 _storagePrice
    ) public isValidPerformer(_batchNo, "AGLOMERADOR") returns (bool) {
        bool status = supplyChainStorage.setAgglomData(
            _batchNo,
            _agglomAddress,
            _agglomDate,
            _storagePrice
        );

        emit DoneAgglomeration(msg.sender, _batchNo);

        return (status);
    }

    function getAgglomData(address _batchNo)
        public
        view
        returns (
            string memory agglomAddress,
            string memory agglomDate,
            uint256 storagePrice
        )
    {
        (agglomAddress, agglomDate, storagePrice) = supplyChainStorage
            .getAgglomData(_batchNo);

        return (agglomAddress, agglomDate, storagePrice);
    }

    function addShipPackerData(
        address _batchNo,
        string memory _transportTypeP,
        string memory _pickupDateP,
        uint256 _shipPriceP
    )
        public
        isValidPerformer(_batchNo, "TRANSPORTISTA A EMPACADORA")
        returns (bool)
    {
        bool status = supplyChainStorage.setShipPackerData(
            _batchNo,
            _transportTypeP,
            _pickupDateP,
            _shipPriceP
        );

        emit DoneShippingPacker(msg.sender, _batchNo);

        return (status);
    }

    function getShipPackerData(address _batchNo)
        public
        view
        returns (
            string memory transportTypeP,
            string memory pickupDateP,
            uint256 shipPriceP
        )
    {
        (transportTypeP, pickupDateP, shipPriceP) = supplyChainStorage
            .getShipPackerData(_batchNo);

        return (transportTypeP, pickupDateP, shipPriceP);
    }

    function addPackData(
        address _batchNo,
        string memory _packAddress,
        string memory _arrivalDateP,
        string memory _packDate,
        uint256 _packPrice
    ) public isValidPerformer(_batchNo, "EMPACADORA") returns (bool) {
        bool status = supplyChainStorage.setPackData(
            _batchNo,
            _packAddress,
            _arrivalDateP,
            _packDate,
            _packPrice
        );

        emit DonePackaging(msg.sender, _batchNo);

        return (status);
    }

    function getPackData(address _batchNo)
        public
        view
        returns (
            string memory packAddress,
            string memory arrivalDateP,
            string memory packDate,
            uint256 packPrice
        )
    {
        (packAddress, arrivalDateP, packDate, packPrice) = supplyChainStorage
            .getPackData(_batchNo);

        return (packAddress, arrivalDateP, packDate, packPrice);
    }

    function addShipRetailerData(
        address _batchNo,
        string memory _transportTypeR,
        string memory _pickupDateR,
        uint256 _shipPriceR
    )
        public
        isValidPerformer(_batchNo, "TRANSPORTISTA A RETAILER")
        returns (bool)
    {
        bool status = supplyChainStorage.setShipRetailerData(
            _batchNo,
            _transportTypeR,
            _pickupDateR,
            _shipPriceR
        );

        emit DoneShippingRetailer(msg.sender, _batchNo);

        return (status);
    }

    function getShipRetailerData(address _batchNo)
        public
        view
        returns (
            string memory transportTypeR,
            string memory pickupDateR,
            uint256 shipPriceR
        )
    {
        (transportTypeR, pickupDateR, shipPriceR) = supplyChainStorage
            .getShipRetailerData(_batchNo);

        return (transportTypeR, pickupDateR, shipPriceR);
    }

    function addRetailerData(
        address _batchNo,
        string memory _arrivalDateW,
        string memory _arrivalDateSP,
        string memory _warehouseName,
        string memory _warehouseAddress,
        string memory _salePointAddress,
        uint256 _shipPriceSP,
        uint256 _productPrice
    ) public isValidPerformer(_batchNo, "RETAILER") returns (bool) {
        bool status = supplyChainStorage.setRetailerData(
            _batchNo,
            _arrivalDateW,
            _arrivalDateSP,
            _warehouseName,
            _warehouseAddress,
            _salePointAddress,
            _shipPriceSP,
            _productPrice
        );

        emit DoneRetailer(msg.sender, _batchNo);

        return (status);
    }

    function getRetailerData(address _batchNo)
        public
        view
        returns (
            string memory arrivalDateW,
            string memory arrivalDateSP,
            string memory warehouseName,
            string memory warehouseAddress,
            string memory salePointAddress,
            uint256 shipPriceSP,
            uint256 productPrice
        )
    {
        (
            arrivalDateW,
            arrivalDateSP,
            warehouseName,
            warehouseAddress,
            salePointAddress,
            shipPriceSP,
            productPrice
        ) = supplyChainStorage.getRetailerData(_batchNo);

        return (
            arrivalDateW,
            arrivalDateSP,
            warehouseName,
            warehouseAddress,
            salePointAddress,
            shipPriceSP,
            productPrice
        );
    }
}
