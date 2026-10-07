export type DownloadStatus =
        | "queued"
        | "downloading"
        | "paused"
        | "completed"
        | "failed"
        | "cancelled";

export interface DownloadItem {
        id: string;
        url: string;
        filename: string;
        mimeType: string;
        totalBytes: number;
        downloadedBytes: number;
        status: DownloadStatus;
        createdAt: number;
        updatedAt: number;
        error?: string;
        resumable: boolean;
}
