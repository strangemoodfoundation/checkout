import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

require("@solana/wallet-adapter-react-ui/styles.css");

const Wallet = dynamic<{ children: any }>(
  () =>
    import("../components/WalletConnectionProvider").then(
      ({ Wallet }) => Wallet
    ),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Wallet>
      <Component {...pageProps} />
    </Wallet>
  );
}

export default MyApp;
