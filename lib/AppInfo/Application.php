<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\DoomNextcloud\AppInfo;

use OCA\DoomNextcloud\Listener\ContentSecurityPolicyListener;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Security\CSP\AddContentSecurityPolicyEvent;

class Application extends App implements IBootstrap {

    public const APP_ID = 'doomnextcloud';

    public function __construct() {
        parent::__construct(self::APP_ID);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerEventListener(
            AddContentSecurityPolicyEvent::class,
            ContentSecurityPolicyListener::class
        );
    }

    public function boot(IBootContext $context): void {
        // Boot-time logic (e.g., registering event listeners) goes here.
        // For MVP this is intentionally empty.
    }
}
