import { request, gql } from "graphql-request";

export interface ListingMetadata {
  name: string;
  description: string;
  tagline: string;
  images: string[];
  primaryImage: string;
}

export async function getListingMetadata(
  uri: string
): Promise<ListingMetadata> {
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
    `https://www.openmetagraph.com/api/graphql?schema=QmUmLdYHHAqDYNnRGeKbHg4pxocFV1VAZuuHuRvdNiY1Bb&schema=QmRnQhScsXQvMtWNLNQJ3Hbxn2NCVBvaU4PPp37CYX54pr&schema=Qmd3ChXtpCAQqRkAySdJz1HerUoCnVJQT1aBTgizYLximQ`,
    query,
    {
      key: uri.replace("ipfs://", ""),
    }
  );

  return {
    name: data.get.name,
    description: data.get.description,
    tagline: "todo",
    images: data.get.images.map((image: any) => image.uri),
    primaryImage: data.get.primaryImage.uri,
  };
}
