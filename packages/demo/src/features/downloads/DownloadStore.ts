import type { DownloadItem } from "./types";

type Listener = () => void;

const STORAGE_KEY = "devx-download-history-v2";

class DownloadStore {
        private items: DownloadItem[] = this.load();
        private listeners = new Set<Listener>();

        private load(): DownloadItem[] {
                try {
                        const raw = localStorage.getItem(STORAGE_KEY);
                        return raw ? (JSON.parse(raw) as DownloadItem[]) : [];
                } catch {
                        return [];
                }
        }

        private persist(): void {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
        }

        private notify(): void {
                this.persist();
                for (const listener of this.listeners) listener();
        }

        getItems(): DownloadItem[] {
                return [...this.items].sort((a, b) => b.createdAt - a.createdAt);
        }

        get(id: string): DownloadItem | undefined {
                return this.items.find((item) => item.id === id);
        }

        add(item: DownloadItem): void {
                this.items = [item, ...this.items.filter((x) => x.id !== item.id)];
                this.notify();
        }

        update(id: string, patch: Partial<DownloadItem>): void {
                this.items = this.items.map((item) =>
                        item.id === id
                                ? { ...item, ...patch, updatedAt: Date.now() }
                                : item
                );
                this.notify();
        }

        remove(id: string): void {
                this.items = this.items.filter((item) => item.id !== id);
                this.notify();
        }

        clearCompleted(): void {
                this.items = this.items.filter((item) => item.status !== "completed");
                this.notify();
        }

        subscribe(listener: Listener): () => void {
                this.listeners.add(listener);
                return () => this.listeners.delete(listener);
        }
}

export const downloadStore = new DownloadStore();
