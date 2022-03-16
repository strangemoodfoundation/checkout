import { request, gql } from "graphql-request";

export interface FileMetadata {
  contentType: string;
  uri: string;
}

export interface ImageNodeMetadata {
  alt: string;
  height: number;
  width: number;
  src: FileMetadata;
}

export interface VideoNodeMetadata {
  height: number;
  width: number;
  src: FileMetadata;
}

export interface SocialLinkNodeMetadata {
  type: string;
  url: string;
}

export interface CreatorNodeMetadata {
  bio: string;
  links: SocialLinkNodeMetadata[];
  name: string;
  primaryImage: ImageNodeMetadata;
}

export interface PrecryptNodeMetadata {
  file: FileMetadata;
  key: FileMetadata;
  proxy: string;
  rule: string[];
}

export interface PlatformNodeMetadata {
  precrypts: PrecryptNodeMetadata[];
  type: string;
}

export interface FileNodeMetadata {
  name: string;
  src: string;
  type: string;
}

export interface ListingMetadata {
  name: string;
  description: string;
  primaryImage: ImageNodeMetadata;
  createdAt: number;
  updatedAt: number;
  creators: CreatorNodeMetadata[];
  images: ImageNodeMetadata[];
  links: SocialLinkNodeMetadata[];
  tags: string[];
  videos: VideoNodeMetadata[];
  platforms: PlatformNodeMetadata[];
}

const LISTING_METADATA_SCHEMA =
  "bafkreigkik6doxa5keakoqkughknmmmpwy73fssn6yhmxebir2frubgq7q";

export async function getListingMetadata(
  uri: string
): Promise<ListingMetadata> {
  const query = gql`
    query ($key: String) {
      get(key: $key) {
        name
        description
        primaryImage {
          height
          width
          alt
          src {
            contentType
            uri
          }
        }
        tags
        creators {
          name
          links {
            url
          }
        }
        createdAt
        images {
          height
          width
          alt
          src {
            uri
            contentType
          }
        }
        platforms {
          precrypts {
            key {
              uri
              contentType
            }
            file {
              uri
              contentType
            }
            rule
            proxy
          }
        }
      }
    }
  `;

  const data = await request(
    `https://www.openmetagraph.com/api/graphql?schema=${LISTING_METADATA_SCHEMA}`,
    query,
    {
      key: uri.replace("ipfs://", ""),
    }
  );

  return data.get;
}
