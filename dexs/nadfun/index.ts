import { Adapter, FetchOptions } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

// Addresses
const BONDING_CURVE_CONTRACT = "0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE";
const WMON_TOKEN = "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A";

// ABIs
const buyAbi = "event CurveBuy(address indexed sender, address indexed token, uint256 amountIn, uint256 amountOut)";
const sellAbi = "event CurveSell(address indexed sender, address indexed token, uint256 amountIn, uint256 amountOut)";

const fetch = async ({ createBalances, getLogs }: FetchOptions) => {
  const dailyVolume = createBalances();

  // Fetch buy events
  const buyLogs = await getLogs({
    target: BONDING_CURVE_CONTRACT,
    eventAbi: buyAbi
  });

  for (const log of buyLogs) {
    // amountIn is wMON spent to buy tokens
    dailyVolume.add(WMON_TOKEN, log.amountIn);
  }

  // Fetch sell events
  const sellLogs = await getLogs({
    target: BONDING_CURVE_CONTRACT,
    eventAbi: sellAbi
  });

  for (const log of sellLogs) {
    // amountOut is wMON received from selling tokens
    dailyVolume.add(WMON_TOKEN, log.amountOut);
  }

  return {
    dailyVolume,
  };
};

const methodology = {
  Volume: "Sum of wMON spent on buy transactions and wMON received from sell transactions on the bonding curve.",
};

const adapter: Adapter = {
  version: 2,
  adapter: {
    [CHAIN.MONAD]: {
      fetch,
      start: '2025-11-24',
    },
  },
  methodology,
};

export default adapter;
