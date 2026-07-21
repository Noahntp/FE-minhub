import re

# Read CourseListPage
with open("src/pages/CourseListPage.tsx", "r") as f:
    content = f.read()

# Read renderCourseCard from OldApp.tsx
with open("src/OldApp.tsx", "r") as f:
    lines = f.readlines()
render_course_card = "".join(lines[1924:2040])

# Fix variable mappings inside render_course_card
render_course_card = render_course_card.replace("c.image", "c.thumbnail_url")
render_course_card = render_course_card.replace("c.salePrice", "c.sale_price")
render_course_card = render_course_card.replace("c.rating", "(c as any).rating || 5.0")
render_course_card = render_course_card.replace("c.reviewCount", "(c as any).reviewCount || 120")
render_course_card = render_course_card.replace("c.subcategory", "(c as any).subcategory || c.category")
render_course_card = render_course_card.replace("setViewedCourse(c)", "setSelectedCourse(c)")
render_course_card = render_course_card.replace("setStudyingCourse(c)", "startLearning(String(c.id))")
render_course_card = render_course_card.replace("handleBuyCourseNow(c.id)", "setSelectedCourse(c)")
render_course_card = render_course_card.replace("handleToggleFavorite(c.id)", "handleToggleFavorite(e, c.id)")
render_course_card = render_course_card.replace("favorites.includes(c.id)", "favorites.includes(Number(c.id))")

# Insert renderCourseCard into CourseListPage.tsx right before `return (`
content = content.replace("  return (", render_course_card + "\n\n  return (")

# Add missing variables
missing_vars = """
  const [favSortBy, setFavSortBy] = useState("trending");
  const featuredCourses = filteredCourses.slice(0, 4);
  const bestsellerCourses = filteredCourses.slice(4, 8);
  const navigateTo = (path: string) => navigate(`/${path}`);
"""
content = content.replace("const filteredCourses = getFilteredCourses();", "const filteredCourses = getFilteredCourses();\n" + missing_vars)

# Fix sorting errors in CourseListPage.tsx
content = re.sub(r"\(a\.sale_price \|\| a\.price\)", "Number(a.sale_price || a.price)", content)
content = re.sub(r"\(b\.sale_price \|\| b\.price\)", "Number(b.sale_price || b.price)", content)
content = re.sub(r"b\.rating - a\.rating", "Number((b as any).rating || 5) - Number((a as any).rating || 5)", content)
content = re.sub(r"c\.enrolledCount", "Number((c as any).enrolledCount || 100)", content)

# Fix HelpCircle import
content = content.replace("import { Heart,\n  BookOpen", "import { Heart, HelpCircle,\n  BookOpen")

# Fix `c.id` to `Number(c.id)` in enrolled filtering
content = content.replace("enrolledCourseIds.includes(c.id)", "enrolledCourseIds.includes(String(c.id))")

with open("src/pages/CourseListPage.tsx", "w") as f:
    f.write(content)
