//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./SupplyChainStorage2.sol";
import "./SupplyChainStorage.sol";
import "./Ownable.sol";

contract CoffeeSupplyChain2 is Ownable {
    event DoneWarehousing(address indexed user, address indexed batchNo);
    event DoneShippingPacker(address indexed user, address indexed batchNo);
    event DonePackaging(address indexed user, address indexed batchNo);
    event DoneShippingRetailer(address indexed user, address indexed batchNo);
    event DoneRetailer(address indexed user, address indexed batchNo);

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
    SupplyChainStorage2 supplyChainStorage2;

    constructor(address _supplyChainStorage, address _supplyChainStorage2) {
        supplyChainStorage = SupplyChainStorage(_supplyChainStorage);
        supplyChainStorage2 = SupplyChainStorage2(_supplyChainStorage2);
    }

    function addWarehousingData(
        address _batchNo,
        string memory _warehouseAddress,
        string[] memory _latLngWarehouse,
        string memory _warehouseArrivalDate,
        string memory _storageTime,
        string memory _storagePricePerKiloPerTime
    ) public isValidPerformer(_batchNo, "WAREHOUSE") returns (bool) {
        bool status = supplyChainStorage2.setWarehousingData(
            _batchNo,
            _warehouseAddress,
            _latLngWarehouse,
            _warehouseArrivalDate,
            _storageTime,
            _storagePricePerKiloPerTime
        );

        emit DoneWarehousing(msg.sender, _batchNo);

        return (status);
    }

    function getWarehousingData(address _batchNo)
        public
        view
        returns (
            string memory warehouseAddress,
            string[] memory latLngWarehouse,
            string memory warehouseArrivalDate,
            string memory storageTime,
            string memory storagePricePerKiloPerTime
        )
    {
        (
            warehouseAddress,
            latLngWarehouse,
            warehouseArrivalDate,
            storageTime,
            storagePricePerKiloPerTime
        ) = supplyChainStorage2.getWarehousingData(_batchNo);

        return (
            warehouseAddress,
            latLngWarehouse,
            warehouseArrivalDate,
            storageTime,
            storagePricePerKiloPerTime
        );
    }

    function addShipPackerData(
        address _batchNo,
        string memory _toPackerTransportType,
        string memory _warehousePickupDate,
        string memory _toPackerShippingPrice
    ) public isValidPerformer(_batchNo, "SHIPPER_PACKER") returns (bool) {
        bool status = supplyChainStorage2.setShipPackerData(
            _batchNo,
            _toPackerTransportType,
            _warehousePickupDate,
            _toPackerShippingPrice
        );

        emit DoneShippingPacker(msg.sender, _batchNo);

        return (status);
    }

    function getShipPackerData(address _batchNo)
        public
        view
        returns (
            string memory toPackerTransportType,
            string memory warehousePickupDate,
            string memory toPackerShippingPrice
        )
    {
        (
            toPackerTransportType,
            warehousePickupDate,
            toPackerShippingPrice
        ) = supplyChainStorage2.getShipPackerData(_batchNo);

        return (
            toPackerTransportType,
            warehousePickupDate,
            toPackerShippingPrice
        );
    }

    function addPackData(
        address _batchNo,
        string memory _packerAddress,
        string[] memory _latLngPacker,
        string memory _packerArrivalDate,
        string memory _packingDate,
        string memory _packingPricePerKilo
    ) public isValidPerformer(_batchNo, "PACKER") returns (bool) {
        bool status = supplyChainStorage2.setPackData(
            _batchNo,
            _packerAddress,
            _latLngPacker,
            _packerArrivalDate,
            _packingDate,
            _packingPricePerKilo
        );

        emit DonePackaging(msg.sender, _batchNo);

        return (status);
    }

    function getPackData(address _batchNo)
        public
        view
        returns (
            string memory packerAddress,
            string[] memory latLngPacker,
            string memory packerArrivalDate,
            string memory packingDate,
            string memory packingPricePerKilo
        )
    {
        (
            packerAddress,
            latLngPacker,
            packerArrivalDate,
            packingDate,
            packingPricePerKilo
        ) = supplyChainStorage2.getPackData(_batchNo);

        return (
            packerAddress,
            latLngPacker,
            packerArrivalDate,
            packingDate,
            packingPricePerKilo
        );
    }

    function addShipRetailerData(
        address _batchNo,
        string memory _toRetailerTransportType,
        string memory _packerPickupDate,
        string memory _toReatilerShippingPrice
    ) public isValidPerformer(_batchNo, "SHIPPER_RETAILER") returns (bool) {
        bool status = supplyChainStorage2.setShipRetailerData(
            _batchNo,
            _toRetailerTransportType,
            _packerPickupDate,
            _toReatilerShippingPrice
        );

        emit DoneShippingRetailer(msg.sender, _batchNo);

        return (status);
    }

    function getShipRetailerData(address _batchNo)
        public
        view
        returns (
            string memory toRetailerTransportType,
            string memory packerPickupDate,
            string memory toReatilerShippingPrice
        )
    {
        (
            toRetailerTransportType,
            packerPickupDate,
            toReatilerShippingPrice
        ) = supplyChainStorage2.getShipRetailerData(_batchNo);

        return (
            toRetailerTransportType,
            packerPickupDate,
            toReatilerShippingPrice
        );
    }

    function addRetailerData(
        address _batchNo,
        string[] memory _warehouseSalepointArrivalDate,
        string memory _warehouseRetailerName,
        string memory _salepointRetailerName,
        string[] memory _addressLatLngWarehouseRetailer,
        string[] memory _addressLatLngSalepointRetailer,
        string memory _toSalepointTransportType,
        string memory _toSalepointShippingPrice,
        string memory _retailerPricePerKilo
    ) public isValidPerformer(_batchNo, "RETAILER") returns (bool) {
        bool status = supplyChainStorage2.setRetailerData(
            _batchNo,
            _warehouseSalepointArrivalDate,
            _warehouseRetailerName,
            _salepointRetailerName,
            _addressLatLngWarehouseRetailer,
            _addressLatLngSalepointRetailer,
            _toSalepointTransportType,
            _toSalepointShippingPrice,
            _retailerPricePerKilo
        );

        emit DoneRetailer(msg.sender, _batchNo);

        return (status);
    }

    function getRetailerData(address _batchNo)
        public
        view
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
        (
            warehouseSalepointArrivalDate,
            warehouseRetailerName,
            salepointRetailerName,
            addressLatLngWarehouseRetailer,
            addressLatLngSalepointRetailer,
            toSalepointTransportType,
            toSalepointShippingPrice,
            retailerPricePerKilo
        ) = supplyChainStorage2.getRetailerData(_batchNo);

        return (
            warehouseSalepointArrivalDate,
            warehouseRetailerName,
            salepointRetailerName,
            addressLatLngWarehouseRetailer,
            addressLatLngSalepointRetailer,
            toSalepointTransportType,
            toSalepointShippingPrice,
            retailerPricePerKilo
        );
    }
}
