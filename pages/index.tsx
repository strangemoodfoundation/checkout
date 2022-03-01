import { ArrowRightIcon } from "@heroicons/react/solid";
import { AppleSVG, WindowsSVG } from "../components/icons";

export default function Checkout() {
  return (
    <div className="h-full w-full flex flex-col p-4 items-center pt-12 max-w-4xl m-auto">
      <div className="flex flex-row w-full items-end pb-4 px-4">
        <div className="w-full flex flex-col">
          <h1 className="text-2xl font-medium ">DummyTitle</h1>
          <p className="opacity-80">A small tagline could go here</p>
        </div>
        <div className="">share</div>
      </div>
      <div className="flex flex-row w-full pb-4">
        <div className="flex flex-col pr-4 flex-1 w-full">
          <div className="bg-gray-800 h-full w-full h-64 p-4"></div>
        </div>
        <div className="flex flex-col flex-1 w-full">
          <div className="bg-gray-800 h-full w-full h-64 p-4"></div>
        </div>
      </div>

      <div className="relative bg-gray-800 flex flex-row justify-between items-center p-4 w-full rounded-sm">
        <div className="mr-4 flex flex-col">
          <div className="font-bold text-xl">Buy DummyTitle</div>
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

export async function getStaticProps(context: any) {
  console.log(context);
  return {
    props: {}, // will be passed to the page component as props
  };
}
