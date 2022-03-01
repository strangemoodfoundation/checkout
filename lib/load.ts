import { request, gql } from "graphql-request";
import * as solana from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { fetchStrangemoodProgram, Strangemood } from "@strangemood/strangemood";
import { Program } from "@project-serum/anchor";

export interface Listing {
  publicKey: string;
  account: {
    isInitialized: boolean;
    isAvailable: boolean;
    isSuspended: boolean;
    isRefundable: boolean;
    isConsumable: boolean;
    uri: string;
    charter: string;
    authority: string;
    paymentDeposit: string;
    voteDeposit: string;
    price: string;
    mint: string;
  }; // The Solana account data
  cid: string; // The CID of the IPFS content
  currency: string; // The string of the mint
  metadata: {
    name: string;
    description: string;
    tagline: string;
    images: string[];
    primaryImage: string;
  }; // The IPFS metadata
}

export async function solanaPrice() {
  const resp = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );

  const { solana } = await resp.json();
  return solana.usd;
}

export async function getProvider(net: solana.Cluster) {
  let conn = new solana.Connection(
    net ? solana.clusterApiUrl(net) : "http://127.0.0.1:8899"
  );

  const keypair = solana.Keypair.generate();
  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.Provider(conn, wallet, {});
  anchor.setProvider(provider);

  return provider;
}

export async function getProgram(options?: {
  net?: solana.Cluster;
}): Promise<Program<Strangemood>> {
  if (options?.net === "devnet")
    throw new Error("Devnet is not supported, use testnet for now");

  const program = await fetchStrangemoodProgram(
    await getProvider(options?.net as any)
  );
  return program as any;
}

export async function loadAllListingPublicKeys(net: solana.Cluster) {
  const program = await getProgram({
    net,
  });

  const listings = await program.account.listing.all();
  return listings.map((l) => l.publicKey);
}

// Loads data from IPFS
export async function loadListing(
  publicKey: string,
  net: solana.Cluster
): Promise<Listing> {
  const program = await getProgram({
    net,
  });

  let account = await program.account.listing.fetch(
    new solana.PublicKey(publicKey)
  );
  const uri = account.uri;

  const deposit = await splToken.getAccount(
    program.provider.connection,
    account.paymentDeposit
  );

  const query = gql`
    query ($key: String) {
      get(key: $key) {
        name
        description
        primaryImage {
          uri
        }
        images {
          uri
        }
        creators {
          websiteURL
          twitterURL
          name
          description
        }
      }
    }
  `;

  const data = await request(
    `https://openmetagraph.com/api/graphql?schema=QmUmLdYHHAqDYNnRGeKbHg4pxocFV1VAZuuHuRvdNiY1Bb&schema=QmRnQhScsXQvMtWNLNQJ3Hbxn2NCVBvaU4PPp37CYX54pr&schema=Qmd3ChXtpCAQqRkAySdJz1HerUoCnVJQT1aBTgizYLximQ`,
    query,
    {
      key: uri,
    }
  );

  const listing: Listing = {
    publicKey: publicKey,
    currency: deposit.mint.toString(),
    account: {
      isInitialized: account.isInitialized,
      isAvailable: account.isAvailable,
      isSuspended: account.isSuspended,
      isRefundable: account.isRefundable,
      isConsumable: account.isConsumable,
      uri: account.uri,
      charter: account.charter.toString(),
      authority: account.authority.toString(),
      paymentDeposit: account.paymentDeposit.toString(),
      voteDeposit: account.voteDeposit.toString(),
      price: account.price.toString(),
      mint: account.mint.toString(),
    },
    cid: uri,
    metadata: {
      name: data.get.name,
      description: data.get.description,
      tagline: "todo",
      images: data.get.images.map((image: any) => image.uri),
      primaryImage: data.get.primaryImage.uri,
    },
  };

  return listing;
}
