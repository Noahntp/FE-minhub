"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var project = new ts_morph_1.Project();
project.addSourceFileAtPath('src/services/api.ts');
var sourceFile = project.getSourceFileOrThrow('src/services/api.ts');
var apiServiceDec = sourceFile.getVariableDeclarationOrThrow('ApiService');
var apiServiceObj = apiServiceDec.getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
var missingEndpoints = [
    'logoutAll', 'refreshToken', 'getSessions', 'revokeSession',
    'createAccountRequest', 'sendOtpForContactChange', 'verifyOtpContactChange',
    'getCategoriesWithCount', 'getBestsellerCourses', 'getCourseQuestions', 'addCourseQuestion', 'answerCourseQuestion', 'getInstructorCourses', 'getUserEnrollments', 'getUserActivities', 'getPublicCoursesByInstructor',
    'getInstructorEnrollmentStats', 'getInstructorRevenueChart', 'getInstructorTopCourses', 'getInstructorRevenueStats', 'getInstructorWithdrawals', 'getInstructorQAStats', 'getInstructorQuestions', 'replyToQuestion', 'deleteCourse', 'getInstructorLearners', 'getInstructorLearnerDetails',
    'getAccountRequests', 'resolveAccountRequest', 'updateOrderStatus', 'resolvePayoutRequest', 'toggleUserLockAdmin', 'getInstructorCoursesByAdmin',
    // System Utils
    'getConfig', 'setMode', 'setBaseUrl', 'setAuthToken', 'getVirtualLogs', 'clearVirtualLogs'
];
var replacedCount = 0;
var keptCount = 0;
for (var _i = 0, _a = apiServiceObj.getProperties(); _i < _a.length; _i++) {
    var prop = _a[_i];
    if (prop.isKind(ts_morph_1.SyntaxKind.MethodDeclaration) || prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
        var methodNode = prop;
        if (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment)) {
            var init = prop.getInitializer();
            if (init && (init.isKind(ts_morph_1.SyntaxKind.ArrowFunction) || init.isKind(ts_morph_1.SyntaxKind.FunctionExpression))) {
                methodNode = init;
            }
            else {
                continue; // Not a function
            }
        }
        var methodName = prop.isKind(ts_morph_1.SyntaxKind.MethodDeclaration) ? prop.getName() : (prop.isKind(ts_morph_1.SyntaxKind.PropertyAssignment) ? prop.getName() : null);
        if (!methodName)
            continue;
        if (missingEndpoints.includes(methodName)) {
            // Add BACKEND_MISSING if not already there
            var body_1 = methodNode.getBody();
            if (body_1 && body_1.isKind(ts_morph_1.SyntaxKind.Block)) {
                var text = body_1.getText();
                if (!text.includes('BACKEND_MISSING')) {
                    body_1.insertStatements(0, '// BACKEND_MISSING');
                }
            }
            keptCount++;
            continue;
        }
        // Try to find the `if (config.mode === 'api')` block
        var body = methodNode.getBody();
        if (body && body.isKind(ts_morph_1.SyntaxKind.Block)) {
            var statements = body.getStatements();
            var ifStatementIndex = -1;
            var ifStatementNode = null;
            for (var i = 0; i < statements.length; i++) {
                var stmt = statements[i];
                if (stmt.isKind(ts_morph_1.SyntaxKind.IfStatement)) {
                    var condition = stmt.getExpression();
                    if (condition.getText().includes("config.mode === 'api'")) {
                        ifStatementIndex = i;
                        ifStatementNode = stmt;
                        break;
                    }
                }
            }
            if (ifStatementNode) {
                // Extract statements to keep
                var statementsToKeep = [];
                // Keep everything before the if statement
                for (var i = 0; i < ifStatementIndex; i++) {
                    statementsToKeep.push(statements[i].getText());
                }
                // Keep everything inside the if statement block
                var thenStatement = ifStatementNode.getThenStatement();
                if (thenStatement.isKind(ts_morph_1.SyntaxKind.Block)) {
                    for (var _b = 0, _c = thenStatement.getStatements(); _b < _c.length; _b++) {
                        var stmt = _c[_b];
                        statementsToKeep.push(stmt.getText());
                    }
                }
                else {
                    statementsToKeep.push(thenStatement.getText());
                }
                // Replace the entire body
                body.replaceWithText("{\n".concat(statementsToKeep.join('\n'), "\n}"));
                replacedCount++;
            }
            else {
                // Doesn't have the if statement, maybe it's already using apiFetch unconditionally
                if (body.getText().includes('apiFetch')) {
                    // It's already using real API, do nothing
                }
            }
        }
    }
}
sourceFile.saveSync();
console.log("Replaced MockDB for ".concat(replacedCount, " endpoints."));
console.log("Annotated ".concat(keptCount, " missing endpoints."));
