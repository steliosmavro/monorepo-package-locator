# Monorepo Package Locator

Quickly navigate to package sources in your monorepo. No more hunting through scattered folders to find that one package.

## Features

### Go to Package

Search and jump to any package in your monorepo namespace.

- `Cmd + Shift + G`
- Command Palette → "Monorepo: Go to Package"

![Go to Package](https://github.com/steliosmavro/monorepo-package-locator/raw/main/images/go-to-package-command.gif)

### Go to Package Source (Right-click)

Right-click any symlinked package in `node_modules` to jump to its source.

![Go to Package Source](https://github.com/steliosmavro/monorepo-package-locator/raw/main/images/go-to-package-source.gif)

## Configuration

By default, the extension auto-detects common namespaces (`@kbn`, `@repo`, `@app`).

To set a custom namespace, add to your `.vscode/settings.json`:

```json
{
  "monorepoPackageLocator.namespace": "@mycompany"
}
```

## Installation

Search for "Monorepo Package Locator" in VSCode Extensions or run:

```bash
code --install-extension mavro.monorepo-package-locator
```

## License

MIT
