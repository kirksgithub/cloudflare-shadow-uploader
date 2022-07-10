import {Keypair, PublicKey} from "@solana/web3.js";
import {Config} from "./Config";
import nacl from "tweetnacl";
import bs58 from "bs58";
const crypto = require('crypto-browserify');

export async function getAccountStorageInfo(): Promise<ReadableStream | null> {
    try {
        const resp = await fetch(`${Config.SHADOW_DRIVE_ENDPOINT}/storage-account-info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                storage_account: Config.SHADOW_ACCOUNT,
            })
        });

        if (resp.status === 200) {
            return await resp.json();
        } else {
            return null;
        }
    } catch (e: any) {
        return null;
    }
}

export async function getListObjects() : Promise<ReadableStream | null> {
    try {
        const resp = await fetch(`${Config.SHADOW_DRIVE_ENDPOINT}/list-objects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                storageAccount: Config.SHADOW_ACCOUNT,
            })
        });

        if (resp.status === 200) {
            return await resp.json();
        } else {
            return null;
        }
    } catch (e: any) {
        return null;
    }

}

export async function uploadToShadowDrive(filename: string, data: Buffer, shadowAccount: PublicKey,
                                          shadowWallet: Keypair, filetype: string|null = null):
    Promise<ReadableStream | null> {
    try {
        const hashSum = crypto.createHash("sha256")
        const _hashedFileNames = hashSum.update(filename)
        const fileNamesHashed = hashSum.digest("hex")
        const fd = new FormData();

        if (filetype) {
            fd.append("file",
                new Blob([data], {type: filetype}),
                filename
            );
        } else {
            fd.append("file",
                new Blob([data]),
                filename
            );
        }

        const message = `Shadow Drive Signed Message:\nStorage Account: ${shadowAccount.toBase58()}\nUpload files with hash: ${fileNamesHashed}`;
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = nacl.sign.detached(encodedMessage, shadowWallet.secretKey);
        const signature = bs58.encode(signedMessage)

        fd.append("message", signature);
        fd.append("signer", shadowWallet.publicKey.toString());
        fd.append("storage_account", shadowAccount.toBase58());
        fd.append("fileNames", filename);
        const resp = await fetch(`${Config.SHADOW_DRIVE_ENDPOINT}/upload`, {
            method: "POST",
            body: fd,
        });
        return await resp.body
    } catch (e: any) {
        return null;
    }
}

export async function getArweave(url: string): Promise<ArrayBuffer|null> {
    try {
        const resp = await fetch(url);
        return resp.arrayBuffer();
    } catch (e: any) {
        return null;
    }
}

export async function getFileData(filename: string, shadowAccount: PublicKey): Promise<ReadableStream | null> {
    try {
        const resp = await fetch(`${Config.SHADOW_DRIVE_ENDPOINT}/get-object-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                location: `https://shdw-drive.genesysgo.net/${shadowAccount.toBase58()}/${filename}`
            })
        });
        if (resp.status === 200) {
            return await resp.json();
        } else {
            return null;
        }
    } catch (e: any) {
        return null;
    }
}

export async function getFileDataFromShadowDrive(filename: string, shadowAccount: PublicKey): Promise<Response | null> {
    try {
        const resp = await fetch(`https://shdw-drive.genesysgo.net/${shadowAccount.toBase58()}/${filename}`);
        if (resp.status === 200) {
            return resp;
        } else {
            return null;
        }
    } catch (e: any) {
        return null;
    }
}