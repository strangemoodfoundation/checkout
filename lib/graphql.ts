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
  rule: string;
  arguments: string[];
}

export interface ChannelNodeMetadata {
  precrypts: PrecryptNodeMetadata[];
  name: string;
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
  channels: ChannelNodeMetadata[];
}

const LISTING_METADATA_SCHEMA =
  "bafkreibopwmdififexwuea3kjqmvcgiokvfbbrc3jz6iutwqhl6gynsq3u";

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
          bio
          name
          links {
            url
            type
          }
          primaryImage {
            height
            width
            alt
            src {
              contentType
              uri
            }
          }
        }
        createdAt
        updatedAt
        links {
          type
          uri
        }
        images {
          height
          width
          alt
          src {
            uri
            contentType
          }
        }
        videos {
          width
          height
          src {
            uri
            contentType
          }
        }
        channels {
          name
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
            arguments
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
