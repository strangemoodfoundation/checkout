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
import { useMemo, useState } from "react";
import { VideoNodeMetadata, ImageNodeMetadata } from "../../../lib/graphql";
import { grabStrangemood } from "../../../components/useStrangemood";
import { getReadableDate } from "../../../utils";
import { purchase } from "@strangemood/strangemood";
import { PublicKey, Transaction } from "@solana/web3.js";
import cn from "classnames";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselItems = useMemo(() => {
    if (!props.listing || !props.listing.metadata) return [];
    return (props.listing.metadata.videos || [])
      .concat(props.listing.metadata.images || []);
  }, [ JSON.stringify(props.listing || {}) ]) as (VideoNodeMetadata | ImageNodeMetadata)[];

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

    router.push("/library");
  }

  if (!props.listing.metadata) {
    return (
      <div>This Listing does not have valid metadata, and may be broken.</div>
    );
  }

  const renderChannelIcon = (channel: string) => {
    switch (channel) {
      case "apple":
        return <AppleSVG key={channel} className="w-5 h-5 opacity-80 mx-2 top-2 relative" />;
      case "windows":
        return <WindowsSVG key={channel} className="w-5 h-5 opacity-80 mx-2 top-2 relative" />;
      default:
        return null;
    }
  };

  const activeCarouselItem = carouselItems.length > 0
    ? carouselItems[carouselIndex] : props.listing.metadata!.primaryImage;

  return (
    <div className="h-full w-full flex flex-col justify-between items-center pt-12">
      <div className="flex flex-col w-full p-4 max-w-6xl">
        <div className="flex flex-row md:flex-row-reverse w-full m-auto mb-4 flex-wrap md:flex-nowrap">
          {/* Game Summary */}
          <div className="flex flex-col dark:bg-gray-800 bg-gray-100 p-4 flex-auto md:flex-1 min-w-min md:w-64">
            <div className="flex flex-row dark:bg-black bg-gray-100 w-full md:w-auto mb-2">
              <img
                src={props.listing.metadata!.primaryImage?.src.uri}
                className="w-full m-auto object-contain"
                alt={props.listing.metadata!.primaryImage?.alt}
              />
            </div>
            <h1 className="text-3xl font-medium">
              {props.listing.metadata!.name}
            </h1>
            {props.listing.metadata!.links && (
              <div className="flex flex-row items-center mt-1">
                {props.listing.metadata!.links?.map(link => (
                  <a
                    // @ts-ignore
                    key={link.uri}
                    className="opacity-50 underline text-xs break-all mx-1"
                    // @ts-ignore
                    href={link.uri}
                  >
                    {link.type}
                  </a>
                ))}
              </div>
            )}
            <p className="text-sm py-2 opacity-80">
              {props.listing.metadata!.description}
            </p>
            {props.listing.metadata!.creators && (
              <div className="flex flex-row grow items-center pt-2">
                <p className="text-sm opacity-50 uppercase">
                  Developer{props.listing.metadata!.creators.length > 1 ? 's' : ''}
                </p>
                <div className="h-px flex-1 dark:bg-white opacity-10 mx-4" />
                <p className="text-sm opacity-80">
                  {props.listing.metadata!.creators.map(creator => creator.name).join(', ')}
                </p>
              </div>
            )}
            {props.listing.metadata!.createdAt && (
              <div className="flex flex-row grow items-center pt-1">
                <p className="text-sm opacity-50 uppercase">
                  Released
                </p>
                <div className="h-px flex-1 dark:bg-white opacity-10 mx-4" />
                <p className="text-sm opacity-80">
                  {getReadableDate(new Date(props.listing.metadata!.createdAt), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {props.listing.metadata!.tags && (
              <div className="flex flex-row grow items-center pt-1">
                <p className="text-sm opacity-50 uppercase">
                  Tags
                </p>
                <div className="h-px flex-1 dark:bg-white opacity-10 mx-4" />
                <div className="flex flex-row">
                  {props.listing.metadata!.tags.map(tag => (
                    <div key={tag} className="dark:bg-gray-700 bg-gray-200 px-1.5 py-0.5 ml-1 rounded">
                      <p className="text-sm opacity-80">{tag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Video/Image Carousel */}
          <div className="flex flex-col dark:bg-black bg-gray-100 flex-auto min-w-0 w-full md:w-64">
            {activeCarouselItem && (
              <div className="w-full h-full">
                {activeCarouselItem.src.contentType.includes('video')
                  ? (
                    <video
                      src={activeCarouselItem.src.uri}
                      className="w-full h-full object-contain"
                      controls
                      controlsList="nodownload"
                    />
                  ) : (
                    <img
                      src={activeCarouselItem.src.uri}
                      className="w-full h-full object-contain"
                      alt={(activeCarouselItem as ImageNodeMetadata).alt}
                    />
                  )}
              </div>
            )}
            {carouselItems.length > 1 && (
              <div className="flex max-h-24 h-full w-full overflow-x-scroll">
                {carouselItems.map((item, index) => (
                  <div
                    key={`${item.src.uri}-${index}`}
                    className={cn({'flex flex-col justify-center items-center p-0.5 m-0.5': true,
                      'border border-black dark:border-white': carouselIndex === index,
                    })}
                  >
                    <div className="min-w-max h-full cursor-pointer" onClick={(e) => {
                      e.preventDefault();
                      setCarouselIndex(index);
                    }}>
                    {item.src.contentType.includes('video')
                      ? (
                        <video
                          src={item.src.uri}
                          className="w-full h-full object-cover pointer-events-none"
                          controls
                          controlsList="nodownload"
                        />
                      ) : (
                        <img
                          src={item.src.uri}
                          className="w-full h-full object-cover pointer-events-none"
                          alt={(activeCarouselItem as ImageNodeMetadata).alt}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> 
        </div>

        {/* Buy Card */}
        <div className="relative dark:bg-gray-800 bg-gray-100 flex flex-row justify-between items-center p-4 rounded-sm mb-8">
          <div className="mr-4 flex flex-col">
            <div className="font-bold text-lg opacity-80">
              Buy {props.listing.metadata!.name}
            </div>
            <a
              className="opacity-50 underline text-xs break-all"
              href={`https://explorer.strangemood.com/address/${props.listing.publicKey}`}
            >
              {`sol://${props.listing.publicKey}`}
            </a>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex flex-row justify-end items-center pr-4">
              {props.listing.metadata!.channels?.map(channel => renderChannelIcon(channel.name))}
            </div>
            <div className="relative flex rounded justify-center flex-row items-center top-10 dark:bg-black bg-white pl-4 dark:pr-1 dark:py-1 border dark:border-0 border-black w-min">
              <div className="mr-4 text-sm font-mono opacity-80">
                <div>${price}</div>
              </div>

              <button
                onClick={onCheckoutClicked}
                className={cn({
                  "flex px-4 py-2 transition-all text-green-800 dark:text-gray-900 bg-green-400 dark:bg-green-500 dark:hover:bg-green-400 dark:rounded-sm rounded-r-sm font-medium":
                    true,
                  "opacity-50 cursor-not-allowed animate-pulse": isLoading,
                })}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* About the Developer(s) */}
        {props.listing.metadata!.creators?.map(creator => (
          <div key={JSON.stringify(creator)} className="relative dark:bg-gray-800 bg-gray-100 flex flex-col p-4 my-2 rounded-sm">
            <div className="flex flex-row justify-between mb-1">
              <div className="flex flex-row items-center">
                {creator.primaryImage && (
                  <div className="mr-4 mb-2 flex flex-col">
                    <img
                      src={creator.primaryImage.src.uri}
                      className="w-14 h-14 object-contain rounded"
                      alt={creator.primaryImage.alt}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-sm opacity-50 uppercase">
                    About the Developer
                  </p>
                  <div className="font-bold text-lg opacity-80">
                    {creator.name}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center">
                {creator.links?.map(link => (
                  <a
                    key={link.url}
                    className="opacity-50 underline text-xs break-all mx-1"
                    href={link.url}
                  >
                    {link.type}
                  </a>
                ))}
              </div>
            </div>
            <p className="opacity-50 text-xs break-all">
              {creator.bio}
            </p>
          </div>
        ))}
      </div>

      <br />

      <div className="border-t dark:bg-black w-full p-4 opacity-50">
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
