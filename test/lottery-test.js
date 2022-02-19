const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Lottery Test Suite", async () => {
    let lottery;
    let owner;
    let address1;
    let address2;
    let addresses;

    beforeEach(async () => {
        [owner, address1, address2, ...addresses] = await ethers.getSigners();
        const Lottery = await ethers.getContractFactory("Lottery");
        lottery = await Lottery.deploy();
        await lottery.deployed();
    });

    it("Should get Players", async () => {
        /* Given */
        await lottery.connect(address1).enterLottery({
            value: ethers.utils.parseEther("0.1")
        });
        await lottery.connect(address2).enterLottery({
            value: ethers.utils.parseEther("0.1")
        });
        /* When */
        const players = await lottery.getPlayers();
        /* Then */
        expect(players.length).to.equal(2);
    });

    it("Should get Jackpot", async () => {
        /* Given */
        await lottery.connect(address1).enterLottery({
            value: ethers.utils.parseEther("0.2")
        });
        await lottery.connect(address2).enterLottery({
            value: ethers.utils.parseEther("0.3")
        });
        /* When */
        const jackpot = await lottery.getBalance();
        /* Then */
        expect(jackpot).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("Should turn on", async () => {
        /* Given */
        await lottery.turnOn();
        /* When */
        const state = await lottery.state();
        /* Then */
        expect(state).to.equal(0);
    });

    it("Should turn off", async () => {
        /* Given */
        await lottery.turnOff();
        /* When */
        const state = await lottery.state();
        /* Then */
        expect(state).to.equal(1);
    });

    it("Should throw Invalid State Exception", async () => {
        /* Given */
        await lottery.turnOff();
        /* When */
        const state = await lottery.state();
        /* Then */
        expect(state).to.equal(1);
        await expect(lottery.pickWinner()).to.be.revertedWith("InvalidState(0)");
    });
});