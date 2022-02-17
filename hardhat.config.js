require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    solidity: "0.8.11",
    paths: {
        artifacts: "./artifacts"
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            gas: 6000000,
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    }
};