const hre = require("hardhat");

const main = async () => {
    /* Deploy the Smart Contract to the chosen Network */
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy();
    await lottery.deployed();
    console.log("Lottery deployed to:", lottery.address);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
