import { PublicKey } from "@solana/web3.js";

export async function requestFile(args: {
  cid: string;
  publicKey: PublicKey;
  signature: string;
  proxyEndpoint?: string;
}) {
  const proxyEndpoint = args.proxyEndpoint || "https://api.precrypt.org";
  const body = JSON.stringify({
    key_cid: args.cid,
    sol_pubkey: Array.from(args.publicKey.toBytes()),
    sol_signed_message: Array.from(args.signature),
  });

  const resp = await fetch(`${proxyEndpoint}/file/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  const json = (await resp.json()) as { uuid: string };

  return json.uuid;
}

export async function getFileStatus(args: {
  uuid: string;
  proxyEndpoint?: string;
}): Promise<{ url: string; status: "ready" } | { status: "loading" }> {
  const resp = await fetch(`${args.proxyEndpoint}/file/status/${args.uuid}}`, {
    method: "GET",
  });

  const status = await resp.text();

  if (status === "Ready") {
    return {
      url: `${args.proxyEndpoint}/file/${args.uuid}`,
      status: "ready",
    };
  }

  return {
    status: "loading",
  };
}
