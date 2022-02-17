import {useEffect, useState} from "react";
import Head from "next/head";
import Web3 from "web3";
import lotteryContract from "../scripts/lottery";
import styles from "../styles/Home.module.css";
import "bulma/css/bulma.css";

const Home = () => {
    const [web3, setWeb3] = useState({});
    const [address, setAddress] = useState("");
    const [contract, setContract] = useState({});
    const [jackpot, setJackpot] = useState(0);
    const [players, setPlayers] = useState([]);
    const [lotteryId, setLotteryId] = useState(0);
    const [history, setHistory] = useState({});
    const [randomness, setRandomness] = useState(0);
    const [winnerAddress, setWinnerAddress] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        updateState();
    }, [contract]);

    /* Update entire State of Application */
    const updateState = () => {
        if (contract) {
            getJackpot().catch(error => console.error(error.message));
            getPlayers().catch(error => console.error(error.message));
            getLotteryId().catch(error => console.error(error.message));
        }
    }

    const getJackpot = async () => {
        /* Using readonly Function from Contract */
        const jackpot = await contract.methods.getBalance().call();
        setJackpot(parseFloat(web3.utils.fromWei(jackpot, "ether")));
    }

    const getPlayers = async () => {
        /* Using readonly Function from Contract */
        const players = await contract.methods.getPlayers().call();
        setPlayers(players);
    }

    const getLotteryId = async () => {
        /* Using readonly Function from Contract */
        const lotteryId = await contract.methods.lotteryId().call();
        setLotteryId(parseInt(lotteryId));
        await getHistory();
    }

    const getHistory = async () => {
        setHistory([]);
        for (let i = lotteryId; i > 0; i--) {
            /* Using readonly Function from Contract */
            const winner = await contract.methods.lotteryHistory(i).call();
            const newHistory = {
                id: i,
                winner: winner
            }
            setHistory(history => [...history, newHistory]);
        }
    }

    const enterLottery = async () => {
        setError("");
        try {
            /* Using writing Function from Contract */
            await contract.methods.enterLottery().send({
                from: address,
                value: web3.utils.toWei("0.1", "ether"),
                gas: 300000,
                gasPrice: null
            });
            /* Updating entire State of Application */
            updateState();
        } catch (error) {
            setError(error.message);
            console.error(error.message);
        }
    }

    const handlePickWinner = async () => {
        setError("");
        try {
            /* Using writing Function from Contract */
            await contract.methods.pickWinner().send({
                from: address,
                gas: 300000,
                gasPrice: null
            });
            /* Using writing Function from Contract */
            const randomness = await contract.methods.randomResult().call();
            setRandomness(randomness);
        } catch (error) {
            setError(error.message);
            console.error(error.message);
        }
    }

    const handlePayWinner = async () => {
        setError("");
        setWinnerAddress("");
        try {
            /* Using writing Function from Contract */
            await contract.methods.payWinner().send({
                from: address,
                gas: 300000,
                gasPrice: null
            })
            /* Using readonly Function from Contract */
            const winnerAddress = await contract.methods.lotteryHistory(lotteryId).call();
            setWinnerAddress(winnerAddress);
            /* Updating entire State of Application */
            updateState();
        } catch (error) {
            setError(error.message);
            console.error(error.message);
        }
    }

    const handleConnectWallet = async () => {
        setError("");
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                /* Requesting Wallet Connection */
                await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                /* Creating Web3 Instance */
                const web3 = new Web3(window.ethereum);
                setWeb3(web3);
                /* Getting List of connected Accounts */
                const accounts = await web3.eth.getAccounts();
                setAddress(accounts[0]);
                /* Creating local Contract Instance */
                setContract(lotteryContract(web3));
                /* Wallet listen on Account Change */
                window.ethereum.on("accountsChanged", async () => {
                    /* Getting List of connected Accounts */
                    const accounts = await web3.eth.getAccounts();
                    setAddress(accounts[0]);
                });
            } catch (error) {
                setError(error.message);
                console.error(error.message);
            }
        } else {
            alert("Install a Wallet for Ethereum");
        }
    }

    return (
        <div>
            <Head>
                <title>Lottery decentralized App</title>
                <meta name="description" content="Lottery decentralized App"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <nav className={"navbar mt-4 mb-4"}>
                    <div className={"container"}>
                        <div className={"navbar-brand"}>
                            <h1>Lottery decentralized App</h1>
                        </div>
                        <div className={"navbar-end"}>
                            <button className={"button is-primary"} onClick={handleConnectWallet}>
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                </nav>
                <div className={"container"}>
                    <section className={"mt-5"}>
                        <div className={"columns"}>
                            <div className={"column is-two-thirds"}>
                                <section className={"mt-5"}>
                                    <p>Enter the Lottery by sending 0.01 Ether</p>
                                    <button
                                        className={"button is-primary is-large is-light mt-3"}
                                        onClick={enterLottery}
                                    >
                                        Enter now
                                    </button>
                                </section>
                                <section className={"mt-5"}>
                                    <p>Pick a Winner by Admin</p>
                                    <button
                                        className={"button is-success is-large is-light mt-3"}
                                        onClick={handlePickWinner}
                                    >
                                        Pick Winner
                                    </button>
                                </section>
                                <section>
                                    <div className={"container mt-5 has-text-danger"}>
                                        <p>{randomness !== 0 ? randomness : ""}</p>
                                    </div>
                                </section>
                                <section className={"mt-5"}>
                                    <p>Pay a Winner by Admin</p>
                                    <button
                                        className={"button is-success is-large is-light mt-3"}
                                        onClick={handlePayWinner}
                                    >
                                        Pay Winner
                                    </button>
                                </section>
                                <section>
                                    <div className={"container mt-5 has-text-success"}>
                                        <p>The Winner: {winnerAddress}</p>
                                    </div>
                                </section>
                                <section>
                                    <div className={"container mt-5 has-text-danger"}>
                                        <p>{error}</p>
                                    </div>
                                </section>
                            </div>
                            <div className={`column is-one-third ${styles.info}`}>
                                <section className={"mt-5"}>
                                    <div className={"card"}>
                                        <div className={"card-content"}>
                                            <div className={"content"}>
                                                <h2>Lottery History</h2>
                                                {
                                                    (history && history.length) && history.map((historyEntry, index) => {
                                                        return (
                                                            <div className={"history-entry mt-3"} key={`history-entry-${index}`}>
                                                                <div>Lottery #{historyEntry.id} Winner</div>
                                                                <a
                                                                    href={`https://etherscan.io/address/${historyEntry.winner}`}
                                                                    target={"_blank"}
                                                                    rel={"noreferrer"}
                                                                >
                                                                    {historyEntry.winner}
                                                                </a>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className={"mt-5"}>
                                    <div className={"card"}>
                                        <div className={"card-content"}>
                                            <div className={"content"}>
                                                <h2>Players ({players.length})</h2>
                                                <ul className={"ml-0"}>
                                                    {
                                                        (players && players.length) && players.map((player, index) => {
                                                            return (
                                                                <li key={`player-${index}`}>
                                                                    <a
                                                                        href={`https://etherscan.io/address/${player}`}
                                                                        target={"_blank"}
                                                                        rel={"noreferrer"}
                                                                    >
                                                                        {player}
                                                                    </a>
                                                                </li>
                                                            );
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className={"mt-5"}>
                                    <div className={"card"}>
                                        <div className={"card-content"}>
                                            <div className={"content"}>
                                                <h2>Jackpot</h2>
                                                <p>{jackpot} Ether</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2022 Lottery</p>
            </footer>
        </div>
    );
}

export default Home;
