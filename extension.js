const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

const DEFAULT_NAMESPACES = ["@kbn", "@repo", "@app"];

function activate(context) {
  const gotoPackageCommand = vscode.commands.registerCommand(
    "monorepoPackageLocator.gotoPackage",
    async () => {
      try {
        const workspaceRoot =
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
          return vscode.window.showErrorMessage("No workspace folder open");
        }

        const nodeModulesPath = path.join(workspaceRoot, "node_modules");
        if (!fs.existsSync(nodeModulesPath)) {
          return vscode.window.showErrorMessage(
            "node_modules folder not found"
          );
        }

        // Get user-configured namespace or auto-detect from defaults
        const config = vscode.workspace.getConfiguration(
          "monorepoPackageLocator"
        );
        const userNamespace = config.get("namespace", "");

        let namespacePath = null;
        let activeNamespace = null;

        if (userNamespace) {
          // User configured a specific namespace
          const candidatePath = path.join(nodeModulesPath, userNamespace);
          if (fs.existsSync(candidatePath)) {
            namespacePath = candidatePath;
            activeNamespace = userNamespace;
          } else {
            return vscode.window.showErrorMessage(
              `Configured namespace "${userNamespace}" not found in node_modules`
            );
          }
        } else {
          // Auto-detect from defaults
          for (const ns of DEFAULT_NAMESPACES) {
            const candidatePath = path.join(nodeModulesPath, ns);
            if (fs.existsSync(candidatePath)) {
              namespacePath = candidatePath;
              activeNamespace = ns;
              break;
            }
          }

          if (!namespacePath) {
            return vscode.window.showErrorMessage(
              `No package namespace found. Configure "monorepoPackageLocator.namespace" in settings with your namespace (e.g., @mycompany).`
            );
          }
        }

        // Scan for packages in the namespace directory
        const entries = fs.readdirSync(namespacePath, { withFileTypes: true });
        const packages = entries
          .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
          .map((entry) => entry.name)
          .sort();

        if (packages.length === 0) {
          return vscode.window.showInformationMessage(
            `No packages found in ${activeNamespace}`
          );
        }

        // Show quick pick
        const items = packages.map((pkg) => ({
          label: pkg,
          description: `${activeNamespace}/${pkg}`,
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: `Select a package from ${activeNamespace}`,
          matchOnDescription: true,
        });

        if (!selected) return;

        // Resolve symlink and navigate
        const packagePath = path.join(namespacePath, selected.label);
        const realPath = fs.realpathSync(packagePath);

        await revealInExplorer(realPath);
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(gotoPackageCommand);
}

async function revealInExplorer(targetPath) {
  const folderUri = vscode.Uri.file(targetPath);

  // Try to find a file inside to force folder expansion
  const commonFiles = ["package.json", "tsconfig.json", "index.ts", "index.js"];
  for (const file of commonFiles) {
    const filePath = path.join(targetPath, file);
    if (fs.existsSync(filePath)) {
      await vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(filePath)
      );
      await vscode.commands.executeCommand("revealInExplorer", folderUri);
      return;
    }
  }

  // Fallback: just reveal the folder
  await vscode.commands.executeCommand("revealInExplorer", folderUri);
}

function deactivate() {}

module.exports = { activate, deactivate };
