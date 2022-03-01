import { request, gql } from "graphql-request";

export interface Listing {
  publicKey: string;
  account: {}; // The Solana account data
  cid: string; // The CID of the IPFS content
  metadata: {
    name: string;
    description: string;
    tagline: string;
    images: string[];
    primaryImage: string;
  }; // The IPFS metadata
}

// Loads data from IPFS
export async function loadListing(publicKey: string): Promise<Listing> {
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
      key: "ipfs://QmdJbxAMuXeytWw1rvinwrGUPu5GeyxT2HgnE8RfgZSoyY",
    }
  );
  console.log("data", JSON.stringify(data));

  const listing: Listing = {
    publicKey: "todo",
    account: "todo",
    cid: "QmdJbxAMuXeytWw1rvinwrGUPu5GeyxT2HgnE8RfgZSoyY",
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
