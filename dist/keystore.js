import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ethers } from 'ethers';
export class QFCKeystore {
    storeDir;
    keystoreDir;
    metaPath;
    constructor(storeDir) {
        this.storeDir = storeDir ?? path.join(os.homedir(), '.openclaw', 'qfc-wallets');
        this.keystoreDir = path.join(this.storeDir, 'keystore');
        this.metaPath = path.join(this.storeDir, 'meta.json');
    }
    ensureDir() {
        fs.mkdirSync(this.keystoreDir, { recursive: true });
    }
    readMeta() {
        if (!fs.existsSync(this.metaPath))
            return [];
        const raw = fs.readFileSync(this.metaPath, 'utf-8');
        return JSON.parse(raw);
    }
    writeMeta(meta) {
        this.ensureDir();
        fs.writeFileSync(this.metaPath, JSON.stringify(meta, null, 2), 'utf-8');
        fs.chmodSync(this.metaPath, 0o600);
    }
    async saveWallet(wallet, password, opts) {
        this.ensureDir();
        const address = wallet.address.toLowerCase();
        const keystorePath = path.join(this.keystoreDir, `${address}.json`);
        const json = await wallet.encrypt(password);
        fs.writeFileSync(keystorePath, json, 'utf-8');
        fs.chmodSync(keystorePath, 0o600);
        const meta = this.readMeta();
        const existing = meta.findIndex((m) => m.address === address);
        const entry = {
            address,
            name: opts?.name ?? 'default',
            network: opts?.network ?? 'testnet',
            createdAt: new Date().toISOString(),
        };
        if (existing >= 0) {
            meta[existing] = entry;
        }
        else {
            meta.push(entry);
        }
        this.writeMeta(meta);
        return keystorePath;
    }
    async loadWallet(address, password) {
        const normalised = address.toLowerCase();
        const keystorePath = path.join(this.keystoreDir, `${normalised}.json`);
        if (!fs.existsSync(keystorePath)) {
            throw new Error(`No keystore found for ${address}`);
        }
        const json = fs.readFileSync(keystorePath, 'utf-8');
        return ethers.Wallet.fromEncryptedJson(json, password);
    }
    listWallets() {
        return this.readMeta();
    }
    removeWallet(address) {
        const normalised = address.toLowerCase();
        const keystorePath = path.join(this.keystoreDir, `${normalised}.json`);
        const meta = this.readMeta();
        const filtered = meta.filter((m) => m.address !== normalised);
        if (filtered.length === meta.length)
            return false;
        this.writeMeta(filtered);
        if (fs.existsSync(keystorePath)) {
            fs.unlinkSync(keystorePath);
        }
        return true;
    }
    getKeystoreJson(address) {
        const normalised = address.toLowerCase();
        const keystorePath = path.join(this.keystoreDir, `${normalised}.json`);
        if (!fs.existsSync(keystorePath))
            return null;
        const raw = fs.readFileSync(keystorePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.Crypto && !parsed.crypto) {
            parsed.crypto = parsed.Crypto;
            delete parsed.Crypto;
        }
        return JSON.stringify(parsed);
    }
}
