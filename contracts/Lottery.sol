// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Lottery is Ownable, ReentrancyGuard, VRFConsumerBase  {
    /* storage (default) - Variable is a State Variable (and stored on Blockchain) */
    /* Functions and Addresses declared as `payable` can receive Ether into the Contract */
    address payable[] public players;
    uint public lotteryId;
    mapping (uint => address payable) public lotteryHistory;
    /* KeyHash identifies which Chainlink Oracle VRF Node to use */
    bytes32 internal keyHash;
    /* Fee for VRF Node */
    uint internal fee;
    /* Result from VRF Node */
    uint public randomResult;

    constructor() Ownable() ReentrancyGuard() VRFConsumerBase(
    /* VRF Coordinator Address on Testnet Rinkeby */
        0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B,
    /* LINK Token Address on Testnet Rinkeby */
        0x01BE23585060835E02B77ef475b0Cc51aA1e0709
    ) {
        /* KeyHash on Testnet Rinkeby */
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18;    // 0.1 LINK
        lotteryId = 1;
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK in Contract");
        return requestRandomness(keyHash, fee);
    }

    /* Callback Function that will be called from Chainlink Node */
    function fulfillRandomness(bytes32 requestId, uint randomness) internal override {
        randomResult = randomness;
    }

    function getWinnerByLottery(uint lottery) public view returns (address payable) {
        return lotteryHistory[lottery];
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /* memory - Variable is in-memory and it exists while a Function is being called */
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function enterLottery() public payable {
        require(msg.value >= 0.1 ether);
        /* Adding `payable` Address of Player entering Lottery */
        players.push(payable(msg.sender));
    }

    function pickWinner() public onlyOwner() {
        getRandomNumber();
    }

    function payWinner() public onlyOwner() nonReentrant() {
        require(randomResult > 0, "A random Number has to be generated before choosing a Winner");
        /* Limiting the maximum possible Numbers to Number of Players */
        uint index = randomResult % players.length;
        /* Saving the Winner in History */
        lotteryHistory[lotteryId] = players[index];
        lotteryId++;
        /* Transferring entire Balance to Winner */
        players[index].transfer(address(this).balance);
        /* Resetting the State of the Contract */
        players = new address payable[](0);
    }
}
