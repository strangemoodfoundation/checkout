import { useSWR } from "./useSwr";

export function useSolPrice() {
  const { data, error } = useSWR<any>(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );

  if (!data) return false;
  if (error) return false;

  return data.solana.usd;
}
