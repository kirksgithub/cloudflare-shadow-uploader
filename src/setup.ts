import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {ShdwDrive} from "@shadow-drive/sdk";
import * as fs from "fs";

export function loadWalletKey(): Keypair {
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync("./wallet.json").toString()))
    );
    console.log(`wallet public key: ${loaded.publicKey}`);
    return loaded;
}

async function createStorageAccount() {
    const connection = new Connection("https://ssc-dao.genesysgo.net/");
    const keypair = loadWalletKey();
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const storageAcc = await drive.createStorageAccount("arweave-on-shadow", "100GB", "v2");
    const acc = new PublicKey(storageAcc.shdw_bucket);
    const getStorageAccount = await drive.getStorageAccount(acc);
    console.log(JSON.stringify( { getStorageAccount}, null, 2));
}

createStorageAccount().then(() => console.log("done"));