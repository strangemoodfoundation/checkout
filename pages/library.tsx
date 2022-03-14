import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { LiHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { grabStrangemood } from "../components/useStrangemood";
import { pda, Listing } from "@strangemood/strangemood";
import * as splToken from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { getListingMetadata, ListingMetadata } from "../lib/graphql";
import { useRouter } from "next/router";
import useSwr from "swr";

function Layout(props: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-col w-full h-full ">
        <div className="px-4 py-1 border-b bg-gray-50 dark:bg-black dark:border-gray-700 text-sm">
          <div className="max-w-4xl mx-auto">
            <a
              className="underline text-gray-600 dark:text-gray-400"
              href="https://strangemood.org"
            >
              ☼
            </a>
          </div>
        </div>

        {props.children}
      </div>
    </>
  );
}

function WalletPage() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { visible, setVisible } = useWalletModal();

  return (
    <Layout>
      <div className="justify-center w-full flex flex-1  items-center">
        <div className="flex flex-col">
          <button
            onClick={() => setVisible(true)}
            className="transition-all relative hover:shadow-lg hover:shadow-blue-500/50 dark:bg-gray-800 hover:dark:bg-blue-900 hover:dark:border-blue-700 text-left p-4 border border-gray-700"
          >
            <h2 className="font-bold flex justify-between items-center backdrop-opacity-10">
              Login with a wallet
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </h2>
          </button>
          <div className="pt-4 px-4 w-96 text-sm dark:text-gray-400 text-gray-600">
            Connect a Solana Wallet to see your library. Consider using{" "}
            <a className="underline" href="https://glow.app/">
              Glow Wallet
            </a>{" "}
            on iOS, or{" "}
            <a className="underline" href="https://phantom.app/">
              Phantom{" "}
            </a>{" "}
            in a web browser.
          </div>
        </div>
      </div>
    </Layout>
  );
}

async function fetchLibrary(connection: any, wallet: any) {
  const program = await grabStrangemood(connection, wallet);

  const tokenAccounts =
    await program.provider.connection.getParsedProgramAccounts(
      splToken.TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // number of bytes
          },
          {
            memcmp: {
              offset: 32, // number of bytes
              bytes: program.provider.wallet.publicKey.toBase58(), // base58 encoded string
            },
          },
        ],
      }
    );

  let listings = (
    await Promise.all(
      tokenAccounts.map(async (token) => {
        const account = await splToken.getAccount(
          program.provider.connection,
          token.pubkey
        );
        let [listingPublicKey, _] = await pda.listing(
          program.programId,
          account.mint
        );
        const listingAccount = await program.provider.connection.getAccountInfo(
          listingPublicKey
        );
        if (!listingAccount) return undefined;
        const listing = await program.account.listing.fetch(listingPublicKey);

        try {
          const metadata = await getListingMetadata(listing.uri);

          return {
            account: listing as Listing,
            metadata: metadata,
            publicKey: listingPublicKey,
            amount: account.amount,
          };
        } catch (err) {
          return {
            account: listing as Listing,
            publicKey: listingPublicKey,
            amount: account.amount,
          };
        }
      })
    )
  ).filter((n) => n); // remove undefined

  return listings;
}

function useLibrary() {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [library, setLibrary] = useState<
    {
      account: Listing;
      publicKey: anchor.web3.PublicKey;
      amount: anchor.BN;
      metadata: ListingMetadata;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLibrary(connection, wallet).then((library) => {
      setLibrary(library as any);
      setLoading(false);
    });
  }, [wallet.connected]);

  return { library, loading };
}

function Skeleton() {
  return (
    <div className="animate-pulse flex space-x-4 p-2 max-w-4xl m-auto">
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2 bg-gray-700 rounded"></div>
        <div className="space-y-3">
          <div className="h-2 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// TODO: Make precrypt return json
// @ts-ignore
const textFetcher = (...args: any) => fetch(...args).then((res) => res.text());

function DownloadStatus({ uuid }: { uuid: string }) {
  const resp = useSwr<string>(
    `https://api.precrypt.org/file/status/${uuid}`,
    textFetcher,
    { refreshInterval: 200 }
  );

  if (!resp.data || resp.data != "Ready") {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin">Loading</div>
      </div>
    );
  }
  return (
    <a
      target={"_blank"}
      rel="noreferrer"
      href={`https://api.precrypt.org/file/${uuid}`}
      className="text-blue-500 underline"
    >
      Download Now!
    </a>
  );
}

function DownloadButton({ metadata }: { metadata: ListingMetadata }) {
  const { signMessage, publicKey } = useWallet();
  const [statusID, setStatusID] = useState<string>();

  async function onDownload(item: ListingMetadata) {
    const platform = item.platforms[0];
    if (!platform) return;
    if (!signMessage || !publicKey) return;

    const precrypt = platform.precrypts[0];
    if (!precrypt) return;

    const message = new TextEncoder().encode("precrypt");
    const signature = await signMessage(message as any);

    const resp = await fetch(`https://api.precrypt.org/file/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key_cid: precrypt.key.uri.replace("ipfs://", ""),
        sol_pubkey: Array.from(publicKey.toBytes()),
        sol_signed_message: Array.from(signature),
      }),
    });
    const { uuid } = await resp.json();
    setStatusID(uuid);
  }

  if (statusID) {
    return <DownloadStatus uuid={statusID} />;
  }

  return (
    <button
      onClick={() => onDownload(metadata)}
      className="border dark:border-gray-600 text-sm px-4 py-1 hover:opacity-50 transition-all flex"
    >
      Prepare Download
    </button>
  );
}

function LibraryPage() {
  const { library, loading } = useLibrary();
  const { signMessage, publicKey } = useWallet();
  const router = useRouter();

  async function onDownload(item: ListingMetadata) {
    const platform = item.platforms[0];
    if (!platform) return;
    if (!signMessage || !publicKey) return;

    const precrypt = platform.precrypts[0];
    if (!precrypt) return;

    const message = new TextEncoder().encode("precrypt");
    const signature = await signMessage(message as any);

    const resp = await fetch(`https://api.precrypt.org/file/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key_cid: precrypt.key.uri,
        sol_pubkey: Array.from(publicKey.toBytes()),
        sol_signed_message: Array.from(signature),
      }),
    });
    const { uuid } = await resp.json();
  }

  return (
    <Layout>
      <div className="w-full dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-4 ">
        <div className="max-w-4xl mx-auto text-sm flex justify-between items-center flex-row">
          <h1>All Games & Software</h1>
          <div className="text-gray-400">{library.length}</div>
        </div>
      </div>
      {loading ? (
        <Skeleton />
      ) : (
        library.map((item) => (
          <div
            className="px-4 py-2 w-full border-b dark:border-gray-700  "
            key={item.publicKey.toBase58()}
          >
            <div className="flex max-w-4xl m-auto">
              <img
                src={item.metadata?.primaryImage.src.uri}
                className="w-72 object-fill mr-4"
              />
              <div className="max-w-4xl mx-auto w-full flex flex-col">
                <div className="font-bold mb-1">
                  {item.metadata?.name || "unamed"}
                </div>
                <p className="dark:text-gray-400 text-gray-700 text-sm mb-2">
                  {item.metadata?.description || "no description"}
                </p>
                <div>
                  {item.metadata && <DownloadButton metadata={item.metadata} />}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}

export default function Library() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { visible, setVisible } = useWalletModal();

  if (!wallet.connected) {
    return <WalletPage />;
  }

  return <LibraryPage />;
}
