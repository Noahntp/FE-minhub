import os

with open('src/components/ClassroomScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add error state
code = code.replace(
    'const [realVideoUrl, setRealVideoUrl] = useState<string | null>(null);',
    'const [realVideoUrl, setRealVideoUrl] = useState<string | null>(null);\n  const [videoError, setVideoError] = useState<string | null>(null);'
)

# Add onError to video
code = code.replace(
    '<video\n                  ref={videoRef}',
    '<video\n                  ref={videoRef}\n                  onError={(e) => {\n                    const error = e.currentTarget.error;\n                    setVideoError(error ? `Error code ${error.code}: ${error.message}` : "Unknown video error");\n                    console.error("Video error:", error);\n                  }}\n                  onLoadStart={() => setVideoError(null)}'
)

# Display error overlay
code = code.replace(
    '{isBuffering && (',
    '{videoError && (\n                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">\n                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">\n                      <p className="text-red-400 font-bold mb-2">Video load error</p>\n                      <p className="text-red-200 text-xs font-mono">{videoError}</p>\n                      <p className="text-stone-400 text-xs mt-2 break-all">{currentVideoUrl}</p>\n                    </div>\n                  </div>\n                )}\n\n                {isBuffering && !videoError && ('
)

with open('src/components/ClassroomScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('patched')
