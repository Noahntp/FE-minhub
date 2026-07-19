              {activeTab === "home" && (
                <>
                  {/* Elegant Current Courses Side-by-Side Layout */}
                  <div className="w-full">
                    {/* Left Side: Khóa học đang tham gia (Takes full space after removing right welcome box) */}
                    <div className="w-full bg-[#fcfcfc] border border-stone-150 rounded-3xl p-4 md:p-5 flex flex-col justify-between shadow-3xs text-left">
                      <div>
                        <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
                          <h3 className="text-sm md:text-base font-extrabold flex items-center gap-2 text-[#432c28]">
                            <BookOpen className="w-5 h-5 text-brand-normal" />{" "}
                            Khóa học đang tham gia
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-[#f5ece3] text-[#8b5e3c] font-bold px-2.5 py-1 rounded-md">
                              {
                                courses.filter((c) =>
                                  enrolledCourseIds.includes(c.id),
                                ).length
                              }{" "}
                              KHÓA ĐANG HỌC
                            </span>
                            {courses.filter((c) =>
                              enrolledCourseIds.includes(c.id),
                            ).length > 0 && (
                              <div className="hidden md:flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => {
                                    if (enrolledScrollRef.current) {
                                      enrolledScrollRef.current.scrollBy({
                                        left: -320,
                                        behavior: "smooth",
                                      });
                                    }
                                  }}
                                  aria-label="Cuộn sang trái"
                                  title="Cuộn sang trái"
                                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-[#8b5e3c] text-stone-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-200"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (enrolledScrollRef.current) {
                                      enrolledScrollRef.current.scrollBy({
                                        left: 320,
                                        behavior: "smooth",
                                      });
                                    }
                                  }}
                                  aria-label="Cuộn sang phải"
                                  title="Cuộn sang phải"
                                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-[#8b5e3c] text-stone-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-200"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!courses || !Array.isArray(courses) ? (
                          <div className="text-center py-12 text-stone-400 bg-white border border-brand-light-active rounded-3xl animate-pulse">
                            <p className="text-xs font-bold">
                              Đang tải dữ liệu khóa học đã tham gia...
                            </p>
                          </div>
                        ) : courses.filter(
                            (c) =>
                              c &&
                              Array.isArray(enrolledCourseIds) &&
                              enrolledCourseIds.includes(c.id),
                          ).length === 0 ? (
                          <div className="text-center py-12 text-stone-400 bg-white border border-dashed border-stone-300 rounded-3xl shadow-3xs p-8 space-y-3">
                            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                            <p className="text-sm font-bold text-stone-600">
                              Bạn chưa tham gia khóa học nào
                            </p>
                            <p className="text-xs font-medium text-stone-400 max-w-md mx-auto">
                              Hãy khám phá các khóa học tinh hoa trong danh sách
                              bên dưới và đăng ký để bắt đầu hành trình chinh
                              phục tri thức ngay hôm nay!
                            </p>
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  const el = document.getElementById(
                                    "available-courses-section",
                                  );
                                  if (el)
                                    el.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                }}
                                className="px-5 py-2.5 bg-deep-indigo hover:bg-midnight-teal text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
                              >
                                Khám phá khóa học ngay
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            ref={enrolledScrollRef}
                            className="flex gap-4 md:gap-5 overflow-x-auto flex-nowrap scrollbar-hide py-2 scroll-smooth"
                          >
                            {(() => {
                              const enrolledList = courses
                                .filter(
                                  (c) =>
                                    c &&
                                    Array.isArray(enrolledCourseIds) &&
                                    enrolledCourseIds.includes(c.id),
                                )
                                .sort((a, b) => {
                                  const timeA =
                                    (a as any).lastAccessedAt ||
                                    (a as any).updatedAt ||
                                    (a as any).enrolledAt ||
                                    a.createdAt ||
                                    "";
                                  const timeB =
                                    (b as any).lastAccessedAt ||
                                    (b as any).updatedAt ||
                                    (b as any).enrolledAt ||
                                    b.createdAt ||
                                    "";
                                  return timeB.localeCompare(timeA);
                                });
                              const topRecent = enrolledList.slice(0, 7);

                              return (
                                <>
                                  {topRecent.map((c) => {
                                    const compRate = c.completionRate || 60;
                                    const totalLessons =
                                      c.chapters?.reduce(
                                        (acc, ch) => acc + ch.lessons.length,
                                        0,
                                      ) || 12;
                                    const completedLessons = Math.round(
                                      (compRate / 100) * totalLessons,
                                    );
                                    let statusLabel = "Đang học";
                                    let badgeClass =
                                      "bg-amber-150 text-amber-950";
                                    if (compRate === 0) {
                                      statusLabel = "Chưa bắt đầu";
                                      badgeClass =
                                        "bg-stone-200 text-stone-800";
                                    } else if (compRate === 100) {
                                      statusLabel = "Hoàn thành";
                                      badgeClass =
                                        "bg-emerald-150 text-emerald-950";
                                    } else if (c.status === "rejected") {
                                      statusLabel = "Tạm khóa";
                                      badgeClass = "bg-rose-150 text-rose-950";
                                    }

                                    return (
                                      <div
                                        key={c.id}
                                        className="w-72 sm:w-80 shrink-0 border border-brand-light-active bg-white rounded-3xl overflow-hidden flex flex-col justify-between hover-glow-card transition-all duration-300 text-left shadow-xs"
                                      >
                                        <div className="relative">
                                          <img
                                            src={c.image}
                                            alt="Course banner"
                                            className="w-full h-36 object-cover"
                                          />
                                          <div className="absolute top-2 left-2">
                                            <span
                                              className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm ${badgeClass}`}
                                            >
                                              {statusLabel}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                                          <div>
                                            <span className="text-[10px] text-gray-500 block uppercase font-mono tracking-wider font-semibold">
                                              {c.subcategory}
                                            </span>
                                            <h4
                                              className="text-[14px] font-bold text-main-darker leading-snug line-clamp-2 hover:text-brand-normal cursor-pointer mt-1"
                                              onClick={() => setViewedCourse(c)}
                                            >
                                              {c.title}
                                            </h4>
                                            <p className="text-[11px] text-stone-500 mt-1 italic">
                                              Giảng viên: {c.instructorName}
                                            </p>
                                          </div>

                                          <div className="space-y-1.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-150">
                                            <div className="flex justify-between text-[10px] text-stone-600 font-semibold">
                                              <span>Tiến độ:</span>
                                              <span className="font-bold text-brand-normal font-mono">
                                                {compRate}% ({completedLessons}/
                                                {totalLessons})
                                              </span>
                                            </div>
                                            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden border border-stone-300">
                                              <div
                                                className="bg-brand-normal h-full animate-progress-fluid"
                                                style={{
                                                  width: `${compRate}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>

                                          <div className="border-t border-stone-100 pt-3 flex items-center justify-between gap-1.5">
                                            <button
                                              onClick={() => setViewedCourse(c)}
                                              className="flex-1 bg-[#f5ece3] hover:bg-[#dbcdc3] text-brand-dark text-[10.5px] font-bold py-2 px-2 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap border-none"
                                            >
                                              Chi tiết
                                            </button>
                                            <button
                                              onClick={() =>
                                                setStudyingCourse(c)
                                              }
                                              className="flex-1 bg-brand-normal hover:bg-brand-hover text-white text-[10.5px] font-bold py-2 px-2 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap shadow-sm border-none"
                                            >
                                              Tiếp tục học »
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Box 8: Xem tất cả action card */}
                                  <div
                                    onClick={() => navigateTo("my-courses")}
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Xem tất cả danh sách khóa học đã tham gia"
                                    className="w-72 sm:w-80 shrink-0 border border-dashed border-stone-300 bg-stone-50/60 hover:bg-[#faf6f2] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300 shadow-3xs hover:border-[#8b5e3c]"
                                  >
                                    <div className="w-12 h-12 rounded-full bg-white border border-stone-250 group-hover:border-[#8b5e3c] flex items-center justify-center text-[#8b5e3c] font-black text-xl mb-3 shadow-xs group-hover:scale-110 transition-transform">
                                      ...
                                    </div>
                                    <h4 className="text-xs font-bold text-stone-750 group-hover:text-[#8b5e3c] uppercase tracking-wider mb-1">
                                      Xem tất cả ({enrolledList.length})
                                    </h4>
                                    <p className="text-[11px] text-stone-500 max-w-[150px]">
                                      Chuyển đến trang quản lý toàn bộ khóa học
                                      đã tham gia
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NEW SECTION: DANH SÁCH KHÓA HỌC (AVAILABLE COURSES) WITH PAGINATION */}
                  <ScrollReveal delayMs={100}>
                    <div
                      id="available-courses-section"
                      className="space-y-6 pt-2"
                    >
                      <div className="bg-white border border-mist p-5 rounded-3xl space-y-4 shadow-xs">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-mist pb-4 text-left">
                          <div>
                            <h3 className="text-xl md:text-2xl font-extrabold text-deep-ink flex items-center gap-2">
                              <Compass className="w-6 h-6 text-deep-indigo" />{" "}
                              {(() => {
                                if (searchQuery)
                                  return `Kết quả tìm kiếm cho "${searchQuery}"`;
                                if (selectedSubcategory !== "All")
                                  return `Khóa học ${selectedSubcategory}`;
                                if (selectedCategory !== "All")
                                  return `Khóa học ${selectedCategory}`;
                                if (coursePurchaseFilter === "purchased")
                                  return "Khóa học đã tham gia";
                                if (coursePurchaseFilter === "unpurchased")
                                  return "Khóa học chưa tham gia";
                                if (sortBy === "rating")
                                  return "Khóa học được đánh giá cao nhất";
                                if (sortBy === "bestseller")
                                  return "Khóa học được học nhiều nhất";
                                return "Danh Sách Khóa Học";
                              })()}
                            </h3>
                            <p className="text-stone-500 text-xs">
                              Khám phá các khóa học tinh hoa chắt lọc được thiết
                              kế chuyên biệt cho mọi học viên.
                            </p>
                          </div>
                          <span className="text-[10px] bg-pale-cyan text-forest-teal font-bold px-3 py-1.5 rounded-md uppercase tracking-wider font-mono select-none">
                            {sortedCourses.length} KHÓA HỌC HIỆN CÓ
                          </span>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                          {/* Left: Search input */}
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onFocus={() => setShowMainSuggestions(true)}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowMainSuggestions(true);
                              }}
                              placeholder="Tìm khóa học, bài học, giảng viên..."
                              className="w-full text-xs pl-9 pr-3 py-2.5 border border-brand-light-active rounded-xl focus:ring-1 focus:ring-brand-normal focus:outline-none bg-slate-50"
                            />

                            {/* SUGGESTIONS MENU OVERLAY FOR CATALOG SEARCH */}
                            {showMainSuggestions &&
                              searchQuery.trim().length > 0 && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30 cursor-default bg-transparent"
                                    onClick={() =>
                                      setShowMainSuggestions(false)
                                    }
                                  />
                                  <div
                                    tabIndex={-1}
                                    className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8ded3] rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1"
                                  >
                                    {(() => {
                                      const list =
                                        getSearchSuggestions(searchQuery);
                                      if (list.length === 0) {
                                        return (
                                          <div className="p-3.5 text-[11px] text-stone-400 italic text-center">
                                            Không tìm thấy gợi ý trùng khớp.
                                          </div>
                                        );
                                      }
                                      return list.map((item, idx) => {
                                        let badgeColor =
                                          "bg-stone-50 text-stone-600";
                                        let typeLabel = "Bài học";
                                        if (item.type === "category") {
                                          badgeColor =
                                            "bg-amber-150 text-amber-900";
                                          typeLabel = "Danh mục";
                                        } else if (item.type === "instructor") {
                                          badgeColor =
                                            "bg-emerald-150 text-emerald-950";
                                          typeLabel = "Giảng viên";
                                        } else if (
                                          item.type === "subcategory"
                                        ) {
                                          badgeColor =
                                            "bg-sky-150 text-sky-950";
                                          typeLabel = "Chuyên đề";
                                        }
                                        return (
                                          <button
                                            key={idx}
                                            type="button"
                                            onClick={() =>
                                              handleSelectSuggestion(item)
                                            }
                                            className="w-full px-3.5 py-2 hover:bg-[#faf6f2] flex items-center justify-between transition-colors gap-2 text-left cursor-pointer border-none"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                              <span className="text-xs font-semibold text-stone-800 truncate leading-none">
                                                {item.value}
                                              </span>
                                            </div>
                                            <span
                                              className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0 ${badgeColor}`}
                                            >
                                              {typeLabel}
                                            </span>
                                          </button>
                                        );
                                      });
                                    })()}
                                  </div>
                                </>
                              )}
                          </div>

                          {/* Right: Purchase Filter & Sort dropdown */}
                          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end shrink-0">
                            {/* Trạng thái mua */}
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-gray-400 font-medium whitespace-nowrap">
                                Trạng thái mua:
                              </span>
                              <select
                                value={coursePurchaseFilter}
                                onChange={(e) =>
                                  setCoursePurchaseFilter(e.target.value as any)
                                }
                                aria-label="Bộ lọc trạng thái mua khóa học"
                                className="border border-stone-250 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-deep-indigo text-xs font-bold text-stone-750 shadow-3xs cursor-pointer hover:border-stone-300 transition-all"
                              >
                                <option value="all">Tất cả</option>
                                <option value="unpurchased">Chưa mua</option>
                                <option value="purchased">Đã mua</option>
                              </select>
                            </div>

                            {/* Sắp xếp theo */}
                            <div className="flex items-center gap-1.5 text-xs">
                              <ArrowUpDown className="w-4 h-4 text-gray-450" />
                              <span className="text-gray-400 font-medium whitespace-nowrap">
                                Sắp xếp theo:
                              </span>
                              <select
                                value={sortBy}
                                onChange={(e) =>
                                  setSortBy(e.target.value as any)
                                }
                                aria-label="Bộ lọc sắp xếp khóa học"
                                className="border border-stone-250 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-deep-indigo text-xs font-bold text-stone-750 shadow-3xs cursor-pointer hover:border-stone-300 transition-all"
                              >
                                <option value="newest">
                                  Khóa học mới nhất
                                </option>
                                <option value="rating">
                                  Đánh giá tốt nhất
                                </option>
                                <option value="bestseller">
                                  Bán chạy nhất
                                </option>
                                <option value="priceAsc">Giá tăng dần</option>
                                <option value="priceDesc">Giá giảm dần</option>
                                <option value="oldest">Khóa học cũ nhất</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Two-tiered Learning Categories and Subcategories */}
                        <div className="border-t border-stone-100 pt-4 space-y-3.5">
                          {/* Tier 1: Parent Categories */}
                          <CategoryFilterBar
                            categories={categoriesWithCount}
                            activeCategory={selectedCategory}
                            onSelectCategory={(cat) => {
                              setSelectedCategory(cat);
                              setSelectedSubcategory("All");
                            }}
                            allLabel="Tất cả phần"
                            colorScheme="indigo"
                            label={
                              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none shrink-0 mr-1">
                                Danh mục chính:
                              </span>
                            }
                          />

                          {/* Tier 2: Subcategories (nested/indented look) */}
                          {availableSubcategories.length > 0 && (
                            <CategoryFilterBar
                              categories={availableSubcategories}
                              activeCategory={selectedSubcategory}
                              onSelectCategory={setSelectedSubcategory}
                              allLabel="Tất cả chuyên đề"
                              colorScheme="brown"
                              label={
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider select-none shrink-0 mr-1 flex items-center gap-1">
                                  <Layers className="w-3.5 h-3.5 text-[#8b5e3c]" />{" "}
                                  Chuyên đề con:
                                </span>
                              }
                            />
                          )}
                        </div>
                      </div>

                      {/* Course grid with 4 columns on large screen */}
                      {paginatedCourses.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white border border-dashed rounded-2xl space-y-3 p-6">
                          {coursePurchaseFilter === "purchased" ? (
                            <>
                              <p className="font-semibold text-stone-600 text-sm">
                                Bạn chưa mua hoặc chưa đăng ký khóa học nào
                                trong danh mục này.
                              </p>
                              <p className="text-xs text-stone-400">
                                Hãy chuyển bộ lọc sang "Tất cả" hoặc "Chưa mua"
                                để khám phá các khóa học chất lượng cao của
                                chúng tôi!
                              </p>
                              <button
                                onClick={() => setCoursePurchaseFilter("all")}
                                className="mt-2 px-5 py-2 bg-brand-normal hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
                              >
                                Khám phá khóa học ngay
                              </button>
                            </>
                          ) : coursePurchaseFilter === "unpurchased" ? (
                            <>
                              <p className="font-semibold text-stone-600 text-sm">
                                Không còn khóa học nào chưa mua phù hợp với tiêu
                                chí lọc của bạn.
                              </p>
                              <p className="text-xs text-stone-400">
                                Bạn đã sở hữu toàn bộ khóa học trong danh mục
                                này hoặc bộ lọc tìm kiếm chưa trùng khớp.
                              </p>
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  setSelectedCategory("All");
                                  setSelectedSubcategory("All");
                                  setCoursePurchaseFilter("all");
                                }}
                                className="mt-2 px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-stone-300"
                              >
                                Xóa toàn bộ bộ lọc
                              </button>
                            </>
                          ) : (
                            <p className="font-semibold text-stone-500">
                              Không tìm thấy khóa học nào phù hợp với yêu cầu
                              tìm kiếm của bạn.
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedCourses.map((c) => renderCourseCard(c))}
                          </div>

                          {/* Elegant Pagination controls */}
                          {totalCoursesPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-6 pb-2">
                              <button
                                onClick={() =>
                                  setCoursesPage((prev) =>
                                    Math.max(1, prev - 1),
                                  )
                                }
                                disabled={safeCoursesPage === 1}
                                className="p-2 rounded-xl border border-brand-light-active bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer animate-none"
                                title="Trang trước"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalCoursesPages }).map(
                                  (_, idx) => {
                                    const pageNum = idx + 1;
                                    const isCurrent =
                                      pageNum === safeCoursesPage;
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => setCoursesPage(pageNum)}
                                        className={`w-8.5 h-8.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                                          isCurrent
                                            ? "bg-deep-indigo text-white border-deep-indigo shadow-xs scale-105"
                                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  },
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  setCoursesPage((prev) =>
                                    Math.min(totalCoursesPages, prev + 1),
                                  )
                                }
                                disabled={safeCoursesPage === totalCoursesPages}
                                className="p-2 rounded-xl border border-brand-light-active bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer animate-none"
                                title="Trang sau"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* FAQ banner helper panel in integrated layout */}
                      <div className="bg-brand-light/40 border border-brand-light-active p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-left">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-brand-normal shrink-0" />
                          <div>
                            <h4 className="font-bold text-brand-dark text-xs">
                              Có câu hỏi về MindHub?
                            </h4>
                            <p className="text-gray-500 text-[10.5px]">
                              Chính sách cam kết hoàn trả 100% học liệu số trong
                              7 ngày nếu không hài lòng.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigateTo("legal")}
                          className="bg-white hover:bg-stone-50 border border-brand-light-active rounded-xl px-4 py-2 text-xs text-[#8b5e3c] font-bold transition-all shadow-3xs shrink-0 cursor-pointer"
                        >
                          Xem câu hỏi phổ biến »
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                  {/* FEATURED COURSES SECTION */}
                  {featuredCourses && featuredCourses.length > 0 && (
                    <ScrollReveal delayMs={120}>
                      <div className="bg-white border border-mist p-5 rounded-3xl space-y-4 shadow-xs mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-mist pb-4 text-left">
                          <div>
                            <h3 className="text-xl md:text-2xl font-extrabold text-deep-ink flex items-center gap-2">
                              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />{" "}
                              Khóa Học Nổi Bật
                            </h3>
                            <p className="text-stone-500 text-xs">
                              Các khóa học được đội ngũ chuyên gia của MindHub
                              đánh giá cao và đề xuất cho bạn.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {featuredCourses.map((c) => renderCourseCard(c))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* BESTSELLER COURSES SECTION */}
                  {bestsellerCourses && bestsellerCourses.length > 0 && (
                    <ScrollReveal delayMs={140}>
                      <div className="bg-[#fdfbf7] border border-brand-light-active p-5 rounded-3xl space-y-4 shadow-xs mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-brand-light-active pb-4 text-left">
                          <div>
                            <h3 className="text-xl md:text-2xl font-extrabold text-brand-dark flex items-center gap-2">
                              <TrendingUp className="w-6 h-6 text-brand-normal" />{" "}
                              Khóa Học Bán Chạy Nhất
                            </h3>
                            <p className="text-stone-500 text-xs">
                              Tham gia cùng hàng ngàn học viên khác trong các
                              khóa học thịnh hành nhất của chúng tôi.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {bestsellerCourses.map((c) => renderCourseCard(c))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                  {/* SECTION 2: TOP KHÓA HỌC ĐƯỢC YÊU THÍCH NHẤT */}
                  <ScrollReveal delayMs={150}>
                    <div className="bg-[#fcfcfc] border border-stone-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-3xs">
                      {(() => {
                        const rankingOptions = [
                          {
                            value: "favoritesDesc",
                            label: "Yêu thích nhiều nhất",
                            title:
                              "Xếp hạng khóa học theo Yêu thích nhiều nhất",
                          },
                          {
                            value: "ratingDesc",
                            label: "Đánh giá tốt nhất",
                            title: "Xếp hạng khóa học theo Đánh giá tốt nhất",
                          },
                          {
                            value: "priceAsc",
                            label: "Giá thấp nhất",
                            title: "Xếp hạng khóa học theo Giá thấp nhất",
                          },
                        ];
                        const currentOption = rankingOptions.find(
                          (o) => o.value === favSortBy,
                        );
                        const dynamicTitle = currentOption
                          ? currentOption.title
                          : "Xếp hạng khóa học";

                        return (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                            <div className="space-y-0.5">
                              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2 text-[#432c28]">
                                <Heart className="w-5 h-5 fill-deep-indigo text-deep-indigo" />{" "}
                                {dynamicTitle}
                              </h3>
                              <p className="text-[10.5px] text-stone-500">
                                Những khóa học học thuật đỉnh cao thu hút đông
                                đảo lượng quan tâm thảo luận nhất tuần qua.
                              </p>
                            </div>

                            {/* Sort favorites controls */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <span className="text-[10.5px] text-stone-400 font-bold">
                                Sắp xếp:
                              </span>
                              <select
                                value={favSortBy}
                                onChange={(e) =>
                                  setFavSortBy(e.target.value as any)
                                }
                                aria-label="Bộ lọc xếp hạng khóa học"
                                className="border border-stone-250 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-deep-indigo text-xs font-bold text-stone-750 shadow-3xs cursor-pointer hover:border-stone-300 transition-all"
                              >
                                {rankingOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Grid of Top Favorited Courses */}
                      {(() => {
                        // Attach virtual favoriteCount & sort
                        const sortedFavs = [...courses]
                          .map((c) => ({
                            ...c,
                            favoriteCount: Math.floor(
                              c.enrolledCount * 0.45 +
                                c.reviewCount * 1.6 +
                                c.rating * 15,
                            ),
                          }))
                          .sort((a, b) => {
                            if (favSortBy === "favoritesDesc")
                              return b.favoriteCount - a.favoriteCount;
                            if (favSortBy === "ratingDesc")
                              return b.rating - a.rating;
                            if (favSortBy === "priceAsc")
                              return (
                                (a.salePrice || a.price) -
                                (b.salePrice || b.price)
                              );
                            return 0;
                          })
                          .slice(0, 4); // show top 4 favorited courses!

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {sortedFavs.map((c) => {
                              const isEnrolled = enrolledCourseIds.includes(
                                c.id,
                              );
                              return (
                                <div
                                  key={c.id}
                                  className="bg-white border border-stone-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-[#8b5e3c]/30 transition-all text-left space-y-3 relative group"
                                >
                                  <button
                                    onClick={() => handleToggleFavorite(c.id)}
                                    className="absolute top-2.5 right-2.5 bg-white/95 p-1.5 rounded-full hover:bg-white text-deep-indigo shadow-xs z-10 transition-transform active:scale-90"
                                    title="Yêu thích"
                                  >
                                    <Heart
                                      className={`w-3.5 h-3.5 ${favorites.includes(c.id) ? "fill-deep-indigo text-deep-indigo" : "text-stone-300"}`}
                                    />
                                  </button>

                                  <div className="space-y-2">
                                    <div className="relative overflow-hidden h-28 bg-stone-100 rounded-xl">
                                      <img
                                        src={c.image}
                                        alt={c.title}
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                      />
                                      <div className="absolute top-2 left-2 bg-[#8b5e3c] text-white font-mono text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                        🔥 {c.favoriteCount.toLocaleString()}{" "}
                                        quan tâm
                                      </div>
                                    </div>

                                    <div className="min-w-0">
                                      <span className="text-[8px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                        {c.subcategory}
                                      </span>
                                      <h4
                                        className="font-extrabold text-xs text-main-normal leading-snug line-clamp-2 mt-1 cursor-pointer hover:text-[#8b5e3c]"
                                        onClick={() => setViewedCourse(c)}
                                      >
                                        {c.title}
                                      </h4>
                                      <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-1 font-bold">
                                        <span>{c.rating}</span>
                                        <span>★</span>
                                        <span className="text-gray-400 font-normal text-[9px]">
                                          ({c.reviewCount})
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-stone-50 text-[11px] mt-2">
                                    <div className="font-bold text-[#432c28]">
                                      {c.salePrice
                                        ? formatVND(c.salePrice)
                                        : formatVND(c.price)}
                                    </div>

                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => setViewedCourse(c)}
                                        className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-750 text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition cursor-pointer"
                                      >
                                        Chi tiết
                                      </button>
                                      {isEnrolled ? (
                                        <button
                                          onClick={() => setStudyingCourse(c)}
                                          className="bg-emerald-50 text-emerald-800 text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition"
                                        >
                                          Đang học
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleBuyCourseNow(c.id)
                                          }
                                          className="bg-deep-indigo hover:bg-deep-indigo/95 text-white text-[9.5px] font-bold py-1.5 px-3 rounded-xl transition-all shadow-3xs"
                                        >
                                          Mua Ngay
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </ScrollReveal>
                </>
              )}
