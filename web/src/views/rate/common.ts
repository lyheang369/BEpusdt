// Get the flag emoji for each fiat currency
const getFiatFlag = (fiat: string) => {
  const fiatFlagMap: Record<string, string> = {
    CNY: "🇨🇳",
    USD: "🇺🇸",
    JPY: "🇯🇵",
    EUR: "🇪🇺",
    GBP: "🇬🇧"
  };
  return fiatFlagMap[fiat] || "🌍";
};

export const getCryptoColor = (crypto: string): string => {
  const colors: Record<string, string> = {
    USDT: "green",
    USDC: "blue",
    TRX: "red",
    ETH: "purple",
    BNB: "orange"
  };
  return colors[crypto] || "gray";
};

export { getFiatFlag };
