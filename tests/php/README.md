# tests/php/ — PHP Unit & Integration Tests

PHP tests for DoomNextcloud server-side code.

## Status

**PLACEHOLDER** — Tests have not been written yet. This directory exists as a structural
placeholder so the CI job has a defined location.

## Planned test coverage

| Area | Type | Priority |
|------|------|----------|
| `GameController::index()` returns correct template | Unit | High |
| App registers in Nextcloud bootstrap | Integration | Medium |
| Routes resolve correctly | Integration | Medium |

## Setup (future)

```bash
# Install dev dependencies
composer install

# Run tests
./vendor/bin/phpunit tests/php/
```

## Framework

PHPUnit will be used, following Nextcloud's standard app testing conventions.
See: https://docs.nextcloud.com/server/latest/developer_manual/app_publishing_maintenance/app_testing.html
