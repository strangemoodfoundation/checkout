import { ArrowRightIcon } from "@heroicons/react/solid";
import { AppleSVG, WindowsSVG } from "../components/icons";

export default function Checkout() {
  return (
    <div className="h-full w-full flex p-4 items-center max-w-4xl m-auto">
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
