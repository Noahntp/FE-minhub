import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("setEnrolledCourseIds(enrolledList.map((c) => c.id));", "setEnrolledCourseIds(enrolledList.map((c) => String(c.id)));")
content = content.replace("const purchasedIds = orderObj.courses.map((c) => c.id);", "const purchasedIds = orderObj.courses.map((c) => String(c.id));")
content = content.replace("o.courses.map((c) => c?.id)", "o.courses.map((c) => c?.id ? String(c.id) : null)")
content = content.replace("enrolledCourseIds.includes(c.id)", "enrolledCourseIds.includes(String(c.id))")
content = content.replace("enrolledCourseIds.includes(courseId)", "enrolledCourseIds.includes(String(courseId))")
content = content.replace("enrolledCourseIds.includes(viewedCourse.id)", "enrolledCourseIds.includes(String(viewedCourse.id))")
content = content.replace("enrolledCourseIds.includes(n.targetCourseId)", "enrolledCourseIds.includes(String(n.targetCourseId))")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
