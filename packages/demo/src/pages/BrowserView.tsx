import {
        css,
        type Component,
        createState,
} from "dreamland/core";
import {
        CatchEscapedLinksPlugin,
        UrlWatcherPlugin,
} from "@mercuryworkshop/scramjet-utils";
import { versionInfo } from "@mercuryworkshop/scramjet";
import { cachePlugin, controller } from "..";
import { demoSettingsStore } from "../store";
import homepage from "./homepage.html?raw";
import type { Frame } from "@mercuryworkshop/scramjet-controller";

export const browserState = createState({
        url: demoSettingsStore.homeUrl,
        frame: null! as Frame,
});

export const Omnibox: Component = function () {
        const navigate = () => {
                let value = browserState.url.trim();

                if (!value) return;

                if (!/^https?:\/\//i.test(value)) {
                        value = `https://${value}`;
                }

                browserState.url = value;
                demoSettingsStore.homeUrl = value;
                browserState.frame?.go(value);
        };

        return (
                <div class="browser-toolbar">
                        <div class="navigation-controls">
                                <button
                                        type="button"
                                        title="Back"
                                        on:click={() => browserState.frame?.back()}
                                >
                                        ←
                                </button>
                                <button
                                        type="button"
                                        title="Forward"
                                        on:click={() => browserState.frame?.forward()}
                                >
                                        →
                                </button>
                                <button
                                        type="button"
                                        title="Reload"
                                        on:click={() => browserState.frame?.reload()}
                                >
                                        ↻
                                </button>
                        </div>

                        <form
                                class="address-form"
                                on:submit={(e: SubmitEvent) => {
                                        e.preventDefault();
                                        navigate();
                                }}
                        >
                                <div class="security-icon">✓</div>
                                <input
                                        id="search"
                                        class="address-input"
                                        type="text"
                                        value={use(browserState.url)}
                                        spellcheck="false"
                                        autocomplete="off"
                                        placeholder="Enter a website address..."
                                />
                                <button class="go-button" type="submit">
                                        Go
                                </button>
                        </form>

                        <div class="toolbar-label">
                                <span class="status-dot"></span>
                                PROXY
                        </div>
                </div>
        );
};

Omnibox.style = css`
        :scope {
                width: 100%;
                box-sizing: border-box;
        }

        .browser-toolbar {
                height: 58px;
                min-height: 58px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 14px;
                background: rgba(11, 13, 21, 0.96);
                border-bottom: 1px solid rgba(255, 255, 255, 0.07);
                box-sizing: border-box;
        }

        .navigation-controls {
                display: flex;
                gap: 3px;
        }

        .navigation-controls button {
                width: 32px;
                height: 32px;
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.035);
                color: #a6afc0;
                cursor: pointer;
                font-size: 17px;
        }

        .navigation-controls button:hover {
                background: rgba(255, 255, 255, 0.08);
                color: white;
        }

        .address-form {
                flex: 1;
                min-width: 0;
                height: 36px;
                display: flex;
                align-items: center;
                padding: 0 5px 0 11px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                background: #10131c;
                transition: 150ms ease;
        }

        .address-form:focus-within {
                border-color: rgba(99, 102, 241, 0.55);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
        }

        .security-icon {
                width: 20px;
                color: #22c55e;
                font-size: 12px;
                font-weight: 800;
        }

        .address-input {
                flex: 1;
                min-width: 0;
                height: 100%;
                border: 0;
                outline: 0;
                background: transparent;
                color: #e8ebf2;
                font: inherit;
                font-size: 12px;
        }

        .address-input::placeholder {
                color: #5e6677;
        }

        .go-button {
                height: 27px;
                padding: 0 13px;
                border: 0;
                border-radius: 7px;
                background: #4f46e5;
                color: white;
                cursor: pointer;
                font-size: 10px;
                font-weight: 700;
        }

        .go-button:hover {
                background: #6366f1;
        }

        .toolbar-label {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #657083;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.12em;
        }

        .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #22c55e;
                box-shadow: 0 0 8px rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 650px) {
                .toolbar-label {
                        display: none;
                }

                .browser-toolbar {
                        gap: 7px;
                        padding: 0 8px;
                }
        }
`;

const BrowserView: Component<
        { active: boolean },
        {},
        { frameel: HTMLIFrameElement }
> = function (cx) {
        cx.mount = async () => {
                await controller.wait();

                const urlWatcher = new UrlWatcherPlugin((url) => {
                        browserState.url = url;
                });

                const catchEscapedLinks = new CatchEscapedLinksPlugin(
                        (url) =>
                                new URL(
                                        `/?goto=${encodeURIComponent(url.href)}`,
                                        location.origin
                                )
                );

                browserState.frame = controller.createFrame(this.frameel, {
                        plugins: [cachePlugin, urlWatcher, catchEscapedLinks],
                });

                let realHomepage = homepage;

                realHomepage = realHomepage.replaceAll(
                        "{{SCRAMJET_VERSION}}",
                        String(versionInfo.version)
                );

                realHomepage = realHomepage.replaceAll(
                        "{{SCRAMJET_BUILD}}",
                        String(versionInfo.build)
                );

                realHomepage = realHomepage.replaceAll(
                        "{{SCRAMJET_DATE_PRETTY}}",
                        new Date(versionInfo.date).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                        })
                );

                this.frameel.src = `data:text/html;base64,${btoa(realHomepage)}`;

                const goto = new URL(location.href).searchParams.get("goto");

                if (goto) {
                        browserState.frame?.go(goto);
                        history.replaceState(null, "", location.href.split("?")[0]);
                }
        };

        return (
                <div
                        class={use(this.active).map(
                                (active) => `browser-frame ${active ? "active" : ""}`
                        )}
                >
                        <iframe this={use(this.frameel)} />
                </div>
        );
};

BrowserView.style = css`
        :scope {
                flex: 1;
                min-width: 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #0a0c12;
        }

        iframe {
                width: 100%;
                height: 100%;
                flex: 1;
                min-height: 0;
                border: 0;
                background: white;
        }
`;

export default BrowserView;
