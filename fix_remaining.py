with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "enrolledCourseIds.includes(\n                                  viewedCourse.id,\n                                )",
    "enrolledCourseIds.includes(String(viewedCourse.id))"
)

content = content.replace(
    "enrolledCourseIds.includes(\n                                c.id,\n                              )",
    "enrolledCourseIds.includes(String(c.id))"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
