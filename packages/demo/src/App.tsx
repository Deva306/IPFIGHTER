import { css, type Component } from "dreamland/core";
import "./futuristic-theme.css";
import "./features/futuristic";
import BrowserView, { Omnibox } from "./pages/BrowserView";
import RequestViewer, { requestsState } from "./pages/RequestViewer";
import PlaygroundView from "./pages/Playground";
import SettingsView from "./pages/SettingsPage";
import DevXHome from "./features/futuristic/DevXHome";
import FlagEditor from "./components/FlagEditor";

const App: Component<
        {},
        {},
        {
                activeTab: "home" | "browser" | "requests" | "playground" | "settings";
        }
> = function () {
        this.activeTab ??= "home";

        return (
                <div class="app-shell">
                        <header class="app-header">
                                <div class="brand">
                                        <div class="brand-mark">
                                                <span>D</span>
                                        </div>
                                        <div class="brand-copy">
                                                <strong>DevX</strong>
                                                <small>Private Web Browser</small>
                                        </div>
                                </div>

                                <nav class="main-nav">
                                        <button
                                                class={use(this.activeTab).map(
                                                        (tab) =>
                                                                `nav-item ${tab === "home" ? "active" : ""}`
                                                )}
                                                on:click={() => (this.activeTab = "home")}
                                        >
                                                <span class="icon">✦</span>
                                                Home
                                        </button>

                                        <button
                                                class={use(this.activeTab).map(
                                                        (tab) =>
                                                                `nav-item ${tab === "browser" ? "active" : ""}`
                                                )}
                                                on:click={() => (this.activeTab = "browser")}
                                        >
                                                <span class="icon">⌂</span>
                                                Browser
                                        </button>

                                        <button
                                                class={use(this.activeTab).map(
                                                        (tab) =>
                                                                `nav-item ${tab === "requests" ? "active" : ""}`
                                                )}
                                                on:click={() => (this.activeTab = "requests")}
                                        >
                                                <span class="icon">≡</span>
                                                Requests
                                                {use(requestsState.requests).map((requests) =>
                                                        requests.length ? (
                                                                <span class="count">{requests.length}</span>
                                                        ) : (
                                                                ""
                                                        )
                                                )}
                                        </button>

                                        <button
                                                class={use(this.activeTab).map(
                                                        (tab) =>
                                                                `nav-item ${tab === "playground" ? "active" : ""}`
                                                )}
                                                on:click={() => (this.activeTab = "playground")}
                                        >
                                                <span class="icon">◇</span>
                                                Playground
                                        </button>

                                        <button
                                                class={use(this.activeTab).map(
                                                        (tab) =>
                                                                `nav-item ${tab === "settings" ? "active" : ""}`
                                                )}
                                                on:click={() => (this.activeTab = "settings")}
                                        >
                                                <span class="icon">⚙</span>
                                                Settings
                                        </button>
                                </nav>

                                <div class="header-actions">
                                        <div class="connection-status">
                                                <span class="status-dot"></span>
                                                Connected
                                        </div>
                                        <FlagEditor inline={true} />
                                </div>
                        </header>

                        <div
                                class={use(this.activeTab).map(
                                        (tab) =>
                                                `workspace ${tab === "browser" ? "browser-active" : ""}`
                                )}
                        >
                                <div
                                        class={use(this.activeTab).map(
                                                (tab) =>
                                                        `view home-view ${tab === "home" ? "visible" : ""}`
                                        )}
                                >
                                        <DevXHome />
                                </div>

                                <div
                                        class={use(this.activeTab).map(
                                                (tab) =>
                                                        `view browser-view-panel ${tab === "browser" ? "visible" : ""}`
                                        )}
                                >
                                        <Omnibox />
                                        <BrowserView
                                                active={use(this.activeTab).map(
                                                        (tab) => tab === "browser"
                                                )}
                                        />
                                </div>

                                <div
                                        class={use(this.activeTab).map(
                                                (tab) =>
                                                        `view requests-view ${tab === "requests" ? "visible" : ""}`
                                        )}
                                >
                                        <RequestViewer
                                                active={use(this.activeTab).map(
                                                        (tab) => tab === "requests"
                                                )}
                                        />
                                </div>

                                <div
                                        class={use(this.activeTab).map(
                                                (tab) =>
                                                        `view playground-view ${tab === "playground" ? "visible" : ""}`
                                        )}
                                >
                                        <PlaygroundView
                                                active={use(this.activeTab).map(
                                                        (tab) => tab === "playground"
                                                )}
                                        />
                                </div>

                                <div
                                        class={use(this.activeTab).map(
                                                (tab) =>
                                                        `view settings-view ${tab === "settings" ? "visible" : ""}`
                                        )}
                                >
                                        <SettingsView />
                                </div>
                        </div>

                        <footer class="app-footer">
                                <span>DevX</span>
                                <span class="footer-separator">•</span>
                                <span>Secure browsing</span>
                                <span class="footer-spacer"></span>
                                <span>Wisp Transport</span>
                                <span class="status-dot small"></span>
                        </footer>
                </div>
        );
};

App.style = css`
        :scope {
                width: 100vw;
                height: 100vh;
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                color: #eaf2ff;
                font-family:
                        Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                background:
                        radial-gradient(circle at 12% 0%, rgba(78, 111, 255, 0.20), transparent 28%),
                        radial-gradient(circle at 88% 8%, rgba(0, 229, 255, 0.12), transparent 25%),
                        radial-gradient(circle at 50% 100%, rgba(124, 58, 237, 0.10), transparent 35%),
                        #03050b;
                isolation: isolate;
        }

        :scope::before {
                content: "";
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: -1;
                opacity: 0.22;
                background-image:
                        linear-gradient(rgba(91, 120, 255, 0.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(91, 120, 255, 0.07) 1px, transparent 1px);
                background-size: 42px 42px;
                mask-image: linear-gradient(to bottom, black, transparent 88%);
        }

        :scope::after {
                content: "";
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 50;
                opacity: 0.035;
                background: repeating-linear-gradient(
                        to bottom,
                        transparent 0,
                        transparent 3px,
                        rgba(255,255,255,0.8) 4px
                );
        }

        .app-header {
                height: 70px;
                min-height: 70px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                gap: 28px;
                position: relative;
                z-index: 20;
                background:
                        linear-gradient(
                                180deg,
                                rgba(9, 14, 28, 0.96),
                                rgba(5, 8, 17, 0.90)
                        );
                border-bottom: 1px solid rgba(112, 139, 255, 0.16);
                box-shadow:
                        0 1px 0 rgba(255,255,255,0.025),
                        0 12px 45px rgba(0,0,0,0.30);
                backdrop-filter: blur(24px);
        }

        .app-header::after {
                content: "";
                position: absolute;
                left: 0;
                right: 0;
                bottom: -1px;
                height: 1px;
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(91, 118, 255, 0.65),
                        rgba(0, 229, 255, 0.55),
                        transparent
                );
                opacity: 0.8;
        }

        .brand {
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 205px;
        }

        .brand-mark {
                width: 38px;
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                border-radius: 11px;
                background:
                        linear-gradient(135deg, #5865ff, #6848ff 48%, #00d9ff);
                border: 1px solid rgba(255,255,255,0.22);
                box-shadow:
                        0 0 0 1px rgba(83, 105, 255, 0.18),
                        0 0 25px rgba(76, 91, 255, 0.34),
                        inset 0 1px 0 rgba(255,255,255,0.28);
                font-size: 12px;
                font-weight: 900;
                letter-spacing: -0.5px;
        }

        .brand-mark::before {
                content: "";
                position: absolute;
                width: 70px;
                height: 8px;
                transform: rotate(-45deg) translateY(-22px);
                background: rgba(255,255,255,0.28);
                filter: blur(5px);
        }

        .brand-copy {
                display: flex;
                flex-direction: column;
                gap: 2px;
        }

        .brand-copy strong {
                color: #f4f7ff;
                font-size: 16px;
                font-weight: 800;
                letter-spacing: -0.5px;
                text-shadow: 0 0 18px rgba(111, 130, 255, 0.28);
        }

        .brand-copy small {
                color: #6f7e9d;
                font-size: 8px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.18em;
        }

        .main-nav {
                display: flex;
                align-items: center;
                gap: 6px;
                height: 100%;
        }

        .nav-item {
                height: 38px;
                padding: 0 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                position: relative;
                border: 1px solid transparent;
                border-radius: 10px;
                background: rgba(255,255,255,0.015);
                color: #78849e;
                cursor: pointer;
                font: inherit;
                font-size: 11px;
                font-weight: 650;
                letter-spacing: 0.01em;
                transition:
                        color 160ms ease,
                        background 160ms ease,
                        border-color 160ms ease,
                        box-shadow 160ms ease,
                        transform 160ms ease;
        }

        .nav-item::before {
                content: "";
                position: absolute;
                left: 12px;
                right: 12px;
                bottom: 4px;
                height: 1px;
                opacity: 0;
                background: linear-gradient(90deg, #6675ff, #00ddff);
                box-shadow: 0 0 10px rgba(0,217,255,0.7);
                transition: opacity 160ms ease;
        }

        .nav-item:hover {
                color: #dce7ff;
                background: rgba(89, 111, 255, 0.08);
                border-color: rgba(105, 128, 255, 0.16);
                box-shadow: 0 0 20px rgba(68, 91, 255, 0.08);
                transform: translateY(-1px);
        }

        .nav-item.active {
                color: #ffffff;
                background:
                        linear-gradient(
                                135deg,
                                rgba(91, 105, 255, 0.18),
                                rgba(0, 209, 255, 0.07)
                        );
                border-color: rgba(103, 127, 255, 0.28);
                box-shadow:
                        inset 0 1px 0 rgba(255,255,255,0.07),
                        0 0 25px rgba(76, 91, 255, 0.10);
        }

        .nav-item.active::before {
                opacity: 1;
        }

        .icon {
                font-size: 14px;
                line-height: 1;
                color: #8193ff;
                text-shadow: 0 0 12px rgba(111, 130, 255, 0.6);
        }

        .count {
                min-width: 18px;
                height: 18px;
                padding: 0 5px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 99px;
                background: linear-gradient(135deg, #5968ff, #08cfff);
                color: white;
                font-size: 9px;
                font-weight: 800;
                box-shadow: 0 0 13px rgba(61, 123, 255, 0.38);
        }

        .header-actions {
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 16px;
        }

        .connection-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 7px 11px;
                border: 1px solid rgba(53, 211, 144, 0.12);
                border-radius: 999px;
                color: #8492aa;
                background: rgba(30, 210, 145, 0.035);
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                white-space: nowrap;
        }

        .status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #35e89b;
                box-shadow:
                        0 0 6px rgba(53, 232, 155, 0.9),
                        0 0 15px rgba(53, 232, 155, 0.55);
                animation: devxPulse 2s ease-in-out infinite;
        }

        .status-dot.small {
                width: 5px;
                height: 5px;
        }

        .workspace {
                flex: 1;
                min-height: 0;
                position: relative;
                overflow: hidden;
                background: rgba(2, 5, 12, 0.72);
        }

        .workspace::before {
                content: "";
                position: absolute;
                top: 0;
                left: 12%;
                right: 12%;
                height: 1px;
                pointer-events: none;
                background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(86, 110, 255, 0.45),
                        rgba(0, 220, 255, 0.35),
                        transparent
                );
                z-index: 5;
        }

        .view {
                position: absolute;
                inset: 0;
                display: none;
                overflow: hidden;
        }

        .view.visible {
                display: flex;
                animation: devxViewIn 180ms ease-out;
        }

        .browser-view-panel {
                flex-direction: column;
                background: #03060d;
        }

        .requests-view,
        .playground-view,
        .settings-view {
                flex-direction: column;
                background:
                        radial-gradient(circle at 50% 0%, rgba(74, 96, 255, 0.08), transparent 35%),
                        #050810;
        }

        .app-footer {
                height: 27px;
                min-height: 27px;
                padding: 0 15px;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
                z-index: 20;
                color: #4f5c73;
                background:
                        linear-gradient(
                                180deg,
                                rgba(6, 9, 18, 0.96),
                                rgba(3, 6, 12, 0.98)
                        );
                border-top: 1px solid rgba(94, 116, 255, 0.12);
                font-size: 8px;
                font-weight: 600;
                letter-spacing: 0.04em;
        }

        .app-footer::before {
                content: "";
                position: absolute;
                left: 0;
                top: -1px;
                width: 180px;
                height: 1px;
                background: linear-gradient(90deg, #5668ff, transparent);
                box-shadow: 0 0 10px rgba(86,104,255,0.55);
        }

        .footer-separator {
                color: #273149;
        }

        .footer-spacer {
                flex: 1;
        }

        @keyframes devxPulse {
                0%, 100% {
                        opacity: 0.65;
                        transform: scale(0.9);
                }
                50% {
                        opacity: 1;
                        transform: scale(1.08);
                }
        }

        @keyframes devxViewIn {
                from {
                        opacity: 0.7;
                }
                to {
                        opacity: 1;
                }
        }

        @media (max-width: 800px) {
                .app-header {
                        height: 62px;
                        min-height: 62px;
                        padding: 0 10px;
                        gap: 8px;
                }

                .brand {
                        min-width: auto;
                }

                .brand-copy,
                .connection-status {
                        display: none;
                }

                .main-nav {
                        flex: 1;
                        justify-content: center;
                }

                .nav-item {
                        height: 35px;
                        padding: 0 9px;
                }
        }
`;
 
export default App;
