import { Project } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

function ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    if (!project.getDirectory(dirPath)) {
        project.createDirectory(dirPath);
    }
}

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    
    const splitKey = "MindHub-Frontend/src/";
    if (!filePath.includes(splitKey)) continue;
    const relPath = filePath.split(splitKey)[1];
    
    let newDir = "";

    // Apply rules
    if (relPath === "main.tsx" || relPath === "App.tsx") {
        newDir = "src/app";
    } else if (relPath === "types.ts" || relPath === "data.ts") {
        newDir = "src/shared";
    } else if (relPath.startsWith("components/ui/")) {
        newDir = path.join("src/shared/components/ui", path.dirname(relPath.replace("components/ui/", "")));
    } else if (relPath.startsWith("utils/") && relPath !== "utils/routes.ts") {
        newDir = "src/shared/utils";
    } else if (relPath.startsWith("lib/")) {
        newDir = "src/shared/lib";
    } else if (relPath.startsWith("components/Admin/")) {
        newDir = path.join("src/features/admin/components", path.dirname(relPath.replace("components/Admin/", "")));
    } else if (relPath === "components/AdminDashboard.tsx") {
        newDir = "src/features/admin";
    } else if (relPath.startsWith("components/InstructorDashboard/")) {
        newDir = path.join("src/features/instructor/components", path.dirname(relPath.replace("components/InstructorDashboard/", "")));
    } else if (relPath.startsWith("components/Instructor") && relPath !== "components/InstructorDashboard.tsx" && relPath !== "components/InstructorEnrollmentChart.tsx" && relPath !== "components/InstructorProfessional.tsx" && relPath !== "components/InstructorRevenue.tsx" && relPath !== "components/InstructorRevenueChart.tsx" && relPath !== "components/InstructorTopCourses.tsx" && relPath !== "components/InstructorWithdrawal.tsx") {
        newDir = "src/features/instructor/components";
    } else if (relPath === "components/InstructorDashboard.tsx" || relPath === "pages/InstructorPage.tsx" || relPath === "components/InstructorEnrollmentChart.tsx" || relPath === "components/InstructorProfessional.tsx" || relPath === "components/InstructorRevenue.tsx" || relPath === "components/InstructorRevenueChart.tsx" || relPath === "components/InstructorTopCourses.tsx" || relPath === "components/InstructorWithdrawal.tsx") {
        newDir = "src/features/instructor";
    } else if (relPath === "components/AuthScreens.tsx" || relPath === "components/OTPModal.tsx") {
        newDir = "src/features/auth/components";
    } else if (relPath === "pages/LoginPage.tsx" || relPath === "pages/RegisterPage.tsx") {
        newDir = "src/features/auth";
    } else if (relPath === "components/ClassroomScreen.tsx" || relPath === "components/CourseQA.tsx") {
        newDir = "src/features/classroom/components";
    } else if (relPath === "pages/ClassroomPage.tsx") {
        newDir = "src/features/classroom";
    } else if (relPath === "components/CourseImage.tsx" || relPath === "components/CategoryFilterBar.tsx" || relPath === "components/FreePreviewModal.tsx") {
        newDir = "src/features/courses/components";
    } else if (relPath === "pages/CourseListPage.tsx" || relPath === "pages/CourseDetailPage.tsx" || relPath === "pages/MyCoursesPage.tsx") {
        newDir = "src/features/courses";
    } else if (relPath === "components/CartAndCheckout.tsx" || relPath === "components/VNPayReturnPage.tsx") {
        newDir = "src/features/cart";
    } else if (relPath === "components/ProfilePage.tsx") {
        newDir = "src/features/profile";
    } else if (relPath.startsWith("features/QA/")) {
        newDir = path.join("src/features/qa", path.dirname(relPath.replace("features/QA/", "")));
    } else if (relPath.startsWith("features/Coupons/")) {
        newDir = path.join("src/features/coupons", path.dirname(relPath.replace("features/Coupons/", "")));
    } else if (relPath === "components/FooterLegal.tsx" || relPath === "components/ErrorBoundary.tsx") {
        newDir = "src/layouts";
    } else if (relPath === "utils/routes.ts") {
        newDir = "src/router";
    }
    
    if (newDir !== "") {
        ensureDir(newDir);
        sourceFile.moveToDirectory(project.getDirectory(newDir)!);
        console.log(`Moved ${relPath} to ${newDir}`);
    }
}

// Convert all relative imports to absolute aliases
for (const sourceFile of project.getSourceFiles()) {
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        if (moduleSpecifier.startsWith(".")) {
            const sourceFileDir = sourceFile.getDirectoryPath();
            const resolvedPath = path.resolve(sourceFileDir, moduleSpecifier);
            
            const srcIndex = resolvedPath.indexOf("MindHub-Frontend/src/");
            if (srcIndex !== -1) {
                const afterSrc = resolvedPath.substring(srcIndex + 21); // 21 is length of "MindHub-Frontend/src/"
                const newModuleSpecifier = "@/" + afterSrc;
                importDecl.setModuleSpecifier(newModuleSpecifier);
            }
        }
    }
}

project.saveSync();
console.log("TS morph refactoring complete!");

if (fs.existsSync("src/App.css")) {
    ensureDir("src/app");
    fs.renameSync("src/App.css", "src/app/App.css");
}
if (fs.existsSync("src/index.css")) {
    ensureDir("src/app");
    fs.renameSync("src/index.css", "src/app/index.css");
}
