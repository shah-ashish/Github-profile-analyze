import puppeteer from "puppeteer";

/**
 * scrapeGitHubUser
 * Scrapes a GitHub profile and top repositories with detailed info
 *
 * @param {string} username - GitHub username
 * @returns {Promise<object|null>} - Profile data or null if user not found
 */













export async function scrapeGitHubUser(username) {
  const profileUrl = `https://github.com/${username}`;
  let browser;

  try {
    console.log(`[INFO] Launching browser for user: ${username}`);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`[INFO] Navigating to profile: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: "domcontentloaded" });

    // Step 1: Check if user exists
    const isNotFound = await page.evaluate(() => {
      const title = document.querySelector("title");
      return title ? title.innerText.includes("Page not found") : false;
    });

    if (isNotFound) {
      console.warn(`[WARN] User not found: ${username}`);
      await browser.close();
      return res.json({success:false,error:'invalid username'});
    }

    console.log(`[INFO] User exists. Scraping profile info...`);

    // Step 2: Scrape profile info
    const profileData = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText.trim() || null;
      const getAttr = (selector, attr) => document.querySelector(selector)?.getAttribute(attr) || null;

      return {
        name: getText('span.p-name.vcard-fullname') || getText('span.vcard-username'),
        login: getText('span.vcard-username'),
        bio: getText('div.p-note'),
        followers: getText('a[href$="?tab=followers"] span.Counter'),
        following: getText('a[href$="?tab=following"] span.Counter'),
        reposCount: getText('a[href$="?tab=repositories"] span.Counter'),
        avatar_url: getAttr('img.avatar-user', 'src'),
        location: getText('li[itemprop="homeLocation"]'),
        blog: getText('li[itemprop="url"] a'),
        twitter: getText('li[itemprop="twitter"] a') || null,
      };
    });

    console.log(`[INFO] Profile info scraped. Navigating to repositories tab...`);

    // Step 3: Scrape repositories
    await page.goto(`${profileUrl}?tab=repositories`, { waitUntil: "domcontentloaded" });

    const topRepos = await page.evaluate(() => {
      const repos = [];

      document.querySelectorAll('li[itemprop="owns"]').forEach(repo => {
        const name = repo.querySelector('a[itemprop="name codeRepository"]')?.innerText?.trim() || null;
        const url = repo.querySelector('a[itemprop="name codeRepository"]')?.href || null;
        const desc = repo.querySelector('p[itemprop="description"]')?.innerText?.trim() || null;
        const language = repo.querySelector('span[itemprop="programmingLanguage"]')?.innerText?.trim() || null;
        const starsText = repo.querySelector('a[href$="/stargazers"]')?.innerText?.trim() || '0';
        const stars = parseInt(starsText.replace(',', '')) || 0;

        // Try to get README link or homepage if exists
        const homepage = repo.querySelector('a[href^="http"]:not([href*="github.com"])')?.href || null;

        if (name) {
          repos.push({
            name,
            url,
            description: desc,
            language,
            stars,
            homepage
          });
        }
      });

      // Sort by stars descending
      repos.sort((a, b) => b.stars - a.stars);
      return repos;
    });

    profileData.topRepos = topRepos;

    console.log(`[INFO] Scraping completed for user: ${username}`);
 

    await browser.close();

    return profileData;
  } catch (err) {
    console.error(`[ERROR] Failed to scrape ${username}:`, err);
    if (browser) await browser.close();
    return null;
  }
}


/**
 * scrapeTwoGitHubUsers
 * Scrapes two GitHub profiles in parallel
 *
 * @param {string} userA
 * @param {string} userB
 * @returns {Promise<{userAData: object|null, userBData: object|null}>}
 */
export async function scrapeTwoGitHubUsers(userA, userB) {
  console.log("[INFO] Starting scraping for two users...");
  const [userAData, userBData] = await Promise.all([
    scrapeGitHubUser(userA),
    scrapeGitHubUser(userB),
  ]);
  console.log("[INFO] Completed scraping both users.");
  const account = {'userA': userAData, 'userB':userBData };
  return account;
}


// // ashish-kumar-shah
// // shah-ashish

// scrapeTwoGitHubUsers('shah-ashish','ashish-kumar-shah')
// // scrapeGitHubUser('shah-ashish')
// // scrapeGitHubUser('ashish-kumar-shah')