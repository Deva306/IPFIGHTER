import { css, type Component } from "dreamland/core";
import { downloadManager } from "./DownloadManager";
import type { DownloadItem as DownloadItemType } from "./types";

type Props = {
        item: DownloadItemType;
};

export const DownloadItem: Component<
        Props,
        {},
        {}
> = function () {
        const percent = () => {
                if (!this.item.totalBytes) return 0;
                return Math.min(
                        100,
                        Math.round(
                                (this.item.downloadedBytes / this.item.totalBytes) * 100
                        )
                );
        };

        return (
                <article class="download-card">
                        <div class="download-main">
                                <div class="download-icon">↓</div>

                                <div class="download-info">
                                        <strong>{this.item.filename}</strong>
                                        <span>{this.item.url}</span>

                                        <div class="download-progress">
                                                <div
                                                        class="download-progress-fill"
                                                        style={use(percent).map(
                                                                (value) => `width:${value}%`
                                                        )}
                                                ></div>
                                        </div>

                                        <small>
                                                {this.item.status === "downloading"
                                                        ? `${percent()}% • ${Math.round(
                                                                  this.item.downloadedBytes / 1024
                                                          )} KB`
                                                        : this.item.status === "completed"
                                                          ? "Completed"
                                                          : this.item.status === "paused"
                                                            ? "Paused"
                                                            : this.item.status === "failed"
                                                              ? this.item.error || "Failed"
                                                              : this.item.status}
                                        </small>
                                </div>

                                <div class="download-actions">
                                        {(this.item.status === "queued" ||
                                                this.item.status === "downloading") && (
                                                <button on:click={() => downloadManager.pause(this.item.id)}>
                                                        Pause
                                                </button>
                                        )}

                                        {this.item.status === "paused" && (
                                                <button on:click={() => downloadManager.retry(this.item.id)}>
                                                        Resume
                                                </button>
                                        )}

                                        {this.item.status === "failed" && (
                                                <button on:click={() => downloadManager.retry(this.item.id)}>
                                                        Retry
                                                </button>
                                        )}

                                        {(this.item.status === "queued" ||
                                                this.item.status === "downloading" ||
                                                this.item.status === "paused") && (
                                                <button on:click={() => downloadManager.cancel(this.item.id)}>
                                                        Cancel
                                                </button>
                                        )}

                                        {(this.item.status === "completed" ||
                                                this.item.status === "cancelled" ||
                                                this.item.status === "failed") && (
                                                <button on:click={() => downloadManager.removeHistory(this.item.id)}>
                                                        Remove
                                                </button>
                                        )}
                                </div>
                        </div>
                </article>
        );
};

DownloadItem.style = css`
        :scope {
                display: block;
        }

        .download-card {
                padding: 16px;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 12px;
                background: rgba(255,255,255,.035);
        }

        .download-main {
                display: flex;
                align-items: center;
                gap: 14px;
        }

        .download-icon {
                width: 40px;
                height: 40px;
                flex: 0 0 40px;
                display: grid;
                place-items: center;
                border-radius: 10px;
                background: rgba(99,102,241,.13);
                color: #818cf8;
                font-size: 20px;
        }

        .download-info {
                min-width: 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
        }

        .download-info strong {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #e8ebf2;
        }

        .download-info span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #737b8d;
                font-size: 11px;
        }

        .download-info small {
                color: #8d96a8;
                font-size: 11px;
        }

        .download-progress {
                height: 5px;
                overflow: hidden;
                border-radius: 99px;
                background: rgba(255,255,255,.07);
        }

        .download-progress-fill {
                height: 100%;
                border-radius: inherit;
                background: #6366f1;
                transition: width .15s ease;
        }

        .download-actions {
                display: flex;
                gap: 6px;
        }

        .download-actions button {
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 7px;
                padding: 7px 10px;
                background: rgba(255,255,255,.04);
                color: #cbd2df;
                cursor: pointer;
                font-size: 11px;
        }

        .download-actions button:hover {
                background: rgba(255,255,255,.08);
        }
`;
