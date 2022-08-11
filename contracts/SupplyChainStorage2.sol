//SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "./SupplyChainStorageOwnable.sol";
import "./SupplyChainStorage.sol";

contract SupplyChainStorage2 is SupplyChainStorageOwnable {
    SupplyChainStorage supplyChainStorage;

    constructor(address _supplyChainStorage) {
        authorizedCaller[msg.sender] = 1;
        emit AuthorizedCaller(msg.sender);
        supplyChainStorage = SupplyChainStorage(_supplyChainStorage);
    }

    event AuthorizedCaller(address caller);
    event DeAuthorizedCaller(address caller);

    modifier onlyAuthCaller() {
        require(authorizedCaller[msg.sender] == 1);
        _;
    }

    mapping(address => uint8) authorizedCaller;

    function authorizeCaller(address _caller) public onlyOwner returns (bool) {
        authorizedCaller[_caller] = 1;
        emit AuthorizedCaller(_caller);
        return true;
    }

    function deAuthorizeCaller(address _caller)
        public
        onlyOwner
        returns (bool)
    {
        authorizedCaller[_caller] = 0;
        emit DeAuthorizedCaller(_caller);
        return true;
    }

    struct Warehousing {
        string warehouseAddress;
        string[] latLngWarehouse;
        string warehouseArrivalDate;
        string storageTime;
        string storagePricePerKiloPerTime;
    }

    struct ShipToPacker {
        string toPackerTransportType;
        string warehousePickupDate;
        string toPackerShippingPrice;
    }

    struct Pack {
        string packerAddress;
        string[] latLngPacker;
        string packerArrivalDate;
        string packingDate;
        string packingPricePerKilo;
    }

    struct ShipToRetailer {
        string toRetailerTransportType;
        string packerPickupDate;
        string toReatilerShippingPrice;
    }

    struct Retailer {
        string[] warehouseSalepointArrivalDate;
        string warehouseRetailerName;
        string salepointRetailerName;
        string[] addressLatLngWarehouseRetailer;
        string[] addressLatLngSalepointRetailer;
        string toSalepointTransportType;
        string toSalepointShippingPrice;
        string retailerPricePerKilo;
    }

    mapping(address => Warehousing) batchWarehousing;
    mapping(address => ShipToPacker) batchShipToPacker;
    mapping(address => Pack) batchPack;
    mapping(address => ShipToRetailer) batchShipToRetailer;
    mapping(address => Retailer) batchRetailer;

    Warehousing warehousingData;
    ShipToPacker shipPackerData;
    Pack packData;
    ShipToRetailer shipRetailerData;
    Retailer retailerData;

    function setWarehousingData(
        address batchNo,
        string memory _warehouseAddress,
        string[] memory _latLngWarehouse,
        string memory _warehouseArrivalDate,
        string memory _storageTime,
        string memory _storagePricePerKiloPerTime
    ) public onlyAuthCaller returns (bool) {
        warehousingData.warehouseAddress = _warehouseAddress;
        warehousingData.latLngWarehouse = _latLngWarehouse;
        warehousingData.warehouseArrivalDate = _warehouseArrivalDate;
        warehousingData.storageTime = _storageTime;
        warehousingData
            .storagePricePerKiloPerTime = _storagePricePerKiloPerTime;

        batchWarehousing[batchNo] = warehousingData;
        bool status = supplyChainStorage.writeNextAction(
            batchNo,
            "SHIPPER_PACKER"
        );
        return (true && status);
    }

    function getWarehousingData(address batchNo)
        public
        view
        onlyAuthCaller
        returns (
            string memory warehouseAddress,
            string[] memory latLngWarehouse,
            string memory warehouseArrivalDate,
            string memory storageTime,
            string memory storagePricePerKiloPerTime
        )
    {
        Warehousing memory tmpData = batchWarehousing[batchNo];
        return (
            tmpData.warehouseAddress,
            tmpData.latLngWarehouse,
            tmpData.warehouseArrivalDate,
            tmpData.storageTime,
            tmpData.storagePricePerKiloPerTime
        );
    }

    function setShipPackerData(
        address batchNo,
        string memory _toPackerTransportType,
        string memory _warehousePickupDate,
        string memory _toPackerShippingPrice
    ) public onlyAuthCaller returns (bool) {
        shipPackerData.toPackerTransportType = _toPackerTransportType;
        shipPackerData.warehousePickupDate = _warehousePickupDate;
        shipPackerData.toPackerShippingPrice = _toPackerShippingPrice;

        batchShipToPacker[batchNo] = shipPackerData;
        bool status = supplyChainStorage.writeNextAction(batchNo, "PACKER");
        return (true && status);
    }

    function getShipPackerData(address batchNo)
        public
        view
        onlyAuthCaller
        returns (
            string memory toPackerTransportType,
            string memory warehousePickupDate,
            string memory toPackerShippingPrice
        )
    {
        ShipToPacker memory tmpData = batchShipToPacker[batchNo];
        return (
            tmpData.toPackerTransportType,
            tmpData.warehousePickupDate,
            tmpData.toPackerShippingPrice
        );
    }

    function setPackData(
        address batchNo,
        string memory _packerAddress,
        string[] memory _latLngPacker,
        string memory _packerArrivalDate,
        string memory _packingDate,
        string memory _packingPricePerKilo
    ) public onlyAuthCaller returns (bool) {
        packData.packerAddress = _packerAddress;
        packData.latLngPacker = _latLngPacker;
        packData.packerArrivalDate = _packerArrivalDate;
        packData.packingDate = _packingDate;
        packData.packingPricePerKilo = _packingPricePerKilo;

        batchPack[batchNo] = packData;
        bool status = supplyChainStorage.writeNextAction(
            batchNo,
            "SHIPPER_RETAILER"
        );
        return (true && status);
    }

    function getPackData(address batchNo)
        public
        view
        onlyAuthCaller
        returns (
            string memory packerAddress,
            string[] memory latLngPacker,
            string memory packerArrivalDate,
            string memory packingDate,
            string memory packingPricePerKilo
        )
    {
        Pack memory tmpData = batchPack[batchNo];
        return (
            tmpData.packerAddress,
            tmpData.latLngPacker,
            tmpData.packerArrivalDate,
            tmpData.packingDate,
            tmpData.packingPricePerKilo
        );
    }

    function setShipRetailerData(
        address batchNo,
        string memory _toRetailerTransportType,
        string memory _packerPickupDate,
        string memory _toReatilerShippingPrice
    ) public onlyAuthCaller returns (bool) {
        shipRetailerData.toRetailerTransportType = _toRetailerTransportType;
        shipRetailerData.packerPickupDate = _packerPickupDate;
        shipRetailerData.toReatilerShippingPrice = _toReatilerShippingPrice;

        batchShipToRetailer[batchNo] = shipRetailerData;
        bool status = supplyChainStorage.writeNextAction(batchNo, "RETAILER");
        return (true && status);
    }

    function getShipRetailerData(address batchNo)
        public
        view
        onlyAuthCaller
        returns (
            string memory toRetailerTransportType,
            string memory packerPickupDate,
            string memory toReatilerShippingPrice
        )
    {
        ShipToRetailer memory tmpData = batchShipToRetailer[batchNo];
        return (
            tmpData.toRetailerTransportType,
            tmpData.packerPickupDate,
            tmpData.toReatilerShippingPrice
        );
    }

    function setRetailerData(
        address batchNo,
        string[] memory _warehouseSalepointArrivalDate,
        string memory _warehouseRetailerName,
        string memory _salepointRetailerName,
        string[] memory _addressLatLngWarehouseRetailer,
        string[] memory _addressLatLngSalepointRetailer,
        string memory _toSalepointTransportType,
        string memory _toSalepointShippingPrice,
        string memory _retailerPricePerKilo
    ) public onlyAuthCaller returns (bool) {
        retailerData
            .warehouseSalepointArrivalDate = _warehouseSalepointArrivalDate;
        retailerData.warehouseRetailerName = _warehouseRetailerName;
        retailerData.salepointRetailerName = _salepointRetailerName;
        retailerData
            .addressLatLngWarehouseRetailer = _addressLatLngWarehouseRetailer;
        retailerData
            .addressLatLngSalepointRetailer = _addressLatLngSalepointRetailer;
        retailerData.toSalepointTransportType = _toSalepointTransportType;
        retailerData.toSalepointShippingPrice = _toSalepointShippingPrice;
        retailerData.retailerPricePerKilo = _retailerPricePerKilo;

        batchRetailer[batchNo] = retailerData;
        bool status = supplyChainStorage.writeNextAction(batchNo, "DONE");
        return (true && status);
    }

    function getRetailerData(address batchNo)
        public
        view
        onlyAuthCaller
        returns (
            string[] memory warehouseSalepointArrivalDate,
            string memory warehouseRetailerName,
            string memory salepointRetailerName,
            string[] memory addressLatLngWarehouseRetailer,
            string[] memory addressLatLngSalepointRetailer,
            string memory toSalepointTransportType,
            string memory toSalepointShippingPrice,
            string memory retailerPricePerKilo
        )
    {
        Retailer memory tmpData = batchRetailer[batchNo];
        return (
            tmpData.warehouseSalepointArrivalDate,
            tmpData.warehouseRetailerName,
            tmpData.salepointRetailerName,
            tmpData.addressLatLngWarehouseRetailer,
            tmpData.addressLatLngSalepointRetailer,
            tmpData.toSalepointTransportType,
            tmpData.toSalepointShippingPrice,
            tmpData.retailerPricePerKilo
        );
    }
}
