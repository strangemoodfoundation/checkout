import { AppleSVG, WindowsSVG } from "../../components/icons";
import { Listing, loadListing } from "../../lib/load";

export default function Checkout(props: { listing: Listing }) {
  if (!props.listing) {
    return <div>404 not found?</div>;
  }

  console.log(props.listing);

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
        <div className="flex flex-col  bg-gray-800 flex-1 w-full">
          <img
            src={props.listing.metadata.primaryImage}
            className=" w-full object-contain"
          />
          <p className="text-sm px-4 py-2 text-gray-200">
            {props.listing.metadata.description}
          </p>
        </div>
      </div>

      <div className="relative bg-gray-800 flex flex-row justify-between items-center p-4 w-full rounded-sm">
        <div className="mr-4 flex flex-col">
          <div className="font-bold text-xl">
            Buy {props.listing.metadata.name}
          </div>
          <a
            className="opacity-50 underline"
            href={`https://explorer.strangemood.com/address/somelistingid`}
          >
            {`sol://somelistingid`}
          </a>
        </div>
        <div>
          <div className="flex justify-end pr-4">
            <AppleSVG className="h-5 opacity-80 top-2 relative" />
          </div>
          <div className="relative flex rounded justify-center flex-row items-center top-10 bg-black pl-4 pr-1 py-1">
            <div className="mr-4 text-sm font-mono opacity-80">
              <div>$59.99</div>
            </div>
            <button className="flex px-4 py-2 transition-all bg-green-700 hover:bg-green-500 rounded-sm font-medium">
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
  const listing = await loadListing(context.params.publicKey, "testnet");

  return {
    props: {
      listing,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths(context: any) {
  return {
    paths: [
      {
        params: {
          publicKey: "somelistingid",
        },
      },
    ],
    fallback: true, // false or 'blocking'
  };
}
