import React, { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./App.css"; // optional: your tailwind import here


const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/;

const sanitizeMarkdown = (markdown) => {
  const rawHtml = marked.parse(markdown || "");
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
};

const Home = () => {
  const [profile1, setProfile1] = useState("");
  const [profile2, setProfile2] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedProfile1 = profile1.trim();
    const trimmedProfile2 = profile2.trim();

    if (!trimmedProfile1 || !trimmedProfile2) {
      setError("Both GitHub usernames are required.");
      return;
    }

    if (
      !USERNAME_PATTERN.test(trimmedProfile1) ||
      !USERNAME_PATTERN.test(trimmedProfile2)
    ) {
      setError(
        "Usernames may only contain letters, numbers, and hyphens (max 39 chars)."
      );
      return;
    }

    setLoading(true);
    setReport("");
    setError("");

    try {
      const res = await fetch('/compare', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userA: trimmedProfile1, userB: trimmedProfile2 }),
        credentials: "omit",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        const sanitized = sanitizeMarkdown(data.comparison);
        setReport(sanitized);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch(err) {
      setError(err.message || "Network error or server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111418] dark:text-gray-200 min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              hub
            </span>
            <h2 className="text-lg font-bold">Github Profile</h2>
          </div>
        </header>

        <main className="flex flex-col gap-8">
          <section className="bg-white dark:bg-gray-800/50 rounded-xl p-6 sm:p-8 shadow-sm">
            <p className="text-3xl sm:text-4xl font-black mb-6">
              Compare Profile
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Enter your GitHub username"
                className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 text-base text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                value={profile1}
                onChange={(e) => setProfile1(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter other's GitHub username"
                className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 text-base text-black dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                value={profile2}
                onChange={(e) => setProfile2(e.target.value)}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-5 h-12 font-bold hover:bg-primary/90 transition-colors"
            >
              <span>Generate Report</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </section>

          <section className="bg-white dark:bg-gray-800/50 rounded-xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Report Details</h3>
            {loading && (
              <div className="text-center">
                <div className="spinner mx-auto mb-2"></div>
                <p>Generating comparison report...</p>
              </div>
            )}
            {error && (
              <div className="error-message text-red-500">
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            )}
            {report && (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: report }}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
