const DOWNLOAD_MIME_TYPES = new Set([
        "application/octet-stream",
        "application/zip",
        "application/x-7z-compressed",
        "application/x-rar-compressed",
        "application/pdf",
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const DOWNLOAD_EXTENSIONS =
        /\.(zip|7z|rar|pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|json|apk|exe|msi|dmg|iso|tar|gz|mp3|wav|mp4|mkv|webm|png|jpg|jpeg|gif|webp)$/i;

export function parseFilename(
        url: string,
        contentDisposition?: string | null
): string {
        const match = contentDisposition?.match(
                /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
        );

        if (match?.[1]) {
                try {
                        return decodeURIComponent(match[1]).trim();
                } catch {
                        return match[1].trim();
                }
        }

        try {
                const pathname = new URL(url, location.href).pathname;
                const name = decodeURIComponent(pathname.split("/").pop() || "");
                if (name) return name;
        } catch {
                // fall through
        }

        return "download";
}

export function isDownloadResponse(
        url: string,
        contentType?: string | null,
        contentDisposition?: string | null
): boolean {
        if (contentDisposition?.toLowerCase().includes("attachment")) return true;

        const mime = contentType?.split(";")[0].trim().toLowerCase() || "";
        if (DOWNLOAD_MIME_TYPES.has(mime)) return true;

        return DOWNLOAD_EXTENSIONS.test(url);
}

export function isDownloadLink(url: string): boolean {
        return DOWNLOAD_EXTENSIONS.test(url);
}
