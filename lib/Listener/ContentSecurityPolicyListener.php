<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\DoomNextcloud\Listener;

use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IRequest;
use OCP\Security\CSP\AddContentSecurityPolicyEvent;

/**
 * Adds the minimal extra CSP directives needed for DoomNextcloud pages.
 *
 * Directives added (additive only — Nextcloud merges these with its default policy):
 *   script-src: 'wasm-unsafe-eval'  — permits WebAssembly.compile() without allowing JS eval()
 *   worker-src: blob:               — permits future AudioWorklet / Web Worker blobs
 *
 * Scoped to the doomnextcloud app namespace: the listener returns early for all
 * other app requests so it does not affect Nextcloud's default CSP elsewhere.
 *
 * @template-implements IEventListener<AddContentSecurityPolicyEvent>
 */
class ContentSecurityPolicyListener implements IEventListener {

    public function __construct(private readonly IRequest $request) {
    }

    public function handle(Event $event): void {
        if (!$event instanceof AddContentSecurityPolicyEvent) {
            return;
        }

        // Scope check: only modify the policy for doomnextcloud routes.
        // The _route param is set by Nextcloud's router and follows the convention
        // "<appid>.<controller>.<method>" (e.g. "doomnextcloud.game.index").
        $route = (string) $this->request->getParam('_route', '');
        if (!str_starts_with($route, 'doomnextcloud.')) {
            return;
        }

        $policy = new ContentSecurityPolicy();

        // 'wasm-unsafe-eval' permits WebAssembly compilation APIs (WebAssembly.compile,
        // WebAssembly.instantiate, etc.) without granting the broader 'unsafe-eval'
        // permission that allows arbitrary JS string evaluation via eval() / new Function().
        // Supported: Chrome 95+, Firefox 102+, Safari 16+.
        $policy->addAllowedScriptDomain("'wasm-unsafe-eval'");

        // blob: in worker-src allows AudioWorklet and Web Worker instances constructed
        // from Blob URLs. Required for future audio worklet support; safe to add now.
        $policy->addAllowedWorkerSrcDomain('blob:');

        // The framework merges this policy with Nextcloud's default CSP.
        // Only addAllowed* methods are called — no reset or replace.
        $event->setCsp($policy);
    }
}
