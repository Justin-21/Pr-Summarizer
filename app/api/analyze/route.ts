import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const schema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()).min(2).max(5),
  risks: z
    .array(
      z.object({
        severity: z.enum(["High", "Medium", "Low"]),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .max(5),
  tests: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(2)
    .max(5),
});

function parsePullRequestUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid GitHub pull request URL.");
  }
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);
  if (url.hostname !== "github.com" || !match)
    throw new Error("Use a URL like github.com/owner/repo/pull/123.");
  return { owner: match[1], repo: match[2], number: match[3] };
}

async function github(path: string) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    if (response.status === 404)
      throw new Error("Pull request not found, or its repository is private.");
    if (response.status === 403)
      throw new Error(
        "GitHub rate limit reached. Add a GITHUB_TOKEN and try again.",
      );
    throw new Error(
      `GitHub couldn't load this pull request (HTTP ${response.status}).`,
    );
  }
  return response.json();
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY)
      return Response.json(
        {
          error: "Add OPENROUTER_API_KEY to your .env file to enable analysis.",
        },
        { status: 503 },
      );
    const body = await request.json();
    if (typeof body.url !== "string")
      return Response.json(
        { error: "Paste a GitHub pull request URL to get started." },
        { status: 400 },
      );
    const { owner, repo, number } = parsePullRequestUrl(body.url.trim());
    const base = `/repos/${owner}/${repo}/pulls/${number}`;
    const [pr, files] = await Promise.all([
      github(base),
      github(`${base}/files?per_page=100`),
    ]);
    const patch = (
      files as Array<{
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        patch?: string;
      }>
    )
      .map(
        (file) =>
          `FILE: ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})\n${file.patch ?? "Patch unavailable"}`,
      )
      .join("\n\n")
      .slice(0, 45_000);
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      compatibility: "compatible",
      name: "openrouter",
    });
    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),
      schema,
      system:
        "You are a careful senior software engineer writing a concise pull request review brief. Ground every claim in the supplied title, description, and diff. Never invent behavior. Distinguish confirmed issues from areas worth checking. Highlight meaningful risks, including security, compatibility, data integrity, and missing edge cases. If no concrete risks are visible, say so clearly. Suggest actionable tests that cover the change.",
      prompt: `Review this pull request.\n\nTITLE: ${pr.title}\nAUTHOR: ${pr.user?.login}\nDESCRIPTION: ${pr.body || "No description provided."}\nCHANGED FILES: ${pr.changed_files}\nADDITIONS: ${pr.additions} DELETIONS: ${pr.deletions}\n\nDIFF:\n${patch}`,
    });
    console.log("Analysis result:", result.object);
    return Response.json({
      pullRequest: {
        title: pr.title,
        number: pr.number,
        owner,
        repo,
        author: pr.user?.login,
        avatar: pr.user?.avatar_url,
        state: pr.state,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        url: pr.html_url,
      },
      analysis: result.object,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status: 400 });
  }
}
