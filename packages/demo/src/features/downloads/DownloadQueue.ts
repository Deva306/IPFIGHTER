import { downloadStore } from "./DownloadStore";
import { startDownload } from "./DownloadEngine";

class DownloadQueue {
        private queue: string[] = [];
        private running = false;

        enqueue(id: string): void {
                if (!this.queue.includes(id)) this.queue.push(id);
                downloadStore.update(id, { status: "queued", error: undefined });
                void this.process();
        }

        remove(id: string): void {
                this.queue = this.queue.filter((queuedId) => queuedId !== id);
        }

        private async process(): Promise<void> {
                if (this.running) return;

                const id = this.queue.shift();
                if (!id) return;

                const item = downloadStore.get(id);
                if (!item) {
                        void this.process();
                        return;
                }

                this.running = true;

                try {
                        await startDownload(id, item.url, item.filename);
                } finally {
                        this.running = false;
                        void this.process();
                }
        }
}

export const downloadQueue = new DownloadQueue();
