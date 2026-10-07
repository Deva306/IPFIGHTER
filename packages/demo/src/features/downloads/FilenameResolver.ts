export function resolveFilename(
    url: string,
    contentDisposition?: string | null,
): string {
    if (contentDisposition) {
        const utfMatch = contentDisposition.match(
            /filename\*=UTF-8''([^;]+)/i,
        );

        if (utfMatch?.[1]) {
            try {
                return decodeURIComponent(utfMatch[1].replace(/^["']|["']$/g, ""));
            } catch {
                return utfMatch[1].replace(/^["']|["']$/g, "");
            }
        }

        const filenameMatch = contentDisposition.match(
            /filename=["']?([^"';]+)["']?/i,
        );

        if (filenameMatch?.[1]) {
            return filenameMatch[1];
        }
    }

    try {
        const parsed = new URL(url);
        const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();

        if (lastSegment) {
            return decodeURIComponent(lastSegment);
        }
    } catch {
        // Fall through to the generic filename.
    }

    return "download";
}
