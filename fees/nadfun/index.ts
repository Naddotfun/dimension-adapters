import { FetchOptions, FetchResultV2, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { addTokensReceived } from "../../helpers/token";

// Addresses
const WMON_TOKEN = "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A";

// Fee collector addresses
const PROTOCOL_TREASURY = "0x4ac5Fd82B91A10de7f91343DDCca7a2541d3F509"; // Protocol revenue
const FEE_COLLECTOR_2 = "0x46895ee48Fb1D750A81562fd6019B37F21d7FD52";
const FEE_COLLECTOR_3 = "0x42e75B4B96d7000E7Da1e0c729Cec8d2049B9731";

const fetchFees = async (options: FetchOptions): Promise<FetchResultV2> => {
  const dailyFees = options.createBalances();
  const dailyRevenue = options.createBalances();

  // Track wMON tokens received by all fee collectors (total fees)
  const allFeeCollectors = [PROTOCOL_TREASURY, FEE_COLLECTOR_2, FEE_COLLECTOR_3];

  for (const collector of allFeeCollectors) {
    const fees = await addTokensReceived({
      options,
      tokens: [WMON_TOKEN],
      targets: [collector]
    });
    dailyFees.addBalances(fees);
  }

  // Track wMON tokens received by protocol treasury only (protocol revenue)
  const revenue = await addTokensReceived({
    options,
    tokens: [WMON_TOKEN],
    targets: [PROTOCOL_TREASURY]
  });
  dailyRevenue.addBalances(revenue);

  return {
    dailyFees,
    dailyRevenue,
    dailyProtocolRevenue: dailyRevenue,
  };
};

const methodology = {
  Fees: "All fees collected in wMON from trading on the bonding curve.",
  Revenue: "Revenue going to the protocol treasury.",
  ProtocolRevenue: "All protocol revenue is allocated to the treasury.",
};

const adapter: SimpleAdapter = {
  version: 2,
  adapter: {
    [CHAIN.MONAD]: {
      fetch: fetchFees,
      start: '2025-11-24',
    }
  },
  methodology
};

export default adapter;
