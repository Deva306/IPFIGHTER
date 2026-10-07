import { css, type Component } from "dreamland/core";
import { downloadStore } from "./DownloadStore";
import { downloadManager } from "./DownloadManager";
import { DownloadItem } from "./DownloadItem";
import type { DownloadItem as DownloadItemType } from "./types";

export const DownloadPanel: Component<
        {},
        {},
        {
                items: DownloadItemType[];
                url: string;
                cleanup: (() => void) | null;
        }
> = function () {
        this.items = downloadStore.getItems();
        this.url = "";
        this.cleanup = downloadStore.subscribe(() => {
                this.items = downloadStore.getItems();
        });

        return (
                <section class="downloads-panel">
                        <header class="downloads-header">
                                <div>
                                        <h2>Downloads</h2>
                                        <p>Queue, monitor, pause, resume and manage downloads.</p>
                                </div>

                                <button
                                        class="clear-button"
                                        on:click={() => downloadManager.clearHistory()}
                                >
                                        Clear completed
                                </button>
                        </header>

                        <div class="download-add">
                                <input
                                        value={use(this.url)}
                                        placeholder="Paste a download URL..."
                                        on:input={(event: Event) =>
                                                (this.url = (event.target as HTMLInputElement).value)
                                        }
                                        on:keydown={(event: KeyboardEvent) => {
                                                if (event.key === "Enter" && this.url.trim()) {
                                                        downloadManager.addUrl(this.url.trim());
                                                        this.url = "";
                                                }
                                        }}
                                />
                                <button
                                        on:click={() => {
                                                if (!this.url.trim()) return;
                                                downloadManager.addUrl(this.url.trim());
                                                this.url = "";
                                        }}
                                >
                                        Add Download
                                </button>
                        </div>

                        <div class="downloads-list">
                                {use(this.items).map((items) =>
                                        items.length ? (
                                                items.map((item) => <DownloadItem item={item} />)
                                        ) : (
                                                <div class="downloads-empty">
                                                        <div class="empty-icon">↓</div>
                                                        <strong>No downloads</strong>
                                                        <span>
                                                                Add a download URL to start.
                                                        </span>
                                                </div>
                                        )
                                )}
                        </div>
                </section>
        );
};

DownloadPanel.style = css`
        :scope {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                padding: 28px;
                overflow: auto;
                background: #07090f;
                color: #e8ebf2;
        }

        .downloads-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
        }

        h2 {
                margin: 0;
                font-size: 22px;
        }

        p {
                margin: 6px 0 0;
                color: #7f8798;
                font-size: 13px;
        }

        .download-add {
                display: flex;
                gap: 8px;
                margin-bottom: 18px;
        }

        .download-add input {
                min-width: 0;
                flex: 1;
                height: 40px;
                box-sizing: border-box;
                padding: 0 13px;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 9px;
                outline: none;
                background: rgba(255,255,255,.04);
                color: #e8ebf2;
        }

        .download-add button,
        .clear-button {
                height: 40px;
                padding: 0 14px;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 9px;
                background: rgba(99,102,241,.16);
                color: #dfe3ff;
                cursor: pointer;
        }

        .clear-button {
                background: rgba(255,255,255,.04);
        }

        .downloads-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
        }

        .downloads-empty {
                min-height: 260px;
                display: grid;
                place-items: center;
                align-content: center;
                gap: 7px;
                border: 1px dashed rgba(255,255,255,.1);
                border-radius: 14px;
                color: #7f8798;
        }

        .downloads-empty strong {
                color: #cbd2df;
        }

        .empty-icon {
                width: 46px;
                height: 46px;
                display: grid;
                place-items: center;
                border-radius: 12px;
                background: rgba(99,102,241,.12);
                color: #818cf8;
                font-size: 25px;
        }
`;
