// Custom Nightly wallet adapter for the Solana Wallet Adapter.
// Nightly (https://nightly.app) is the only wallet supported on Cookie Chain at launch,
// and there's no first-party @solana/wallet-adapter-nightly package, so we wrap its
// injected provider (`window.nightly.solana`) in the standard adapter interface.

import {
  WalletAdapter,
  WalletName,
  WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';

export const NIGHTLY_WALLET_NAME = 'Nightly' as WalletName;

type NightlyEvent = 'connect' | 'disconnect' | 'publicKey' | 'readyState';

interface NightlyProvider {
  isNightly?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
  signAndSendTransaction: <T extends Transaction | VersionedTransaction>(
    tx: T,
    opts?: { signers?: any[]; sendOptions?: any }
  ) => Promise<{ signature: TransactionSignature }>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  off?: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    nightly?: {
      solana?: NightlyProvider;
    };
  }
}

function getProvider(): NightlyProvider | null {
  if (typeof window === 'undefined') return null;
  return window.nightly?.solana ?? null;
}

export class NightlyWalletAdapter implements WalletAdapter {
  readonly name = NIGHTLY_WALLET_NAME;
  readonly url = 'https://nightly.app';
  readonly icon =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="%23F5A524"/><circle cx="11" cy="13" r="1.5" fill="%23071020"/><circle cx="20" cy="13" r="1.5" fill="%23071020"/><circle cx="11" cy="20" r="1.5" fill="%23071020"/><circle cx="20" cy="20" r="1.5" fill="%23071020"/></svg>';

  public get readyState(): WalletReadyState {
    const provider = getProvider();
    if (provider?.isNightly) return WalletReadyState.Installed;
    return WalletReadyState.NotDetected;
  }

  public publicKey: PublicKey | null = null;
  public connecting = false;
  public connected = false;

  private _publicKeyListeners = new Set<(pk: PublicKey | null) => void>();
  private _connectListeners = new Set<() => void>();
  private _disconnectListeners = new Set<() => void>();
  private _readyStateListeners = new Set<(state: WalletReadyState) => void>();

  constructor() {
    // Poll for provider injection (Nightly injects after document load sometimes)
    if (typeof window !== 'undefined') {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (this.readyState === WalletReadyState.Installed) {
          this._readyStateListeners.forEach((l) => l(this.readyState));
          return;
        }
        if (attempts < 20) setTimeout(check, 250);
      };
      setTimeout(check, 100);
    }
  }

  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;
    const provider = getProvider();
    if (!provider) {
      throw new Error('Nightly wallet not detected. Install from https://nightly.app');
    }
    this.connecting = true;
    try {
      const { publicKey } = await provider.connect();
      this.publicKey = publicKey;
      this.connected = true;
      this._emitConnect();
      this._emitPublicKey(publicKey);
    } catch (err) {
      throw err;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
      } catch {
        // ignore
      }
    }
    this.publicKey = null;
    this.connected = false;
    this._emitDisconnect();
    this._emitPublicKey(null);
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    const provider = getProvider();
    if (!provider || !this.connected) throw new Error('Wallet not connected');
    return provider.signTransaction(tx);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]> {
    const provider = getProvider();
    if (!provider || !this.connected) throw new Error('Wallet not connected');
    return provider.signAllTransactions(txs);
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<{ signature: TransactionSignature }> {
    const provider = getProvider();
    if (!provider || !this.connected) throw new Error('Wallet not connected');
    if (provider.signAndSendTransaction) {
      return provider.signAndSendTransaction(tx);
    }
    // Fallback: sign then send via connection
    const signed = await provider.signTransaction(tx);
    const connection = new Connection(
      // default to cookie chain rpc; in practice we'd grab from a singleton
      'https://rpc.cookiescan.io',
      'confirmed'
    );
    if (signed instanceof VersionedTransaction) {
      const signature = await connection.sendRawTransaction(signed.serialize());
      return { signature };
    }
    const signature = await connection.sendRawTransaction(signed.serialize());
    return { signature };
  }

  on(event: NightlyEvent, listener: (...args: any[]) => void): this {
    if (event === 'connect') this._connectListeners.add(listener as () => void);
    else if (event === 'disconnect') this._disconnectListeners.add(listener as () => void);
    else if (event === 'publicKey')
      this._publicKeyListeners.add(listener as (pk: PublicKey | null) => void);
    else if (event === 'readyState')
      this._readyStateListeners.add(listener as (s: WalletReadyState) => void);
    return this;
  }

  removeListener(event: NightlyEvent, listener: (...args: any[]) => void): this {
    if (event === 'connect') this._connectListeners.delete(listener as () => void);
    else if (event === 'disconnect') this._disconnectListeners.delete(listener as () => void);
    else if (event === 'publicKey')
      this._publicKeyListeners.delete(listener as (pk: PublicKey | null) => void);
    else if (event === 'readyState')
      this._readyStateListeners.delete(listener as (s: WalletReadyState) => void);
    return this;
  }

  private _emitConnect() {
    this._connectListeners.forEach((l) => {
      try {
        l();
      } catch {}
    });
  }
  private _emitDisconnect() {
    this._disconnectListeners.forEach((l) => {
      try {
        l();
      } catch {}
    });
  }
  private _emitPublicKey(pk: PublicKey | null) {
    this._publicKeyListeners.forEach((l) => {
      try {
        l(pk);
      } catch {}
    });
  }
}
