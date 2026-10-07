import { css, type Component } from "dreamland/core";
import type { DownloadItem } from "./types";

export const DownloadProgress: Component<{ item: DownloadItem }> = function () {
    const item = this.item;

    const percentage = () => {
        if (!item.totalBytes || item.totalBytes <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.round((item.downloadedBytes / item.totalBytes) * 100),
        );
    };

    return (
        <div class="devx-download-progress">
            <div class="devx-download-progress-track">
                <div
                    class="devx-download-progress-fill"
                    style={() => `width: ${percentage()}%`}
                />
            </div>
        </div>
    );
};

DownloadProgress.style = css`
    :scope {
        width: 100%;
    }

    .devx-download-progress-track {
        width: 100%;
        height: 4px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
    }

    .devx-download-progress-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #6366f1, #22d3ee);
        transition: width 180ms ease;
    }
`;
