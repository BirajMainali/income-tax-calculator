export const GITHUB_REPO = 'BirajMainali/income-tax-calculator';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

export async function fetchGitHubStars() {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }
  const data = await res.json();
  return data.stargazers_count ?? 0;
}
