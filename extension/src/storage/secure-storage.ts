import { SecureStorage } from "@plasmohq/storage/secure"

export class SecureStore {
    private _storage: SecureStorage;

    constructor() {
        this._storage = new SecureStorage();

        this._setPassword(process.env.PLASMO_PUBLIC_SECURE_STORE_PASSWORD);
    }

    private async _setPassword(password: string): Promise<void> {
        await this._storage.setPassword(password);
    }

    public async getFromStorage(key: string): Promise<string | JSON> {
        return await this._storage.get(key)
    }

    public async setInStorage(key: string, value: any): Promise<null> {
        return await this._storage.set(key, value);
    }

    public async removeFromStorage(key: string): Promise<void> {
        return await this._storage.removeItem(key);
    }

    // Watch for changes for a specific key
    public watchStorage(key: string, callbackFn: (key: string, c: chrome.storage.StorageChange) => void) {
        return this._storage.watch({
            [key]: (c) => {
                callbackFn(key, c);
            }
        });
    }

    public async getAllStorage(): Promise<Record<string, string>> {
        return await this._storage.getAll();
    }

    public async clearStorage(): Promise<void> {
        return await this._storage.clear();
    }
}
