<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Game shell template.
 * The WASM runtime will mount into #doomnextcloud-canvas-mount.
 */

use OCA\DoomNextcloud\AppInfo\Application;

/** @var \OCP\IL10N $l */
/** @var \OCP\Defaults $theme */

// Nextcloud content security policy nonce (required for inline scripts when Nextcloud CSP is active)
// $nonce is provided by Nextcloud's template engine automatically.

script(Application::APP_ID, 'main');   // loads public/js/main.js (built by Vite)
style(Application::APP_ID, 'app');     // loads public/css/app.css
?>

<div id="doomnextcloud-app" class="doomnextcloud-app">
    <div id="doomnextcloud-canvas-mount" class="doomnextcloud-canvas-mount">
        <!-- The WASM runtime will render into this canvas element -->
        <canvas id="doomnextcloud-canvas"
                tabindex="0"
                aria-label="<?php p($l->t('DoomNextcloud game canvas')); ?>">
        </canvas>

        <!-- Loading state overlay (hidden once WASM is ready) -->
        <div id="doomnextcloud-loading" class="doomnextcloud-loading" aria-live="polite">
            <span><?php p($l->t('Loading DoomNextcloud…')); ?></span>
        </div>

        <!-- Error state overlay (shown on load failure) -->
        <div id="doomnextcloud-error" class="doomnextcloud-error" hidden aria-live="assertive">
            <p><?php p($l->t('Failed to load the game. Check that Freedoom assets are installed correctly.')); ?></p>
        </div>
    </div>
</div>
