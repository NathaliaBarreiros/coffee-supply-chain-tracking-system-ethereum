module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      gas: 5000000, //default gas limit
      network_id: "*" //Match any network id (connect to any network available on port 7545 of localhost)
    }
  },
  compilers: {
    solc: {
      version: "0.8.7",
    }
  },
};
