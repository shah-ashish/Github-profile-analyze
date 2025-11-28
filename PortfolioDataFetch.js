import axios from "axios";

/**
 * scrapeGitHubUser
 * Fetches GitHub profile and top repositories via GitHub API
 *
 * @param {string} username - GitHub username
 * @returns {Promise<object|null>} - Profile data or null if user not found
 */
export async function scrapeGitHubUser(username) {
  try {
    console.log(`[INFO] Fetching data for user: ${username}`);

    // Fetch profile
    const profileRes = await axios.get(`https://api.github.com/users/${username}`);
    const profile = profileRes.data;

    // Fetch repos
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = reposRes.data;

    // Sort repos by stars descending and pick top 5
    const topRepos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        homepage: repo.homepage || null,
      }));

    const profileData = {
      name: profile.name || profile.login,
      login: profile.login,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      reposCount: profile.public_repos,
      avatar_url: profile.avatar_url,
      location: profile.location,
      blog: profile.blog || null,
      twitter: profile.twitter_username || null,
      topRepos,
    };

    console.log(`[INFO] Fetched data for user: ${username}`);
    return profileData;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.warn(`[WARN] User not found: ${username}`);
    } else {
      console.error(`[ERROR] Failed to fetch data for ${username}:`, err.message);
    }
    return null;
  }
}

/**
 * scrapeTwoGitHubUsers
 * Fetches two GitHub profiles in parallel
 *
 * @param {string} userA
 * @param {string} userB
 * @returns {Promise<{userAData: object|null, userBData: object|null}>}
 */
export async function scrapeTwoGitHubUsers(userA, userB) {
  console.log("[INFO] Starting fetch for two users...");
  const [userAData, userBData] = await Promise.all([
    scrapeGitHubUser(userA),
    scrapeGitHubUser(userB),
  ]);
  console.log("[INFO] Completed fetching both users.");
  return { userA: userAData, userB: userBData };
}

// Example usage:
// scrapeTwoGitHubUsers('shah-ashish', 'ashish-kumar-shah').then(console.log);
