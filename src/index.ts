/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {Keypair, PublicKey} from "@solana/web3.js";
import {
  getAccountStorageInfo,
  getArweave,
  getFileDataFromShadowDrive, getListObjects,
  uploadToShadowDrive
} from "./shadowDriveHelper";
import {Config} from "./Config";

export interface Env {
  PRIVATE_KEY: string;
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

declare type UploadRequest = {
  arweave: string;
}
const ARWEAVE = "https://arweave.net";

export default {
  async fetch(
      request: Request,
      env: Env,
      ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      const {pathname} = url;
      if (url.pathname === "/") {
        const responses = {
          "info": await getAccountStorageInfo(),
          "list": await getListObjects()
        }
        return new Response(JSON.stringify(responses, null, 2), {status: 200});
      }
      const filename = pathname.substring(1);
      const arweave = `${ARWEAVE}/${filename}`;
      const shadowAccount = new PublicKey(Config.SHADOW_ACCOUNT);

      // First we check if this file is already on Shadow Drive
      const shadowResp = await getFileDataFromShadowDrive(filename, shadowAccount); // fetch(`https://shdw-drive.genesysgo.net/${shadowAccount.toBase58()}/${filename}`);
      if (shadowResp !== null) {
        console.log(`File ${filename} is already on Shadow Drive`);
        // If it is, we return the file
        const shadowRespBuffer = Buffer.from(await shadowResp.arrayBuffer());
        return new Response(shadowRespBuffer, { status: 200 });
      }

      const shadowWallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(env.PRIVATE_KEY)));

      // Get the file content from arweave
      const arweaveResponse = await getArweave(arweave);
      if (arweaveResponse === null) {
        return new Response(`Couldn't fetch ${filename} from arweave`, { status: 500 });
      }
      const arweaveBuffer = Buffer.from(arweaveResponse);
      console.log(`Fetched ${filename} from arweave ${JSON.stringify(arweaveBuffer)}`);
      // Upload file to Shadow Drive
      const uploadResponse = await uploadToShadowDrive(filename, arweaveBuffer, shadowAccount, shadowWallet);
      if (uploadResponse === null) {
        return new Response(`Couldn't upload ${filename} to Shadow Drive`, { status: 500 });
      }
      console.log(`Uploaded ${filename} to Shadow Drive`);

      // After file is now on Shadow Drive , fetch it again and serve it
      const shadowResp2 = await getFileDataFromShadowDrive(filename, shadowAccount); // fetch(`https://shdw-drive.genesysgo.net/${shadowAccount.toBase58()}/${filename}`);
      if (shadowResp2 !== null) {
        console.log(`Fetched ${filename} from Shadow Drive`);
        const shadowRespBuffer2 = Buffer.from(await shadowResp2.arrayBuffer());
        return new Response(shadowRespBuffer2, {status: 200});
      } else {
        return new Response(`Couldn't find file ${filename}`, { status: 500 });
      }
    } catch (e: any) {
      return new Response(e.message);
    }
  },
};
