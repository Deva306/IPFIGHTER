import { downloadQueue } from "./DownloadQueue";
import { downloadStore } from "./DownloadStore";
import { cancelDownload, pauseDownload } from "./DownloadEngine";
import { isDownloadLink, parseFilename } from "./DownloadDetector";
import type { DownloadItem } from "./types";

function makeId(): string {
        return `dl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class DownloadManager {
        addUrl(url: string, filename?: string): string {
                const id = makeId();

                const item: DownloadItem = {
                        id,
                        url,
                        filename: filename || parseFilename(url),
                        mimeType: "application/octet-stream",
                        totalBytes: 0,
                        downloadedBytes: 0,
                        status: "queued",
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        resumable: false,
                };

                downloadStore.add(item);
                downloadQueue.enqueue(id);
                return id;
        }

        pause(id: string): void {
                pauseDownload(id);
        }

        cancel(id: string): void {
                downloadQueue.remove(id);
                cancelDownload(id);
        }

        retry(id: string): void {
                const item = downloadStore.get(id);
                if (!item) return;

                downloadStore.update(id, {
                        status: "queued",
                        error: undefined,
                        downloadedBytes: 0,
                        totalBytes: 0,
                });

                downloadQueue.enqueue(id);
        }

        removeHistory(id: string): void {
                downloadQueue.remove(id);
                downloadStore.remove(id);
        }

        clearHistory(): void {
                downloadStore.clearCompleted();
        }

        detectLink(url: string): boolean {
                return isDownloadLink(url);
        }
}

export const downloadManager = new DownloadManager();
