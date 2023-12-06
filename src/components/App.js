import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';

function App() {
  const dispatch = useDispatch();
  const loadBlockChainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log('accounts[0] = ', accounts[0]);

    //Connect Ether to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: 'PROVIDER_LOADED', connection: provider });
    const { chainId } = await provider.getNetwork();
    console.log('chainId  = ', chainId);

    //Token Smart Contract
    const token = new ethers.Contract(
      config[chainId].Dapp.address,
      TOKEN_ABI,
      provider
    );
    console.log('Token address = ', token.address);
    console.log('Token Symbol = ', await token.symbol());
  };

  useEffect(() => {
    loadBlockChainData();
  });

  return (
    <div>
      {/* Navbar */}

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}

          {/* Balance */}

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;
