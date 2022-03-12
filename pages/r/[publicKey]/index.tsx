import { AppleSVG, WindowsSVG } from "../../../components/icons";
import { useSolPrice } from "../../../components/useSolPrice";
import {
  Listing,
  loadAllListingPublicKeys,
  loadListing,
  solanaPrice,
} from "../../../lib/load";
import BN from "bn.js";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { grabStrangemood } from "../../../components/useStrangemood";
import { purchase } from "@strangemood/strangemood";
import { PublicKey, Transaction } from "@solana/web3.js";
import cn from "classnames";

function useLamportsAsUSD(lamports: string, cachedSolPrice: number) {
  let solPrice = cachedSolPrice;
  const upToDateSolPrice = useSolPrice();
  if (upToDateSolPrice) solPrice = upToDateSolPrice;

  return new BN(lamports)
    .div(new BN(1e9))
    .mul(new BN(solPrice))
    .mul(new BN(10000000000))
    .toString();
}

export default function Checkout(props: {
  listing: Listing;
  solPrice: number;
}) {
  const price = useLamportsAsUSD(
    props.listing?.account?.price || "0",
    props.solPrice
  );
  const { visible, setVisible } = useWalletModal();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  if (!props.listing) {
    return (
      <div className="animate-pulse w-full h-full flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  async function onCheckoutClicked() {
    if (wallet.connected) {
      onPurchase();
    } else {
      setVisible(true);
    }
  }

  async function onPurchase() {
    setIsLoading(true);
    const program = await grabStrangemood(connection, wallet);

    const { instructions } = await purchase({
      program: program as any,
      signer: program.provider.wallet.publicKey as any,
      listing: new PublicKey(props.listing.publicKey),
      quantity: new BN(1),
    });

    // instructions.pop(); // why did we pop this instruction?
    console.log(instructions.map((i) => i.programId.toString()));
    console.log(instructions);
    const tx = new Transaction();
    tx.add(...instructions);
    await program.provider.send(tx);
    setIsLoading(false);

    alert("Purchased!");
  }

  if (!props.listing.metadata) {
    return (
      <div>This Listing does not have valid metadata, and may be broken.</div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col  justify-betweenitems-center pt-12 ">
      <div className="flex flex-col flex-1 h-full mb-24  p-4 max-w-4xl m-auto ">
        <div className="flex flex-row w-full items-end pb-4">
          <div className="w-full flex flex-col">
            <h1 className="text-2xl font-medium ">
              {props.listing.metadata!.name}
            </h1>
          </div>
        </div>
        <div className="flex flex-row w-full pb-4 justify-start start">
          <div className="flex flex-col dark:bg-gray-800 bg-gray-100 flex-1 w-full">
            <img
              src={props.listing.metadata!.primaryImage.src.uri}
              className=" w-full object-contain"
            />
            <p className="text-sm px-4 py-2 opacity-80">
              {props.listing.metadata!.description}
            </p>
          </div>
        </div>
        <div className="relative dark:bg-gray-800 bg-gray-100 flex flex-row justify-between items-center p-4 w-full rounded-sm">
          <div className="mr-4 flex flex-col">
            <div className="font-bold text-xl">
              Buy {props.listing.metadata!.name}
            </div>
            <a
              className="opacity-50 underline text-xs"
              href={`https://explorer.strangemood.com/address/${props.listing.publicKey}`}
            >
              {`sol://${props.listing.publicKey}`}
            </a>
          </div>
          <div>
            <div className="flex justify-end pr-4">
              <AppleSVG className="h-5 opacity-80 top-2 relative" />
            </div>
            <div className="relative flex rounded justify-center flex-row items-center top-10 dark:bg-black  bg-white pl-4 dark:pr-1 dark:py-1 border dark:border-0 border-black">
              <div className="mr-4 text-sm font-mono opacity-80">
                <div>${price}</div>
              </div>

              <button
                onClick={() => onCheckoutClicked()}
                className={cn({
                  "flex  px-4 py-2 transition-all  text-green-800 dark:text-gray-900 bg-green-400 dark:bg-green-500 dark:hover:bg-green-400 dark:rounded-sm rounded-r-sm font-medium":
                    true,
                  "opacity-50 cursor-not-allowed animate-pulse": isLoading,
                })}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t dark:bg-black w-full p-4 opacity-50 ">
        <div className="max-w-4xl m-auto w-full flex justify-between">
          <a
            href="https://github.com/strangemoodfoundation/checkout"
            target={"_blank"}
            rel="noreferrer"
            className="hover:opacity-50 animate-all underline text-sm"
          >{`Edit this website`}</a>
          <a
            href="https://strangemood.org"
            target={"_blank"}
            rel="noreferrer"
            className="hover:opacity-50 animate-all font-mono text-sm"
          >{`☼ strangemood ☼`}</a>
        </div>
      </div>
    </div>
  );
}

interface StaticParams {
  publicKey: string;
}

export async function getStaticProps(context: { params: StaticParams }) {
  const listing = await loadListing(
    context.params.publicKey,
    (process.env.SOLANA_CLUSTER as any) || "testnet"
  );
  const solPrice = await solanaPrice();

  return {
    props: {
      listing,
      solPrice,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths(context: any) {
  // const publicKeys = await loadAllListingPublicKeys(
  //   (process.env.SOLANA_CLUSTER as any) || "testnet"
  // );

  return {
    // paths: publicKeys.map((publicKey: any) => ({
    //   params: { publicKey: publicKey.toString() },
    // })),
    paths: [],
    fallback: true, // false or 'blocking'
  };
}
