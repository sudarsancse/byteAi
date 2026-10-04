import {
  Check,
  Code2,
  Copy,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, easeInOut, motion } from "motion/react";
import Editor from "@monaco-editor/react";

// DETECT LANGUAGE (moved outside so it isn't recreated every render)
const detectLang = (filename = "") => {
  const name = filename.toLowerCase();

  if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".scss")) return "scss";
  if (name.endsWith(".sass")) return "sass";
  if (name.endsWith(".less")) return "less";

  if (name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs"))
    return "javascript";
  if (name.endsWith(".jsx")) return "javascript";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".tsx")) return "typescript";

  if (name.endsWith(".vue")) return "html";
  if (name.endsWith(".svelte")) return "html";

  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".xml")) return "xml";
  if (name.endsWith(".yml") || name.endsWith(".yaml")) return "yaml";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";

  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".java")) return "java";
  if (name.endsWith(".c") || name.endsWith(".h")) return "c";
  if (name.endsWith(".cpp") || name.endsWith(".cc") || name.endsWith(".cxx"))
    return "cpp";
  if (name.endsWith(".cs")) return "csharp";
  if (name.endsWith(".go")) return "go";
  if (name.endsWith(".rs")) return "rust";
  if (name.endsWith(".rb")) return "ruby";
  if (name.endsWith(".php")) return "php";
  if (name.endsWith(".swift")) return "swift";
  if (name.endsWith(".kt") || name.endsWith(".kts")) return "kotlin";

  if (name.endsWith(".sh") || name.endsWith(".bash")) return "shell";
  if (name.endsWith(".sql")) return "sql";
  if (name.endsWith(".dockerfile") || name === "dockerfile")
    return "dockerfile";
  if (name.endsWith(".env")) return "shell";

  return "plaintext";
};

function Artiface() {
  const [collapsed, setCollapsed] = useState(false);
  const { artifacts } = useSelector((state) => state.message);
  const [tab, setTab] = useState("code");
  const [activeFile, setActiveFile] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // reset tab and file when a new artifact arrives (no effect needed)
  const artifactId = artifacts?.[0]?.id;
  const [prevArtifactId, setPrevArtifactId] = useState(artifactId);
  if (artifactId !== prevArtifactId) {
    setPrevArtifactId(artifactId);
    setActiveFile(0);
    setTab("code");
  }

  // all hooks must stay ABOVE this line
  if (!artifacts?.length) return null;

  // ---------- file data ----------
  const files = artifacts[0]?.files || [];
  const file = files[activeFile] || files[0];

  const htmlFile = files.find((f) => f.filename === "index.html");
  const cssFile = files.find((f) => f.filename === "style.css");
  const jsFile = files.find((f) => f.filename === "script.js");

  // preview only for plain web projects
  const isFramework = files.some((f) =>
    /\.(jsx|tsx|vue|svelte)$/i.test(f.filename || ""),
  );
  const canPreview = Boolean(htmlFile) && !isFramework;

  const buildPreviewDoc = () => {
    if (!canPreview) return "";
    let html = htmlFile.content || "";

    // remove local file references, since we inline them below
    html = html.replace(/<link[^>]*href=["']\.?\/?style\.css["'][^>]*>/gi, "");
    html = html.replace(
      /<script[^>]*src=["']\.?\/?script\.js["'][^>]*>\s*<\/script>/gi,
      "",
    );

    const style = cssFile ? `<style>${cssFile.content || ""}</style>` : "";
    const script = jsFile ? `<script>${jsFile.content || ""}<\/script>` : "";

    // function replacers so "$" in user code isn't treated as a special pattern
    html = /<\/head>/i.test(html)
      ? html.replace(/<\/head>/i, () => `${style}</head>`)
      : style + html;
    html = /<\/body>/i.test(html)
      ? html.replace(/<\/body>/i, () => `${script}</body>`)
      : html + script;

    return html;
  };

  const previewDoc = buildPreviewDoc();

  // CODE COPY
  const copyCode = async () => {
    await navigator.clipboard.writeText(file?.content || "");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 5000);
  };

  // Called as a function (not <PanelContent />) so React doesn't remount
  // the Monaco editor on every state change.
  const renderPanel = (onClose) => (
    <>
      {!collapsed || onClose ? (
        <div className="flex flex-col h-full bg-[#0d0f14]">
          <div className="h-14 px-4 border-b border-white/6 flex items-center gap-3 shrink-0">
            <button
              onClick={onClose ?? (() => setCollapsed(true))}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
            >
              {onClose ? <X size={15} /> : <PanelRightClose size={16} />}
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Code2 className="text-indigo-400" size={12} />
              </div>
              <div className="text-[13px] font-medium text-slate-200 truncate">
                {artifacts[0]?.title}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={copyCode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium hover:bg-white/5 rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer ${copiedCode ? "text-green-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                {copiedCode ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            {/* CODE BTN AND PREVIEW BTN (only for web projects) */}
            {canPreview && (
              <div className="flex items-center gap-1 bg-white/4 border border-white/6 p-1 rounded-lg">
                <button
                  onClick={() => setTab("code")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "code" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                >
                  <Code2 size={11} /> Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "preview" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                >
                  <Eye size={11} /> Preview
                </button>
              </div>
            )}
          </div>

          {/* FILE TABS */}
          {(tab === "code" || !canPreview) && (
            <div className="h-auto flex text-white border-b border-white/6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {files.map((f, index) => (
                <button
                  onClick={() => setActiveFile(index)}
                  key={index}
                  className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/5 relative cursor-pointer bg-transparent ${activeFile === index ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {f?.filename}
                  {activeFile === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-hidden">
            {tab === "preview" && canPreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <iframe
                  title="preview"
                  srcDoc={previewDoc}
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <Editor
                  theme="vs-dark"
                  language={detectLang(file?.filename)}
                  value={file?.content || ""}
                  path={file?.filename}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden h-full lg:flex border-l border-white/6 bg-[#0d0f14] flex-col items-center py-4 gap-3 shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
          >
            <PanelRightOpen size={16} />
          </button>
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <div
              className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              {artifacts[0]?.title}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium shadow-lg shadow-indigo-500/20 border-none cursor-pointer transition-colors duration-150"
      >
        <Code2 size={13} />
        View Code
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: easeInOut }}
              className="lg:hidden fixed inset-y-0 right-0 z-50 w-[88vw] max-w-[420px] border-l border-white/6 overflow-hidden"
            >
              {renderPanel(() => setMobileOpen(false))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ width: 450 }}
        animate={{ width: collapsed ? 48 : 450 }}
        transition={{ duration: 0.25, ease: easeInOut }}
        className="hidden lg:flex h-full border-l border-white/6 flex-col overflow-hidden shrink-0"
      >
        {renderPanel()}
      </motion.div>
    </>
  );
}

export default Artiface;
