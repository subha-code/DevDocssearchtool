// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
//const xmlParser = require("fast-xml-parser");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    const res = await axios.get("https://devdocs.io/feed")
    const parser = new XMLParser();
    const articles = parser.parse(res.data).feed.entry.map(
        article => {
            const linkMatch = article.summary.match(/href="([^"]*)"/);
            const link = linkMatch ? linkMatch[1] : '';
            return {
                label: article.title,
                // detail: article.description,
                link: link,
                summary: article.summary
            }
        })

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "dev-docs-search-tool" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('dev-docs-search-tool.searchDevDocs', async function() {
        // The code you place here will be executed every time your command is executed
        const searchContent = await vscode.window.showInputBox({
            placeHolder: 'Enter the content to search in Dev Docs'
        });
        if (!searchContent) {
            return;
        }
        const matchingArticles = articles.filter((article) => {
            return article.summary.toLowerCase().includes(searchContent.toLowerCase());
        });
        if (matchingArticles.length === 0) {
            vscode.window.showInformationMessage(`No articles found for '${searchContent}'`);
            return;
        }
        const article = await vscode.window.showQuickPick(matchingArticles, {
            matchOnDetail: true
        })
        if (article == null) return
        vscode.env.openExternal(article.link)
            // Display a message box to the user
            // vscode.window.showInformationMessage('searchDevDocs from Dev Docs Search Tool!');
    });
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}