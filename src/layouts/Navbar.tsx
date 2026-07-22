import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Heart, Bell, User, Settings, LogOut, Code, PlayCircle, PauseCircle, SkipForward, Volume2, Music } from "lucide-react";
import { useApp } from "@/app/AppContext";
import { AppRoutes, RoleLabels } from "@/router/routes";
import { HelpCircle } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, isLoggedIn, cart, favorites, notifications, setNotifications, 
    isPlayingMusic, setIsPlayingMusic, musicVolume, setMusicVolume, currentSong, enrolledCourseIds, setIsLoggedIn
  } = useApp();
  
  // Local states from old App.tsx
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const [showMusicHint, setShowMusicHint] = useState(false);
  
  const toggleMusic = (e) => { e.stopPropagation(); setIsPlayingMusic(!isPlayingMusic); };
  
  return (
    <>
              <header className="bg-white border-b border-brand-light-active py-2 md:py-3 px-4 md:px-8 flex justify-between items-center sticky top-0 z-40 shadow-xs">
          {/* Logo / Brand Name */}
          <button
            onClick={() => {
              setViewedCourse(null);
              setStudyingCourse(null);
              navigate('/');
            }}
            aria-label="MindHub Trang chủ"
            className="flex items-center gap-2.5 text-deep-indigo group select-none text-left shrink-0 animate-fade-in cursor-pointer border-none bg-transparent"
          >
            <div className="header-logo group-hover:scale-105 transition-transform bg-white">
              <img
                src="/header-logo.png"
                alt="MindHub Logo"
                className="object-contain"
                width={100}
                height={40}
              />
            </div>
            <div className="hidden xs:block">
              <span className="font-suisseintl font-black text-lg md:text-2xl tracking-tighter text-deep-ink leading-none block select-none group-hover:text-brand-normal transition-colors">
                MindHub
              </span>
              <span className="text-[9px] text-slate font-suisseintlmono block mt-0.5 uppercase tracking-wide">
                Hệ thống Đào tạo & Quản trị Tri thức
              </span>
            </div>
          </button>

          {/* Beautiful Header Search Bar */}
          <div className="flex-1 max-w-[140px] xs:max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm bài khóa, giảng viên..."
                value={searchQuery}
                onFocus={() => setShowMainSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMainSuggestions(true);
                }}
                className="w-full text-[11px] sm:text-xs pl-8 sm:pl-9 pr-7 py-1.5 bg-stone-50 hover:bg-stone-50/70 border border-brand-light-active rounded-xl focus:bg-white focus:ring-1 focus:ring-deep-indigo focus:border-deep-indigo focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowMainSuggestions(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] text-stone-400 hover:text-deep-indigo font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* SUGGESTIONS MENU OVERLAY */}
            {showMainSuggestions && searchQuery.trim().length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-30 cursor-default bg-transparent"
                  onClick={() => setShowMainSuggestions(false)}
                />
                <div
                  tabIndex={-1}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8ded3] rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1"
                >
                  {(() => {
                    const list = getSearchSuggestions(searchQuery);
                    if (list.length === 0) {
                      return (
                        <div className="p-3.5 text-[11px] text-stone-400 italic text-center">
                          Không tìm thấy gợi ý trùng khớp.
                        </div>
                      );
                    }
                    return list.map((item, idx) => {
                      let badgeColor = "bg-stone-50 text-stone-600";
                      let typeLabel = "Bài học";
                      if (item.type === "category") {
                        badgeColor = "bg-amber-150 text-amber-900";
                        typeLabel = "Danh mục";
                      } else if (item.type === "instructor") {
                        badgeColor = "bg-emerald-150 text-emerald-900";
                        typeLabel = "Giảng viên";
                      } else if (item.type === "subcategory") {
                        badgeColor = "bg-sky-150 text-sky-900";
                        typeLabel = "Chuyên đề";
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full px-3.5 py-2.5 hover:bg-[#faf6f2] flex items-center justify-between transition-colors gap-2 text-left cursor-pointer border-none"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="text-xs font-semibold text-stone-800 truncate leading-snug animate-none">
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

          {/* Global actions row */}
          <div className="flex items-center gap-2 md:gap-4 text-xs">
            {/* Spinning Music Disc Button */}
            <div className="relative">
              {showMusicHint && (
                <div className="absolute top-full mt-3 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-56 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl shadow-lg z-50 text-left animate-bounce duration-1000">
                  {/* Little triangle arrow pointing up */}
                  <div className="absolute bottom-full right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 -mb-[5px] w-2 h-2 bg-amber-50 border-l border-t border-amber-200/80 rotate-45" />
                  <div className="flex gap-1.5 items-start">
                    <span className="text-xs shrink-0 select-none animate-pulse">
                      🎵
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#432c28] leading-tight">
                        Góc chill nhạc nền!
                      </p>
                      <p className="text-[9px] text-stone-600 mt-0.5 leading-relaxed">
                        Bạn có thể bật nhạc Lofi ấm áp tại đây khi tự học nhé!
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMusicHint(false);
                      }}
                      className="text-[9px] text-[#8b5e3c] font-black h-4 w-4 hover:bg-amber-100 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                      title="Đóng"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-1.5 bg-[#faf6f2] hover:bg-[#eedecf] border border-[#e8ded3] rounded-full pl-1.5 pr-2.5 py-1 transition-all cursor-pointer select-none"
                onClick={() => setShowMusicMenu(!showMusicMenu)}
                title="Nhấn để chọn nhạc nền / gắn link YouTube phát nhạc"
              >
                {/* CD Disc Rotating Element */}
                <div
                  className={`w-6 h-6 rounded-full bg-[#432c28] flex items-center justify-center shrink-0 ${isPlayingMusic ? "animate-spin-slow" : ""}`}
                  style={{
                    animationPlayState: isPlayingMusic ? "running" : "paused",
                  }}
                >
                  {/* 2D monochrome CD center hole indicator inside the vinyl disc design */}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbf9f6]" />
                </div>

                {/* Text metadata */}
                <div className="text-left leading-tight hidden sm:block max-w-[90px] md:max-w-[120px]">
                  <span className="block text-[8px] text-stone-405 font-mono font-bold tracking-wider uppercase leading-none">
                    Bản nhạc BGM
                  </span>
                  <span className="block text-[10px] text-[#432c28] font-bold truncate leading-snug">
                    {currentSong.title.substring(2)}
                  </span>
                </div>
              </div>

              {/* Quick Play/Pause button right next to it */}
              <button
                onClick={togglePlayMusic}
                className={`absolute -bottom-1 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold border shadow-xs transition-transform hover:scale-110 cursor-pointer z-10 ${isPlayingMusic ? "bg-amber-100 text-[#8b5e3c] border-[#e8ded3]" : "bg-white text-stone-500 border-stone-300"}`}
                title={isPlayingMusic ? "Tạm dừng nhạc" : "Bật phát nhạc nền"}
              >
                {isPlayingMusic ? "⏸" : "▶"}
              </button>

              {/* Float menu for BGM selection & custom Youtube linking */}
              {showMusicMenu && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 text-left"
                  onClick={() => setShowMusicMenu(false)}
                >
                  <div
                    className="bg-[#fbf9f6] rounded-2xl w-full max-w-2xl border border-[#e8ded3] p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto tactile-scrollbar flex flex-col animate-scale-up text-xs text-stone-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center border-b border-[#e8ded3]/80 pb-2.5">
                      <span className="font-bold flex items-center gap-2 text-[#432c28]">
                        <Music className="w-4 h-4 text-[#8b5e3c]" /> Nhạc Nền
                        Trang Web
                      </span>
                      <button
                        onClick={() => setShowMusicMenu(false)}
                        className="text-[11px] text-[#8b5e3c] hover:text-black font-extrabold hover:bg-stone-200/50 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                      {/* Left Column: Trạng thái phát & Nút điều khiển */}
                      <div className="space-y-3">
                        <span className="block text-[8.5px] text-[#8b5e3c] uppercase tracking-widest font-extrabold pb-0.5 border-b border-[#e8ded3]/55">
                          Bản Nhạc Hiện Tại:
                        </span>

                        {/* Playing state Indicator widget */}
                        <div className="bg-[#faf6f2] border border-[#e8ded3]/60 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full bg-[#432c28] flex items-center justify-center shrink-0 ${isPlayingMusic ? "animate-spin-slow" : ""}`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#fbf9f6]" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <span className="block text-[8px] text-stone-450 font-mono font-bold leading-none uppercase">
                                Đang phát:
                              </span>
                              <span
                                className="block text-[11px] font-bold text-[#432c28] truncate mt-1"
                                title={currentSong.title}
                              >
                                {currentSong.title}
                              </span>
                            </div>
                          </div>

                          {/* Dynamic Progress Slider */}
                          <div className="space-y-1">
                            <div className="relative w-full h-1.5 bg-stone-200 rounded-lg group cursor-pointer overflow-hidden">
                              <input
                                type="range"
                                min="0"
                                max={musicDuration || 100}
                                value={musicCurrentTime}
                                onChange={(e) =>
                                  handleSeekMusic(Number(e.target.value))
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                title="Tua nhạc"
                              />
                              <div
                                className="absolute left-0 top-0 h-full bg-[#8b5e3c] rounded-lg pointer-events-none transition-all duration-75"
                                style={{
                                  width: `${musicDuration ? (musicCurrentTime / musicDuration) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[7.5px] text-stone-450 font-mono font-bold leading-none select-none">
                              <span>{formatTime(musicCurrentTime)}</span>
                              <span>
                                {musicDuration > 0
                                  ? formatTime(musicDuration)
                                  : "--:--"}
                              </span>
                            </div>
                          </div>

                          {/* Controller Playback Actions Row */}
                          <div className="flex items-center justify-center gap-3 pt-1.5 border-t border-[#e8ded3]/40">
                            {/* Loop song button */}
                            <button
                              type="button"
                              onClick={() =>
                                setIsLoopingSingle(!isLoopingSingle)
                              }
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isLoopingSingle
                                  ? "bg-[#8b5e3c]/15 text-[#8b5e3c] border border-[#8b5e3c]/35 font-bold"
                                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-100 border border-transparent"
                              }`}
                              title={
                                isLoopingSingle
                                  ? "Đang bật lặp lại một bài (Tắt để tự động chuyển tiếp)"
                                  : "Đang tắt lặp bài (Bật để lặp lại một bài)"
                              }
                            >
                              <Repeat className="w-3.5 h-3.5" />
                            </button>

                            {/* Previous Song */}
                            <button
                              type="button"
                              onClick={handlePrevSong}
                              className="p-1.5 rounded-lg text-[#432c28] hover:text-[#8b5e3c] hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Bài trước"
                            >
                              <SkipBack className="w-3.5 h-3.5" />
                            </button>

                            {/* Play / Pause Toggle */}
                            <button
                              type="button"
                              onClick={() => togglePlayMusic()}
                              className="w-8 h-8 rounded-full bg-[#432c28] hover:bg-[#8b5e3c] text-white flex items-center justify-center font-bold shadow-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                              title={isPlayingMusic ? "Tạm dừng" : "Phát"}
                            >
                              {isPlayingMusic ? (
                                <Pause className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                              )}
                            </button>

                            {/* Next Song */}
                            <button
                              type="button"
                              onClick={handleNextSong}
                              className="p-1.5 rounded-lg text-[#432c28] hover:text-[#8b5e3c] hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Bài tiếp theo"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Small state feedback mode labels */}
                          <div className="text-[8.5px] text-[#8b5e3c]/90 text-center leading-none italic select-none font-semibold">
                            Chế độ:{" "}
                            {isLoopingSingle
                              ? "🔁 Lặp 1 bài"
                              : "🔀 Tự động chuyển tiếp"}
                          </div>
                        </div>

                        {/* Volume Slider for BGM / YouTube Audio control */}
                        <div className="space-y-1.5 bg-[#faf6f2]/40 border border-[#e8ded3]/30 rounded-xl p-2.5 text-[9.5px]">
                          <div className="flex justify-between items-center text-stone-450 font-medium leading-none mb-1">
                            <span>
                              Âm lượng (
                              {currentSong.isYoutube ? "YouTube" : "BGM"}):
                            </span>
                            <span className="font-bold">
                              {Math.round(musicVolume * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <VolumeX className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVolume}
                              onChange={(e) =>
                                setMusicVolume(parseFloat(e.target.value))
                              }
                              className="w-full h-1 bg-[#e8ded3] rounded-lg appearance-none cursor-pointer accent-[#8b5e3c]"
                            />
                            <Volume2 className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Thư viện & Chức năng tải lên / Youtube */}
                      <div className="space-y-3 lg:border-l lg:border-[#e8ded3]/60 lg:pl-4">
                        {/* Search bar inside BGM menu */}
                        <div className="space-y-1">
                          <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">
                            Tìm kiếm bài hát:
                          </span>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Tìm tên bài hát ở dưới..."
                              value={bgmSearchQuery}
                              onFocus={() => setShowBgmSuggestions(true)}
                              onChange={(e) => {
                                setBgmSearchQuery(e.target.value);
                                setShowBgmSuggestions(true);
                              }}
                              className="w-full text-[10px] pl-7 pr-6 py-1.5 bg-white border border-stone-305 focus:border-[#8b5e3c] focus:outline-none rounded-lg text-stone-800 font-medium"
                            />
                            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            {bgmSearchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBgmSearchQuery("");
                                  setShowBgmSuggestions(false);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 font-bold p-0.5 text-[10px] cursor-pointer"
                              >
                                ✕
                              </button>
                            )}

                            {/* BGM SUGGESTIONS OVERLAY */}
                            {showBgmSuggestions &&
                              bgmSearchQuery.trim().length > 0 && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30 cursor-default bg-transparent"
                                    onClick={() => setShowBgmSuggestions(false)}
                                  />
                                  <div
                                    tabIndex={-1}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8ded3] rounded-xl shadow-lg z-45 max-h-40 overflow-y-auto divide-y divide-[#e8ded3]/30 text-left py-1"
                                  >
                                    {(() => {
                                      const list =
                                        getBgmSuggestions(bgmSearchQuery);
                                      if (list.length === 0) {
                                        return (
                                          <p className="p-2 text-[10px] text-stone-400 italic text-center">
                                            Không tìm thấy bài hát nào.
                                          </p>
                                        );
                                      }
                                      return list.map((item) => (
                                        <button
                                          key={item.id}
                                          type="button"
                                          onClick={() => {
                                            setCurrentSong(item.songObj);
                                            setIsPlayingMusic(true);
                                            setBgmSearchQuery(item.title);
                                            setShowBgmSuggestions(false);
                                          }}
                                          className="w-full px-2.5 py-1.5 hover:bg-[#faf6f2]/80 text-[10px] text-stone-700 font-medium truncate flex items-center gap-1.5 transition-colors text-left border-none cursor-pointer"
                                        >
                                          <Music className="w-3 h-3 text-[#8b5e3c] shrink-0" />
                                          <span className="truncate">
                                            {item.title}
                                          </span>
                                        </button>
                                      ));
                                    })()}
                                  </div>
                                </>
                              )}
                          </div>
                        </div>

                        {/* Preset tracks */}
                        <div className="space-y-1">
                          <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">
                            Thư viện nhạc:
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1.5 tactile-scrollbar">
                            {(() => {
                              const filtered = PRESET_SONGS.filter((song) =>
                                song.title
                                  .toLowerCase()
                                  .includes(bgmSearchQuery.toLowerCase()),
                              );
                              if (filtered.length === 0) {
                                return (
                                  <p className="text-[9px] text-stone-400 italic text-center py-1">
                                    Không tìm thấy bài hát nào.
                                  </p>
                                );
                              }
                              return filtered.map((song) => {
                                const isCurrent = song.id === currentSong.id;
                                return (
                                  <button
                                    key={song.id}
                                    onClick={() => {
                                      setCurrentSong(song);
                                      setIsPlayingMusic(true);
                                    }}
                                    className={`w-full text-left p-1.5 rounded-lg text-[10px] font-medium flex items-center justify-between transition-colors border cursor-pointer ${
                                      isCurrent
                                        ? "bg-[#faf6f2] border-[#8b5e3c] text-[#8b5e3c]"
                                        : "bg-white hover:bg-[#faf6f2]/40 border-stone-200 text-stone-600"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {song.title}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[10px] animate-pulse">
                                        🎵
                                      </span>
                                    )}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* User uploaded tracks */}
                        <div className="space-y-1 border-t border-[#e8ded3]/50 pt-2 text-stone-800">
                          <span className="block text-[8.5px] text-[#8b5e3c]/85 uppercase tracking-widest font-extrabold font-mono font-medium">
                            Nhạc tải lên (lưu 1 tuần):
                          </span>
                          {(() => {
                            const filtered = uploadedSongs.filter((song) =>
                              song.title
                                .toLowerCase()
                                .includes(bgmSearchQuery.toLowerCase()),
                            );
                            if (filtered.length === 0) {
                              return (
                                <p className="text-[9px] text-stone-400 italic text-center py-1">
                                  {bgmSearchQuery
                                    ? "Không tìm thấy bài hát nào."
                                    : "Chưa tải lên bài hát nào."}
                                </p>
                              );
                            }
                            return (
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1.5 tactile-scrollbar">
                                {filtered.map((song) => {
                                  const isCurrent = song.id === currentSong.id;
                                  return (
                                    <div
                                      key={song.id}
                                      onClick={() => {
                                        setCurrentSong(song as any);
                                        setIsPlayingMusic(true);
                                      }}
                                      className={`w-full text-left p-1.5 rounded-lg text-[9.5px] font-medium flex items-center justify-between transition-colors border cursor-pointer group ${
                                        isCurrent
                                          ? "bg-[#faf6f2] border-[#8b5e3c] text-[#8b5e3c]"
                                          : "bg-white hover:bg-[#faf6f2]/40 border-stone-200 text-stone-600"
                                      }`}
                                    >
                                      <div className="flex-1 min-w-0 pr-2">
                                        <span className="block truncate font-medium">
                                          {song.title.replace(/^🎵 /, "")}
                                        </span>
                                        <span className="block text-[7.5px] text-stone-400 font-mono mt-0.5">
                                          {getRemainingDays(song.expiresAt)}
                                        </span>
                                      </div>
                                      <div
                                        className="flex items-center gap-1 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {isCurrent && (
                                          <span className="text-[10px] animate-pulse mr-1">
                                            🎵
                                          </span>
                                        )}
                                        <button
                                          onClick={(e) =>
                                            handleDeleteSong(song.id, e)
                                          }
                                          className="p-1 text-stone-400 hover:text-red-500 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                                          title="Xóa bài hát"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Upload Section Box */}
                        <div className="space-y-1 border-t border-[#e8ded3]/50 pt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".mp3"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full py-1.5 px-3 border border-dashed rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#faf6f2]/60 hover:border-[#8b5e3c] group transition-all text-stone-605 cursor-pointer ${
                              isUploading
                                ? "border-amber-300 bg-[#faf6f2]/30 cursor-not-allowed"
                                : "border-stone-300 md:border-dashed"
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-[#8b5e3c] animate-spin" />
                                <span className="text-[9.5px] font-bold text-[#8b5e3c]">
                                  Đang tải và kiểm tra...
                                </span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#8b5e3c] transition-colors" />
                                <span className="text-[9.5px] font-bold group-hover:text-[#8b5e3c] transition-colors">
                                  Tải lên file .mp3 (Dưới 6 phút)
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* YouTube Link Integration section */}
                        <form
                          onSubmit={handlePlayCustomYt}
                          className="space-y-1.5 border-t border-[#e8ded3]/50 pt-2"
                        >
                          <span className="block text-[8.5px] text-stone-450 uppercase tracking-widest font-extrabold">
                            Từ YouTube:
                          </span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Mã video id hoặc đường link YouTube..."
                              value={ytUrlInput}
                              onChange={(e) => setYtUrlInput(e.target.value)}
                              className="flex-1 text-[9.5px] px-2 py-1 bg-white border border-stone-300 focus:border-[#8b5e3c] focus:outline-none rounded-lg text-stone-800"
                            />
                            <button
                              type="submit"
                              className="bg-[#432c28] hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
                            >
                              Phát
                            </button>
                          </div>
                        </form>

                        {/* Notification Banner */}
                        {musicNotification && (
                          <div
                            className={`p-1.5 rounded-lg text-[9.5px] font-bold text-center border leading-snug animate-fade-in ${
                              musicNotification.type === "success"
                                ? "bg-[#f4fbf7] text-[#1b6b45] border-[#d4eedc]"
                                : "bg-[#fff5f5] text-[#b32b2b] border-[#fcd5d5]"
                            }`}
                          >
                            {musicNotification.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Header Main Navigation Links (Replacing old tab bar) */}
            <div className="flex items-center gap-1 sm:gap-1.5 pr-1 sm:pr-2 border-r border-brand-light-active select-none">
              <button
                onClick={() => navigate('/')}
                aria-label="Khám phá khóa học"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  location.pathname === '/'
                    ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-102 font-black"
                    : "bg-white hover:bg-stone-50 text-stone-650 border-stone-200"
                }`}
                title="Khám phá khóa học"
              >
                <Compass
                  className={`w-4 h-4 ${location.pathname === '/' ? "text-white" : "text-brand-normal"}`}
                />
                <span className="hidden lg:inline">Khám phá</span>
              </button>

              <button
                onClick={() => navigate('/intro')}
                aria-label="Giới thiệu MindHub"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  location.pathname === '/'
                    ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-102 font-black"
                    : "bg-white hover:bg-stone-50 text-stone-650 border-stone-200"
                }`}
                title="Giới thiệu MindHub"
              >
                <Sparkles
                  className={`w-4 h-4 ${location.pathname === '/' ? "text-white" : "text-amber-500"}`}
                />
                <span className="hidden lg:inline">Giới thiệu</span>
              </button>
            </div>

            {currentUser.role === "student" && (
              <>
                {/* Favorites trigger count - Navigate to dedicated favorites page */}
                <button
                  onClick={() => navigate('/favorites')}
                  aria-label="Khóa học yêu thích"
                  className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
                    location.pathname === '/'
                      ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-105 font-bold"
                      : "bg-white hover:bg-stone-50 text-stone-750 border-stone-200"
                  }`}
                  title="Khóa học yêu thích"
                >
                  <Heart
                    className={`w-4.5 h-4.5 ${location.pathname === '/' ? "fill-white text-white" : favorites.length > 0 ? "fill-deep-indigo text-deep-indigo" : "text-stone-500"}`}
                  />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                      {favorites.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/about')}
                  aria-label="Giới thiệu"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    location.pathname === '/'
                      ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-102 font-black"
                      : "bg-white hover:bg-stone-50 text-stone-650 border-stone-200"
                  }`}
                  title="Giới thiệu"
                >
                  <Users
                    className={`w-4 h-4 ${location.pathname === '/' ? "text-white" : "text-emerald-500"}`}
                  />
                  <span className="hidden lg:inline">Giới thiệu</span>
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  aria-label="Liên hệ"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    location.pathname === '/'
                      ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-102 font-black"
                      : "bg-white hover:bg-stone-50 text-stone-650 border-stone-200"
                  }`}
                  title="Liên hệ"
                >
                  <MessageSquare
                    className={`w-4 h-4 ${location.pathname === '/' ? "text-white" : "text-emerald-500"}`}
                  />
                  <span className="hidden lg:inline">Liên hệ</span>
                </button>
              </>
            )}

            {/* Mindhub FAQ icon button trigger */}
            <button
              onClick={() => navigate('/faq')}
              aria-label="Mindhub FAQ"
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                location.pathname === '/'
                  ? "bg-[#8b5e3c] text-white border-[#8b5e3c] shadow-3xs scale-102 font-black"
                  : "bg-white hover:bg-stone-50 text-stone-750 border-stone-200 hover:text-[#8b5e3c]"
              }`}
              title="Trung tâm Trợ giúp và FAQ"
            >
              <HelpCircle
                className={`w-4 h-4 ${location.pathname === '/' ? "text-white" : ""}`}
              />
              <span className="hidden lg:inline">Mindhub FAQ</span>
            </button>

            {/* Notifications tray badge button toggle - Navigate to dedicated notifications page */}
            <div className="relative">
              <button
                onClick={() => navigate('/notifications')}
                aria-label="Thông báo cá nhân"
                className={`p-2 rounded-xl transition-all cursor-pointer border relative flex items-center justify-center ${
                  location.pathname === '/'
                    ? "bg-deep-indigo text-white border-deep-indigo shadow-3xs scale-105 font-bold"
                    : "bg-white hover:bg-stone-50 text-stone-750 border-stone-200 hover:text-black"
                }`}
                title="Thông báo cá nhân"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications
                  .filter((n) => {
                    if (!n.targetCourseId || n.targetCourseId === "all")
                      return true;
                    return enrolledCourseIds.includes(String(n.targetCourseId));
                  })
                  .filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* User profiles Avatar and Role info */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-brand-light-active select-none shrink-0 font-sans">
                <button
                  onClick={() => {
                    navigate('/auth');
                  }}
                  className="px-3 py-1.5 border border-stone-250 bg-white hover:bg-stone-50 text-stone-700 font-bold text-[10px] md:text-[11px] rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => {
                    navigate('/auth');
                  }}
                  className="px-3.5 py-1.5 bg-[#432c28] hover:bg-black text-brand-light hover:text-white font-bold text-[10px] md:text-[11px] rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-2 pl-2 border-l border-brand-light-active shrink-0">
                <button
                  onClick={() => navigate(AppRoutes.profile(currentUser.id))}
                  aria-label="Vào trang hồ sơ cá nhân"
                  className={`flex items-center gap-2 group text-left cursor-pointer p-1.5 rounded-xl transition-all border ${
                    location.pathname === '/' || location.pathname === '/'
                      ? "bg-stone-100 border-deep-indigo shadow-3xs"
                      : "bg-white border-transparent hover:bg-stone-100"
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-brand-light-active object-cover"
                  />
                  <div className="hidden md:block">
                    <span className="font-bold block tracking-tight truncate max-w-28 text-main-normal leading-none group-hover:text-brand-normal">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono font-bold mt-1.5 block">
                      {RoleLabels[currentUser.role] || currentUser.role}
                    </span>
                  </div>
                </button>



                <button
                  onClick={() => {
                    setIsLoggedIn(false); navigate("/");
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors hidden sm:block"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
        </header>
    </>
  );
}
