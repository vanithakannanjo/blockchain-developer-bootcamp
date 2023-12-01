import { useEffect } from 'react';
import '../App.css';

function App() {
  const loadBlockChainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log(accounts[0]);
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
