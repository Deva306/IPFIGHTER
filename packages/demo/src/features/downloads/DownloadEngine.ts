import { downloadStore } from "./DownloadStore";
import { parseFilename } from "./DownloadDetector";

type Runtime = {
        controller: AbortController;
        chunks: Blob[];
        downloaded: number;
        total: number;
        mimeType: string;
        resumable: boolean;
};

const runtimes = new Map<string, Runtime>();

export async function startDownload(
        id: string,
        url: string,
        requestedFilename?: string
): Promise<void> {
        const existing = downloadStore.get(id);
        if (!existing) return;

        const previous = runtimes.get(id);
        const offset = previous?.downloaded ?? existing.downloadedBytes;
        const chunks = previous?.chunks ?? [];
        const controller = new AbortController();

        runtimes.set(id, {
                controller,
                chunks,
                downloaded: offset,
                total: existing.totalBytes,
                mimeType: existing.mimeType,
                resumable: existing.resumable,
        });

        downloadStore.update(id, { status: "downloading", error: undefined });

        try {
                const headers: Record<string, string> = {};

                if (offset > 0) {
                        headers.Range = `bytes=${offset}-`;
                }

                const response = await fetch(url, {
                        headers,
                        signal: controller.signal,
                        credentials: "include",
                });

                if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                }

                const contentLength = Number(response.headers.get("Content-Length") || 0);
                const acceptRanges =
                        response.headers.get("Accept-Ranges")?.toLowerCase() === "bytes";
                const contentRange = response.headers.get("Content-Range");

                if (offset > 0 && response.status !== 206) {
                        chunks.length = 0;
                        throw new Error(
                                "Resume unsupported: server did not return HTTP 206 Range response."
                        );
                }

                const total =
                        contentRange?.match(/\/(\d+)$/)?.[1] !== undefined
                                ? Number(contentRange.match(/\/(\d+)$/)?.[1])
                                : offset + contentLength;

                const mimeType =
                        response.headers.get("Content-Type") ||
                        existing.mimeType ||
                        "application/octet-stream";

                const filename =
                        requestedFilename ||
                        parseFilename(
                                url,
                                response.headers.get("Content-Disposition")
                        );

                const runtime = runtimes.get(id)!;
                runtime.total = total;
                runtime.mimeType = mimeType;
                runtime.resumable = acceptRanges || response.status === 206;

                downloadStore.update(id, {
                        filename,
                        mimeType,
                        totalBytes: total,
                        resumable: runtime.resumable,
                });

                if (!response.body) {
                        const blob = await response.blob();
                        runtime.chunks.push(blob);
                        runtime.downloaded = offset + blob.size;
                } else {
                        const reader = response.body.getReader();

                        while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;

                                const chunk = new Blob([value]);
                                runtime.chunks.push(chunk);
                                runtime.downloaded += value.byteLength;

                                downloadStore.update(id, {
                                        downloadedBytes: runtime.downloaded,
                                });
                        }
                }

                downloadStore.update(id, {
                        downloadedBytes: runtime.downloaded,
                        totalBytes: runtime.total || runtime.downloaded,
                        status: "completed",
                        resumable: runtime.resumable,
                });

                const finalBlob = new Blob(runtime.chunks, { type: runtime.mimeType });
                await saveFile(existing.filename, finalBlob);

                runtimes.delete(id);
        } catch (error) {
                const runtime = runtimes.get(id);

                if (error instanceof DOMException && error.name === "AbortError") {
                        const current = downloadStore.get(id);
                        if (current?.status !== "cancelled") {
                                downloadStore.update(id, {
                                        status: "paused",
                                        downloadedBytes: runtime?.downloaded ?? offset,
                                        resumable: runtime?.resumable ?? false,
                                });
                        }
                        return;
                }

                downloadStore.update(id, {
                        status: "failed",
                        error: error instanceof Error ? error.message : String(error),
                });
        }
}

export function pauseDownload(id: string): void {
        runtimes.get(id)?.controller.abort();
}

export function cancelDownload(id: string): void {
        runtimes.get(id)?.controller.abort();
        runtimes.delete(id);
        downloadStore.update(id, {
                status: "cancelled",
                error: undefined,
        });
}

async function saveFile(filename: string, blob: Blob): Promise<void> {
        const picker = (
                window as Window & {
                        showSaveFilePicker?: (options?: unknown) => Promise<{
                                createWritable: () => Promise<{
                                        write: (data: Blob) => Promise<void>;
                                        close: () => Promise<void>;
                                }>;
                        }>;
                }
        ).showSaveFilePicker;

        if (picker) {
                const handle = await picker({
                        suggestedName: filename,
                        startIn: "downloads",
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
        }

        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        anchor.click();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}
