/* Import Application Binary Interface (ABI) */
import Lottery from "../artifacts/contracts/Lottery.sol/Lottery.json";

const contractAddress = "0x0d6A72dB839fb1A28379B4e3693112aFED203e4D";

const lotteryContract = (web3) => {
    return new web3.eth.Contract(Lottery.abi, contractAddress);
}

export default lotteryContract;
