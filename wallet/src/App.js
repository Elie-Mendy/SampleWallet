import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Wallet from './artifacts/contracts/Wallet.sol/Wallet.json';
import './App.css';

let WalletAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

function App() {

  const [balance, setBalance] = useState(0);
  const [amountSend, setAmountSend] = useState();
  const [amountWithdraw, setAmountWithdraw] = useState();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    getBalance();
  }, [])

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(WalletAddress, Wallet.abi, provider);

      try {
        let overrides = { from : accounts[0] }
        const data = await contract.getBalance(overrides);
        setBalance(String(data)); // Casting BigNUmber to string
      }
      catch(err) {
        setError('an Error occurs')
      }
    }
  }


  function updateAmountSend(e) {
    setAmountSend(e.target.value);
  }

  function updateAmountWithdraw(e) {
    setAmountWithdraw(e.target.value);
  }

  async function transfer() {
    if(!amountSend) { return }
    setError('');
    setSuccess('');

    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const tx = {
          from: accounts[0],
          to: WalletAddress,
          value: ethers.utils.parseEther(amountSend),
        }
        const transaction = await signer.sendTransaction(tx);
        await transaction.wait()
        setAmountSend('');
        getBalance('');
        setSuccess('Transaction Successed');
      }
      catch {
        setError('An Error Occurs');
      }

    }

  }

  async function withdraw() {
    if (!amountWithdraw) { return }
    setError('');
    setSuccess('');
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);

      try {
        const transaction = await contract.withdrawMoney(accounts[0], ethers.utils.parseEther(amountWithdraw));
        await transaction.wait();
        setAmountWithdraw('');
        getBalance();
        setSuccess('Withtdrawal Successed');
      }
      catch {
        setError('An Error Occurs.')
      }
    }
  }

  return (
    <div className='App'>
      <div className='container'>
        <div className='logo'>
          <i className="fa-brands fa-ethereum"></i>
        </div>
        { error && <p className='error'>{error}</p>}
        { success && <p className='success'>{success}</p>}
        <h2>{ balance / 10 ** 18} <span className='eth'>eth</span></h2>
        <div className='wallet__flex'>
        <div className='walletG'>
            <h3>Send Ethers</h3>
            <input type='text' placeholder='Amount to send' onChange={updateAmountSend}></input>
            <button onClick={transfer}>Envoyer</button>
          </div>

          <div className='walletD'>
            <h3>Withdraw Ethers</h3>
            <input type='text' placeholder='Amount to withdraw' onChange={updateAmountWithdraw}></input>
            <button onClick={withdraw}>Envoyer</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
