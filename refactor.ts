import { Project, SyntaxKind, IfStatement, Block } from 'ts-morph';

const project = new Project();
project.addSourceFileAtPath('src/services/api.ts');
const sourceFile = project.getSourceFileOrThrow('src/services/api.ts');

const apiServiceDec = sourceFile.getVariableDeclarationOrThrow('ApiService');
const apiServiceObj = apiServiceDec.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

const missingEndpoints = [
  'logoutAll', 'refreshToken', 'getSessions', 'revokeSession',
  'createAccountRequest', 'sendOtpForContactChange', 'verifyOtpContactChange',
  'getCategoriesWithCount', 'getBestsellerCourses', 'getCourseQuestions', 'addCourseQuestion', 'answerCourseQuestion', 'getInstructorCourses', 'getUserEnrollments', 'getUserActivities', 'getPublicCoursesByInstructor',
  'getInstructorEnrollmentStats', 'getInstructorRevenueChart', 'getInstructorTopCourses', 'getInstructorRevenueStats', 'getInstructorWithdrawals', 'getInstructorQAStats', 'getInstructorQuestions', 'replyToQuestion', 'deleteCourse', 'getInstructorLearners', 'getInstructorLearnerDetails',
  'getAccountRequests', 'resolveAccountRequest', 'updateOrderStatus', 'resolvePayoutRequest', 'toggleUserLockAdmin', 'getInstructorCoursesByAdmin',
  // System Utils
  'getConfig', 'setMode', 'setBaseUrl', 'setAuthToken', 'getVirtualLogs', 'clearVirtualLogs'
];

let replacedCount = 0;
let keptCount = 0;

for (const prop of apiServiceObj.getProperties()) {
  if (prop.isKind(SyntaxKind.MethodDeclaration) || prop.isKind(SyntaxKind.PropertyAssignment)) {
    let methodNode = prop;
    if (prop.isKind(SyntaxKind.PropertyAssignment)) {
      const init = prop.getInitializer();
      if (init && (init.isKind(SyntaxKind.ArrowFunction) || init.isKind(SyntaxKind.FunctionExpression))) {
        methodNode = init as any;
      } else {
        continue; // Not a function
      }
    }

    const methodName = prop.isKind(SyntaxKind.MethodDeclaration) ? prop.getName() : (prop.isKind(SyntaxKind.PropertyAssignment) ? prop.getName() : null);
    
    if (!methodName) continue;

    if (missingEndpoints.includes(methodName)) {
      // Add BACKEND_MISSING if not already there
      const body = (methodNode as any).getBody();
      if (body && body.isKind(SyntaxKind.Block)) {
        const text = body.getText();
        if (!text.includes('BACKEND_MISSING')) {
          body.insertStatements(0, '// BACKEND_MISSING');
        }
      }
      keptCount++;
      continue;
    }

    // Try to find the `if (config.mode === 'api')` block
    const body = (methodNode as any).getBody();
    if (body && body.isKind(SyntaxKind.Block)) {
      const statements = body.getStatements();
      let ifStatementIndex = -1;
      let ifStatementNode: IfStatement | null = null;
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.isKind(SyntaxKind.IfStatement)) {
          const condition = stmt.getExpression();
          if (condition.getText().includes("config.mode === 'api'")) {
            ifStatementIndex = i;
            ifStatementNode = stmt;
            break;
          }
        }
      }

      if (ifStatementNode) {
        // Extract statements to keep
        const statementsToKeep = [];
        // Keep everything before the if statement
        for (let i = 0; i < ifStatementIndex; i++) {
          statementsToKeep.push(statements[i].getText());
        }
        
        // Keep everything inside the if statement block
        const thenStatement = ifStatementNode.getThenStatement();
        if (thenStatement.isKind(SyntaxKind.Block)) {
          for (const stmt of thenStatement.getStatements()) {
            statementsToKeep.push(stmt.getText());
          }
        } else {
          statementsToKeep.push(thenStatement.getText());
        }

        // Replace the entire body
        body.replaceWithText(`{\n${statementsToKeep.join('\n')}\n}`);
        replacedCount++;
      } else {
        // Doesn't have the if statement, maybe it's already using apiFetch unconditionally
        if (body.getText().includes('apiFetch')) {
           // It's already using real API, do nothing
        }
      }
    }
  }
}

sourceFile.saveSync();
console.log(`Replaced MockDB for ${replacedCount} endpoints.`);
console.log(`Annotated ${keptCount} missing endpoints.`);
