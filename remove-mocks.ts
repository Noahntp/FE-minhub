import { Project, SyntaxKind, Block } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths("src/services/api.ts");

const sourceFile = project.getSourceFileOrThrow("src/services/api.ts");

// Reverse iteration is not enough if we captured descendant nodes.
// Better to write a recursive function that walks the tree.
function processNode(node) {
    if (node.isKind(SyntaxKind.IfStatement)) {
        const condition = node.getExpression().getText();
        
        if (condition === "config.mode === 'mock'") {
            node.remove();
            return true; // Node was removed
        } else if (condition === "config.mode === 'api'") {
            const thenStmt = node.getThenStatement();
            let statementsToExtract = [];
            
            if (thenStmt.isKind(SyntaxKind.Block)) {
                statementsToExtract = thenStmt.getStatements().map(s => s.getText());
            } else {
                statementsToExtract = [thenStmt.getText()];
            }
            
            const parent = node.getParent();
            if (parent && parent.isKind(SyntaxKind.Block)) {
                const block = parent;
                const statements = block.getStatements();
                const index = statements.findIndex(s => s === node);
                
                if (index !== -1) {
                    for (let i = statements.length - 1; i > index; i--) {
                        statements[i].remove();
                    }
                    node.replaceWithText(statementsToExtract.join('\n'));
                    return true;
                }
            }
        }
    }
    
    // If not removed, process children
    let children = node.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
        try {
            if (!children[i].wasForgotten()) {
                processNode(children[i]);
            }
        } catch (e) {}
    }
    return false;
}

processNode(sourceFile);

// Remove mockDb and dummy data imports
const imports = sourceFile.getImportDeclarations();
for (const imp of imports) {
    if (imp.getModuleSpecifierValue().includes('mockDb') || imp.getModuleSpecifierValue().includes('data')) {
        imp.remove();
    }
}

sourceFile.saveSync();
console.log("Done refactoring api.ts");
