export async function fetchFilesFromLatestRelease(owner, repo, filenames = []) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();
    const assets = data.assets || [];
    const nameToUrl = Object.fromEntries(
      assets.map((a) => [a.name, a.browser_download_url])
    );
    const results = {};
    for (const f of filenames) {
      if (nameToUrl[f]) {
        try {
          const r = await fetch(nameToUrl[f]);
          if (r.ok) results[f] = await r.json();
          else results[f] = null;
        } catch (e) {
          results[f] = null;
        }
      } else {
        results[f] = null;
      }
    }
    return results;
  } catch (err) {
    const obj = {};
    for (const f of filenames) obj[f] = null;
    return obj;
  }
}
