const API = "https://api.github.com";

type Init = RequestInit;

async function ghFetch(token: string, path: string, init: Init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res;
}

export type RemoteFile = { name: string; path: string; sha: string };

export async function listPostFiles(
  token: string,
  repo: string,
  branch: string,
): Promise<RemoteFile[]> {
  const res = await ghFetch(
    token,
    `/repos/${repo}/contents/content/posts?ref=${encodeURIComponent(branch)}`,
  );
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (f: { type?: string; name?: string }) =>
        f.type === "file" && (f.name ?? "").endsWith(".md"),
    )
    .map((f: { name: string; path: string; sha: string }) => ({
      name: f.name,
      path: f.path,
      sha: f.sha,
    }));
}

export async function readRemoteFile(
  token: string,
  repo: string,
  branch: string,
  filePath: string,
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${API}/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  return {
    content: Buffer.from(data.content, "base64").toString("utf-8"),
    sha: data.sha,
  };
}

export async function writeRemoteFile(
  token: string,
  repo: string,
  branch: string,
  filePath: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  await ghFetch(token, `/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function deleteRemoteFile(
  token: string,
  repo: string,
  branch: string,
  filePath: string,
  message: string,
  sha: string,
): Promise<void> {
  await ghFetch(token, `/repos/${repo}/contents/${filePath}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch, sha }),
  });
}

export async function getCurrentUser(
  token: string,
): Promise<{ login: string; name: string; avatar_url: string }> {
  const res = await ghFetch(token, "/user");
  return (await res.json()) as {
    login: string;
    name: string;
    avatar_url: string;
  };
}
