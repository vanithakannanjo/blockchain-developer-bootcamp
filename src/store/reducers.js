export const provider = (state = {}, action) => {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection,
      };

    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId,
      };
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account,
      };
    default:
      return state;
  }
};

export const tokens = (state = { loaded: false, contract: [], symbols:[] }, action) => {
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded:true,
        contracts: [...state.contracts, action.token],
        symbol: [...state.symbols,action.symbol]
      };
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded:true,
        contracts: [...state.contracts, action.token],
        symbol: [...state.symbols,action.symbol]
      };

    default:
      return state;
  }
};
