import React, { useState } from "react";
import { Trophy, Github, Star, Users, GitFork, TrendingUp, AlertCircle, CheckCircle, XCircle, Award, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/;

const COLORS = {
  userA: "#3b82f6",
  userB: "#10b981",
  chart: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
};

const SimpleRadarChart = ({ data, usernames }) => {
  const metrics = Object.entries(data);
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const angleStep = (2 * Math.PI) / metrics.length;

  const getPoint = (value, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const distance = (value / 10) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const userAPoints = metrics.map(([_, val], i) => getPoint(val.userA, i));
  const userBPoints = metrics.map(([_, val], i) => getPoint(val.userB, i));
  const labelPoints = metrics.map((_, i) => getPoint(10.5, i));

  const pathA = `M ${userAPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  const pathB = `M ${userBPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {[2, 4, 6, 8, 10].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            className="dark:stroke-gray-600"
          />
        ))}
        
        {/* Axis lines */}
        {metrics.map((_, i) => {
          const point = getPoint(10, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              className="dark:stroke-gray-600"
            />
          );
        })}

        {/* User B polygon */}
        <path d={pathB} fill={COLORS.userB} fillOpacity="0.3" stroke={COLORS.userB} strokeWidth="2" />
        
        {/* User A polygon */}
        <path d={pathA} fill={COLORS.userA} fillOpacity="0.3" stroke={COLORS.userA} strokeWidth="2" />

        {/* Labels */}
        {metrics.map(([key], i) => {
          const point = labelPoints[i];
          const label = key.replace(/([A-Z])/g, ' $1').trim();
          return (
            <text
              key={i}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-semibold fill-gray-600 dark:fill-gray-400"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm font-medium">{usernames.userA}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium">{usernames.userB}</span>
        </div>
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, username, colorIndex }) => {
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  let currentAngle = -90;

  return (
    <div className="flex flex-col items-center">
      <svg width={250} height={250} viewBox="0 0 250 250">
        {data.map((item, i) => {
          const angle = (item.percentage / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (currentAngle * Math.PI) / 180;
          const radius = 80;
          const cx = 125;
          const cy = 125;

          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={i}
              d={path}
              fill={COLORS.chart[i % COLORS.chart.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-4 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: COLORS.chart[i % COLORS.chart.length] }}
            />
            <span className="font-medium">{item.name}:</span>
            <span className="text-gray-600 dark:text-gray-400">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [profile1, setProfile1] = useState("");
  const [profile2, setProfile2] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedProfile1 = profile1.trim();
    const trimmedProfile2 = profile2.trim();

    if (!trimmedProfile1 || !trimmedProfile2) {
      setError("Both GitHub usernames are required.");
      return;
    }

    if (!USERNAME_PATTERN.test(trimmedProfile1) || !USERNAME_PATTERN.test(trimmedProfile2)) {
      setError("Usernames may only contain letters, numbers, and hyphens (max 39 chars).");
      return;
    }

    setLoading(true);
    setAnalyticsData(null);
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

      if (data.success && data.analyticsData) {
        setAnalyticsData(data.analyticsData);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch(err) {
      setError(err.message || "Network error or server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Github className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GitHub Profile Analytics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compare and analyze developer profiles</p>
              </div>
            </div>
          </div>
        </header>

        {/* Input Section */}
        <div className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Compare Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                First Developer
              </label>
              <input
                type="text"
                placeholder="e.g., torvalds"
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                value={profile1}
                onChange={(e) => setProfile1(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Second Developer
              </label>
              <input
                type="text"
                placeholder="e.g., gaearon"
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all"
                value={profile2}
                onChange={(e) => setProfile2(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 font-bold hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Profiles...
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Compare & Analyze
              </>
            )}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-300">Error</h4>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Final Verdict Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl sm:text-3xl font-black">Final Verdict</h2>
              </div>
              <p className="text-lg sm:text-xl leading-relaxed opacity-95">{analyticsData.finalVerdict}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { label: "Repos", key: "repos", icon: GitFork, gradient: "from-blue-500 to-cyan-500" },
                { label: "Followers", key: "followers", icon: Users, gradient: "from-purple-500 to-pink-500" },
                { label: "Following", key: "following", icon: Users, gradient: "from-green-500 to-emerald-500" },
                { label: "Stars", key: "stars", icon: Star, gradient: "from-yellow-500 to-orange-500" },
                { label: "Contributions", key: "contributions", icon: Github, gradient: "from-indigo-500 to-purple-500" }
              ].map(({ label, key, icon: Icon, gradient }) => (
                <div key={key} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`bg-gradient-to-br ${gradient} p-1.5 rounded-lg`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                        {analyticsData.statistics?.userA?.[key] || 0}
                      </span>
                      <span className="text-xs text-gray-500">{analyticsData.usernames?.userA}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-green-600 dark:text-green-400">
                        {analyticsData.statistics?.userB?.[key] || 0}
                      </span>
                      <span className="text-xs text-gray-500">{analyticsData.usernames?.userB}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart */}
            {analyticsData?.metrics && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                  Performance Analysis
                </h3>
                <div className="flex justify-center">
                  <SimpleRadarChart data={analyticsData.metrics} usernames={analyticsData.usernames} />
                </div>
              </div>
            )}

            {/* Score Gauges */}
            {analyticsData?.overallScores && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Head-to-Head Score
                  </h3>
                  <div className="space-y-4">
                    {['userA', 'userB'].map((user, idx) => (
                      <div key={user}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{analyticsData.usernames[user]}</span>
                          <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {analyticsData.overallScores.headToHead[user]}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-4 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} transition-all duration-1000 shadow-lg`}
                            style={{ width: `${(analyticsData.overallScores.headToHead[user] / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {analyticsData.overallScores.headToHead.verdict}
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Absolute Quality
                  </h3>
                  <div className="space-y-4">
                    {['userA', 'userB'].map((user, idx) => (
                      <div key={user}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{analyticsData.usernames[user]}</span>
                          <span className="font-black text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {analyticsData.overallScores.absolute[user]}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-4 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-pink-500 to-pink-600'} transition-all duration-1000 shadow-lg`}
                            style={{ width: `${(analyticsData.overallScores.absolute[user] / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {analyticsData.overallScores.absolute.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Language Distribution */}
            {analyticsData?.topLanguages && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['userA', 'userB'].map((user, idx) => (
                  <div key={user} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-indigo-500" />
                      {analyticsData.usernames[user]} - Top Languages
                    </h3>
                    <SimplePieChart data={analyticsData.topLanguages[user]} username={analyticsData.usernames[user]} colorIndex={idx} />
                  </div>
                ))}
              </div>
            )}

            {/* Insights Section */}
            {analyticsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['userA', 'userB'].map((user, idx) => (
                  <div key={user} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-1 h-8 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <h3 className="text-xl font-black">{analyticsData.usernames[user]}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-l-4 border-green-500">
                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {analyticsData.strengths[user].map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-500 mt-1">●</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-l-4 border-red-500">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-1.5">
                          {analyticsData.weaknesses[user].map((weakness, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-red-500 mt-1">●</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Action Steps
                        </h4>
                        <ul className="space-y-1.5">
                          {analyticsData.improvements[user].map((improvement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">●</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;