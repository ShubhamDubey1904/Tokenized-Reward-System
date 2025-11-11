export const NEXT_PUBLIC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
export const NEXT_PUBLIC_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 80002);

export const ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Rewarded(address indexed user, uint256 amount)",

  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function rewardUser(address user, uint256 amount)"
];

export const AMOY_PARAMS = {
  chainId: "0x13882", // 80002
  chainName: "Polygon Amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"]
};
