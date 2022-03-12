import { ArrowRightIcon } from "@heroicons/react/solid";
import { AppleSVG, WindowsSVG } from "../components/icons";

export default function Checkout() {
  return (
    <div className="h-full w-full flex flex-col p-4 pt-12 max-w-4xl m-auto">
      <h1 className="text-xl font-bold mb-1">Oh hello!</h1>

      <p className="mb-2">
        This website lets you create checkout links for stuff sold on
        Strangemood, a new open protocol for buying and selling video games on
        the internet.
      </p>

      <p>
        You can read more about how Strangemood works at{" "}
        <a className="underline text-blue-500" href="https://strangemood.org">
          strangemood.org
        </a>
        .
      </p>
    </div>
  );
}
