import re

with open("src/layouts/Navbar.tsx", "r") as f:
    content = f.read()

# Add missing imports from lucide-react
lucide_imports = "Search, X, Menu, Settings, Bell, BookOpen, User, Book, Heart, Users, MessageSquare, HelpCircle, LogOut, ChevronDown, ChevronRight, PlayCircle, Star, CheckCircle, Sparkles, Plus, Compass"
content = re.sub(r"import \{([^}]+)\} from \"lucide-react\";", f"import {{ {lucide_imports} }} from \"lucide-react\";", content)

# Add useLocation, useNavigate
if "import { useLocation, useNavigate" not in content:
    content = content.replace("import { Link } from \"react-router-dom\";", "import { Link, useLocation, useNavigate } from \"react-router-dom\";")

# Define missing states inside Navbar component
state_declarations = """
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'home';
  const navigateTo = (path: string) => navigate(`/${path}`);
  
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const cartItems: any[] = [];
  const notifications: any[] = [];
  const favorites: any[] = [];
  const enrolledCourseIds: any[] = [];
  
  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery}`);
  };
  
  const handleCategoryClick = (cat: string) => navigate(`/category/${cat}`);
  
  const currentUser = user || { id: '', name: '', role: 'student', avatar: '' };
  const isLoggedIn = !!user;
  const RoleLabels: any = { student: 'Học viên', instructor: 'Giảng viên', admin: 'Quản trị viên' };
  const AppRoutes = { profile: (id: string) => `profile` };
"""

# Inject states after `const handleLogout`
content = content.replace("const handleLogout = async () => {\n    await logout();\n    setUser(null);\n    window.location.href = \"/\";\n  };", "const handleLogout = async () => {\n    await logout();\n    setUser(null);\n    window.location.href = \"/\";\n  };\n" + state_declarations)

# Fix (e) => handleCategoryClick(c) -> need e.preventDefault() ? No, just string replacements
content = content.replace("onClick={() => navigateTo(\"auth\")}", "onClick={() => navigateTo(\"login\")}")
content = content.replace("onClick={() => setShowLogoutConfirm(true)}", "onClick={handleLogout}")

with open("src/layouts/Navbar.tsx", "w") as f:
    f.write(content)
