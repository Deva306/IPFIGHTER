import { type Component } from "dreamland/core";
import "./devx-home.css";

const DevXHome: Component = function () {
        return (
                <div class="devx-home">
                        <div class="devx-home-glow glow-one"></div>
                        <div class="devx-home-glow glow-two"></div>

                        <main class="devx-home-content">
                                <section class="devx-hero">
                                        <div class="devx-status-pill">
                                                <span class="devx-status-dot"></span>
                                                PRIVATE SESSION ACTIVE
                                        </div>

                                        <div class="devx-logo-orbit">
                                                <div class="devx-orbit orbit-one"></div>
                                                <div class="devx-orbit orbit-two"></div>
                                                <div class="devx-core">
                                                        <span>D</span>
                                                </div>
                                        </div>

                                        <p class="devx-kicker">DEVX // PRIVATE WEB SYSTEM</p>

                                        <h1>
                                                Browse beyond
                                                <span>limits.</span>
                                        </h1>

                                        <p class="devx-subtitle">
                                                A private, intelligent browsing workspace
                                                designed around speed, control and privacy.
                                        </p>

                                        <div class="devx-command">
                                                <span class="command-icon">⌕</span>
                                                <span class="command-placeholder">
                                                        Enter a destination or command...
                                                </span>
                                                <kbd>CTRL</kbd>
                                                <kbd>K</kbd>
                                        </div>
                                </section>

                                <section class="devx-dashboard">
                                        <div class="devx-card primary-card">
                                                <div class="card-top">
                                                        <span class="card-icon">◈</span>
                                                        <span class="card-label">SESSION</span>
                                                        <span class="card-live">LIVE</span>
                                                </div>

                                                <strong>Private browsing</strong>

                                                <p>
                                                        Your current browsing environment is
                                                        isolated and ready.
                                                </p>

                                                <div class="card-meter">
                                                        <span></span>
                                                </div>

                                                <div class="card-footer">
                                                        <span>SESSION SECURE</span>
                                                        <span>100%</span>
                                                </div>
                                        </div>

                                        <div class="devx-card">
                                                <div class="card-top">
                                                        <span class="card-icon cyan">⌁</span>
                                                        <span class="card-label">NETWORK</span>
                                                </div>

                                                <strong>Proxy transport</strong>

                                                <p>
                                                        Secure transport layer is connected.
                                                </p>

                                                <div class="network-status">
                                                        <span class="devx-status-dot"></span>
                                                        CONNECTED
                                                </div>
                                        </div>

                                        <div class="devx-card">
                                                <div class="card-top">
                                                        <span class="card-icon violet">◇</span>
                                                        <span class="card-label">WORKSPACE</span>
                                                </div>

                                                <strong>Developer tools</strong>

                                                <p>
                                                        Inspect, test and experiment inside
                                                        your private workspace.
                                                </p>

                                                <div class="workspace-tags">
                                                        <span>REQUESTS</span>
                                                        <span>PLAYGROUND</span>
                                                </div>
                                        </div>
                                </section>

                                <section class="devx-quick">
                                        <div class="quick-heading">
                                                <span>QUICK ACCESS</span>
                                                <i></i>
                                        </div>

                                        <div class="quick-grid">
                                                <div class="quick-item">
                                                        <span>⌂</span>
                                                        <div>
                                                                <strong>Browse</strong>
                                                                <small>Open the web</small>
                                                        </div>
                                                </div>

                                                <div class="quick-item">
                                                        <span>≡</span>
                                                        <div>
                                                                <strong>Requests</strong>
                                                                <small>Inspect traffic</small>
                                                        </div>
                                                </div>

                                                <div class="quick-item">
                                                        <span>◇</span>
                                                        <div>
                                                                <strong>Playground</strong>
                                                                <small>Build & test</small>
                                                        </div>
                                                </div>

                                                <div class="quick-item">
                                                        <span>⚙</span>
                                                        <div>
                                                                <strong>Settings</strong>
                                                                <small>Configure DevX</small>
                                                        </div>
                                                </div>
                                        </div>
                                </section>
                        </main>

                        <footer class="devx-home-footer">
                                <span>DEVX PRIVATE WEB BROWSER</span>
                                <span class="footer-line"></span>
                                <span>SECURE SESSION</span>
                                <span class="footer-spacer"></span>
                                <span>READY</span>
                                <span class="devx-status-dot"></span>
                        </footer>
                </div>
        );
};

export default DevXHome;
