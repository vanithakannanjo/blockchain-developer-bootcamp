import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dapp from '../assets/dapp.svg';
import { loadBalances } from '../store/interactions';
const Balance = () => {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account);
  const exchange = useSelector((state) => state.exchange.contract);
  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const tokenBalances = useSelector((state) => state.tokens.balances);

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account]);

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button className="tab tab--active">Deposit</button>
          <button className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className="exchange__transfers--form">
        <div className="flex-between"></div>
        <p>
          <small>Token</small>
          <br />
          <img src={dapp} alt="Token Logo" />
          {symbols && symbols[0]}
        </p>
        <p>
          <small>Wallet</small>
          <br />
          {tokenBalances && tokenBalances[0]}
        </p>
        <form>
          <label htmlFor="token0"></label>
          <input type="text" id="token0" placeholder="0.0000" />

          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between"></div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id="token1" placeholder="0.0000" />

          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
