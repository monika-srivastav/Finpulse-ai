import { useState, useRef, useEffect } from "react";

const SAMPLE_CSV = `Date,Description,Amount,Category
2024-01-01,Opening Balance,10000.00,Balance
2024-01-05,Netflix Subscription,-15.99,Entertainment
2024-01-07,Monthly Salary,85000.00,Income
2024-01-08,Big Basket Groceries,-3200.00,Food
2024-01-10,Electricity Bill,-1800.00,Utilities
2024-01-12,Zomato Food Order,-850.00,Food
2024-01-15,Gym Membership,-2500.00,Health
2024-01-17,Amazon Shopping,-4500.00,Shopping
2024-01-18,Freelance Project,15000.00,Income
2024-01-20,Ola Cab Rides,-1200.00,Transport
2024-01-22,Mobile Recharge,-599.00,Utilities
2024-01-24,Swiggy Food Order,-1100.00,Food
2024-01-26,SIP Investment,-10000.00,Investment
2024-01-28,Medical Expense,-3500.00,Health
2024-01-30,Restaurant Dinner,-2200.00,Food`;

export default function App() {
  const [textData, setTextData] = useState("");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const fileInputRef = useRef(null);
  const responseRef = useRef(null);

  // Auto-scroll response panel
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  useEffect(() => {
    setCharCount(textData.length);
  }, [textData]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

 const handleAnalyze = async () => {
  if (!textData.trim() && !file) {
    alert("Please paste some financial data or upload a file first.");
    return;
  }

  setIsLoading(true);
  setResponse("");

  const formData = new FormData();
  formData.append("text_data", textData);
  formData.append("query", query);

  if (file) {
    formData.append("file", file);
  }

  try {
    const res = await fetch(
      "https://finpulse-backend-ai.onrender.com/api/analyze",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();

        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);

          if (parsed.text) {
            setResponse((prev) => prev + parsed.text);
          }
        } catch (e) {
          // Ignore malformed JSON chunks
        }
      }
    }
  } catch (err) {
    console.error(err);

    setResponse(
      "⚠️ Connection Error\n\nCould not reach the backend server.\n\nPlease make sure the Render backend is running."
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleClear = () => {
    setTextData("");
    setQuery("");
    setFile(null);
    setResponse("");
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c16] text-white" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="border-b border-[#1a2740] bg-[#060c16]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <span className="text-black font-bold text-base leading-none">₿</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">FinPulse</span>
              <span className="text-lg font-bold text-emerald-400 tracking-tight"> AI</span>
            </div>
            <span className="hidden sm:block text-[#2a3a55] text-sm ml-1">/ Smart Financial Analyzer</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0c1526] border border-[#1a2740] rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 text-xs font-medium">Claude Sonnet Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            AI-Powered · Real-Time · Streaming
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Understand Your{" "}
            <span className="text-emerald-400">Finances</span>
            <br />in Seconds
          </h1>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto">
            Upload a CSV, paste transactions, or describe your financial data — get instant AI analysis with spending insights, trends, and smart recommendations.
          </p>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Input Panel ── */}
          <div className="space-y-4">

            {/* File Upload */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-emerald-400 bg-emerald-400/10 scale-[1.01]"
                  : "border-[#1e3050] hover:border-emerald-600/60 bg-[#0c1526]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.pdf,.txt"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xl">
                      {file.name.endsWith(".csv") ? "📊" : file.name.endsWith(".pdf") ? "📄" : "📁"}
                    </div>
                    <div className="text-left">
                      <p className="text-emerald-400 font-semibold text-sm">{file.name}</p>
                      <p className="text-[#64748b] text-xs">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                    </div>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 rounded px-2 py-1 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">📂</div>
                  <p className="text-[#94a3b8] font-medium text-sm">Drop your CSV or PDF here</p>
                  <p className="text-[#475569] text-xs mt-1">or click to browse · CSV, PDF, TXT supported</p>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="bg-[#0c1526] rounded-2xl border border-[#1a2740] overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-[#1a2740]">
                <span className="text-[#64748b] text-xs font-medium uppercase tracking-wider">Paste Data</span>
                <span className="text-[#475569] text-xs">{charCount} chars</span>
              </div>
              <textarea
                className="w-full bg-transparent text-[#cbd5e1] placeholder-[#334155] p-4 resize-none focus:outline-none text-sm leading-relaxed font-mono"
                rows={9}
                placeholder={"Paste your transaction data, bank statement, or any financial text here...\n\nExample:\nDate, Description, Amount\n2024-01-07, Salary, 85000\n2024-01-08, Groceries, -3200"}
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
              />
            </div>

            {/* Query / Specific Question */}
            <div className="bg-[#0c1526] rounded-xl border border-[#1a2740] flex items-center gap-3 px-4">
              <span className="text-emerald-400 text-base shrink-0">💬</span>
              <input
                className="w-full bg-transparent text-[#cbd5e1] placeholder-[#334155] py-3.5 focus:outline-none text-sm"
                placeholder="Ask a specific question (optional) — e.g. 'Where am I spending the most?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>

            {/* Sample Data */}
            <button
              className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-2"
              onClick={() => setTextData(SAMPLE_CSV)}
            >
              ↗ Load sample transaction data (CSV)
            </button>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className={`flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                  isLoading
                    ? "bg-emerald-900/50 cursor-not-allowed text-emerald-600 border border-emerald-800"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 active:scale-[0.99]"
                }`}
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                    Analyzing...
                  </span>
                ) : (
                  "⚡ Analyze with AI"
                )}
              </button>
              {(textData || file || response) && (
                <button
                  className="px-5 py-4 rounded-xl border border-[#1a2740] text-[#64748b] hover:text-white hover:border-[#334155] transition-all text-sm font-medium"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Output Panel ── */}
          <div className="bg-[#0c1526] rounded-2xl border border-[#1a2740] flex flex-col" style={{ minHeight: "580px" }}>

            {/* Panel Header */}
            <div className="border-b border-[#1a2740] px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full transition-all ${
                  isLoading ? "bg-emerald-400 animate-pulse" : response ? "bg-emerald-500" : "bg-[#2a3a55]"
                }`}></div>
                <span className="text-sm font-medium text-[#64748b]">
                  {isLoading ? "AI is analyzing your data..." : response ? "Analysis ready" : "Awaiting input"}
                </span>
              </div>
              {response && !isLoading && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-[#475569] hover:text-emerald-400 border border-[#1a2740] hover:border-emerald-600/40 rounded px-2.5 py-1 transition-all"
                >
                  Copy
                </button>
              )}
            </div>

            {/* Response Body */}
            <div
              ref={responseRef}
              className="flex-1 overflow-y-auto p-5"
              style={{ maxHeight: "540px" }}
            >
              {/* Empty State */}
              {!response && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0f1e] border border-[#1a2740] flex items-center justify-center text-3xl mb-5">
                    📊
                  </div>
                  <p className="text-[#94a3b8] font-semibold text-base mb-2">Your AI analysis appears here</p>
                  <p className="text-[#475569] text-sm mb-8 max-w-xs">
                    Paste transaction data or upload a CSV to get a detailed financial report
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-left w-full max-w-xs">
                    {[
                      ["📊", "Expense Breakdown"],
                      ["📈", "Trend Detection"],
                      ["💡", "Savings Insights"],
                      ["⚠️", "Risk Assessment"],
                      ["🧾", "Category Analysis"],
                      ["✅", "Action Steps"],
                    ].map(([icon, label]) => (
                      <div key={label} className="bg-[#0a1020] border border-[#1a2740] rounded-lg px-3 py-2.5 flex items-center gap-2">
                        <span className="text-sm">{icon}</span>
                        <span className="text-[#475569] text-xs font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming Response */}
              {(response || isLoading) && (
                <div className="text-[#cbd5e1] text-sm leading-relaxed whitespace-pre-wrap">
                  {response}
                  {isLoading && (
                    <span className="inline-block w-0.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🤖", label: "AI Model", value: "Claude Sonnet 4.6" },
            { icon: "⚡", label: "Response Mode", value: "Real-time Stream" },
            { icon: "🔒", label: "Security", value: "Keys Server-Side" },
            { icon: "☁️", label: "Deployed On", value: "AWS App Runner" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0c1526] border border-[#1a2740] rounded-xl px-4 py-4 text-center">
              <div className="text-xl mb-1.5">{s.icon}</div>
              <div className="text-emerald-400 font-semibold text-xs mb-0.5">{s.value}</div>
              <div className="text-[#475569] text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a2740] mt-12 py-6 text-center text-[#334155] text-xs">
        FinPulse AI — Built with FastAPI + Anthropic Claude + React + Vite · Deployed on AWS
      </footer>
    </div>
  );
}
