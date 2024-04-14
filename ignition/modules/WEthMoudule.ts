import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const name = "WrapEth";
const symbol = "WEth";

const WEthModule = buildModule("WEth", (m) => {
  const nameOfWEth = m.getParameter("name", name);
  const symbolOfWEth = m.getParameter("symbol", symbol);
  const WEth = m.contract("WEth", [nameOfWEth, symbolOfWEth]);
  return { WEth };
});
export default WEthModule;
