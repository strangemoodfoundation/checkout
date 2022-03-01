import { AppleSVG, WindowsSVG } from "../../components/icons";
import { useSolPrice } from "../../components/useSolPrice";
import {
  Listing,
  loadAllListingPublicKeys,
  loadListing,
  solanaPrice,
} from "../../lib/load";
import BN from "bn.js";

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

  if (!props.listing) {
    return <div>404 not found?</div>;
  }

  return (
    <div className="h-full w-full flex flex-col p-4 items-center pt-12 max-w-4xl m-auto">
      <div className="flex flex-row w-full items-end pb-4">
        <div className="w-full flex flex-col">
          <h1 className="text-2xl font-medium ">
            {props.listing.metadata.name}
          </h1>
        </div>
        <div className="">share</div>
      </div>
      <div className="flex flex-row w-full pb-4 justify-start start">
        <div className="flex flex-col dark:bg-gray-800 bg-gray-100 flex-1 w-full">
          <img
            src={props.listing.metadata.primaryImage}
            className=" w-full object-contain"
          />
          <p className="text-sm px-4 py-2 opacity-80">
            {props.listing.metadata.description}
          </p>
        </div>
      </div>

      <div className="relative dark:bg-gray-800 bg-gray-100 flex flex-row justify-between items-center p-4 w-full rounded-sm">
        <div className="mr-4 flex flex-col">
          <div className="font-bold text-xl">
            Buy {props.listing.metadata.name}
          </div>
          <a
            className="opacity-50 underline text-xs"
            href={`https://explorer.strangemood.com/address/somelistingid`}
          >
            {`sol://${"foo"}`}
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
            <button className="flex  px-4 py-2 transition-all  text-green-800 dark:text-gray-900 bg-green-400 dark:bg-green-500 dark:hover:bg-green-400 dark:rounded-sm rounded-r-sm font-medium">
              Checkout
            </button>
          </div>
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
  const publicKeys = await loadAllListingPublicKeys(
    (process.env.SOLANA_CLUSTER as any) || "testnet"
  );
  console.log(`Creating ${publicKeys.length} paths`);

  return {
    paths: publicKeys.map((publicKey: any) => ({
      params: { publicKey: publicKey.toString() },
    })),
    fallback: true, // false or 'blocking'
  };
}
