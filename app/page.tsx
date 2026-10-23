"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Code2,
  FileCode2,
  Github,
  GitPullRequest,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from "lucide-react";

type Result = {
  pullRequest: {
    title: string;
    number: number;
    owner: string;
    repo: string;
    author: string;
    avatar: string;
    state: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    url: string;
  };
  analysis: {
    summary: string;
    highlights: string[];
    risks: {
      severity: "High" | "Medium" | "Low";
      title: string;
      detail: string;
    }[];
    tests: { title: string; detail: string }[];
  };
};

const examples = ["vercel/next.js/pull/70236", "facebook/react/pull/30119"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Code2 size={17} />
          </span>{" "}
          diffwise<span className="brand-dot">.</span>
        </a>
        <div className="nav-right">
          <span className="nav-note">
            <span className="live-dot" /> AI code review, in a flash
          </span>
          <a
            className="github-link"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            Built for GitHub <ArrowUpRight size={14} />
          </a>
        </div>
      </nav>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={13} /> YOUR PR, DECODED
          </div>
          <h1>
            Less diff.
            <br />
            <span>More clarity.</span>
          </h1>
          <p className="hero-lede">
            The context you need to review with confidence.
            <br className="desktop-break" /> Understand the change, spot the
            risks, know what to test.
          </p>
          <div className="trust-row">
            <div className="trust-icon">
              <LockKeyhole size={14} />
            </div>
            <span>Public repos, private by design</span>
            <span className="trust-sep">·</span>
            <span>No code stored</span>
          </div>
        </div>
        <div className="input-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">START WITH A LINK</span>
              <h2>Drop in a pull request</h2>
            </div>
            <span className="card-step">
              01 <span>/ 01</span>
            </span>
          </div>
          <form onSubmit={analyze}>
            <label htmlFor="pr-url">GitHub pull request URL</label>
            <div className="input-wrap">
              <Github size={17} />
              <input
                id="pr-url"
                type="url"
                placeholder="https://github.com/owner/repo/pull/123"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <span className="input-suffix">URL</span>
            </div>
            <button className="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={17} /> Reading the diff…
                </>
              ) : (
                <>
                  Generate review brief <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="error">
              <CircleAlert size={16} />
              {error}
            </div>
          )}
          <div className="examples">
            <span>TRY AN EXAMPLE</span>
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setUrl(`https://github.com/${example}`)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>
      {result ? (
        <Results result={result} />
      ) : (
        <section className="features wrap">
          <div className="features-top">
            <span className="section-label">A BETTER FIRST READ</span>
            <span className="feature-count">01 — 03</span>
          </div>
          <div className="feature-grid">
            <Feature
              number="01"
              icon={<FileCode2 size={19} />}
              title="The story behind the diff"
              text="A plain-English summary of what changed and why it matters."
            />
            <Feature
              number="02"
              icon={<ShieldCheck size={19} />}
              title="Risks worth a second look"
              text="Potential edge cases and breakage areas, grounded in the actual changes."
            />
            <Feature
              number="03"
              icon={<TestTube2 size={19} />}
              title="Tests that make sense"
              text="Specific, actionable test ideas tailored to this pull request."
            />
          </div>
        </section>
      )}
      <footer className="footer wrap">
        <span>Made for the moments before “Approve”.</span>
        <span>
          Diffwise <span className="footer-dot">©</span> 2025
        </span>
      </footer>
    </main>
  );
}

function Feature({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      <div className="feature-meta">
        <span className="feature-icon">{icon}</span>
        <span>{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Results({ result }: { result: Result }) {
  const { pullRequest: pr, analysis } = result;
  return (
    <section className="results wrap">
      <div className="result-head">
        <div>
          <span className="section-label">YOUR REVIEW BRIEF</span>
          <h2>{pr.title}</h2>
          <div className="pr-meta">
            <img src={pr.avatar} alt="" />
            <span>
              {pr.owner}/{pr.repo}
            </span>
            <span className="meta-divider">·</span>
            <span>#{pr.number}</span>
            <span className="meta-divider">·</span>
            <span>by {pr.author}</span>
          </div>
        </div>
        <a className="open-pr" href={pr.url} target="_blank" rel="noreferrer">
          View pull request <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="stats">
        <div>
          <span>FILES CHANGED</span>
          <strong>
            <FileCode2 size={15} />
            {pr.changedFiles}
          </strong>
        </div>
        <div>
          <span>LINES ADDED</span>
          <strong className="green">
            <ArrowUpRight size={15} />+{pr.additions}
          </strong>
        </div>
        <div>
          <span>LINES REMOVED</span>
          <strong className="red">
            <ArrowDown size={15} />
            {pr.deletions}
          </strong>
        </div>
        <div>
          <span>REVIEW STATUS</span>
          <strong>
            <span className="status-dot" />
            Ready to review
          </strong>
        </div>
      </div>
      <div className="summary-card">
        <div className="result-section-title">
          <span className="result-icon violet">
            <Sparkles size={17} />
          </span>
          <div>
            <span className="mini-label">THE BIG PICTURE</span>
            <h3>What this change does</h3>
          </div>
        </div>
        <p className="summary-text">{analysis.summary}</p>
        {analysis.highlights.length > 0 && (
          <div className="highlights">
            {analysis.highlights.map((item, i) => (
              <div className="highlight" key={i}>
                <Check size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="result-columns">
        <div className="detail-card">
          <div className="result-section-title">
            <span className="result-icon amber">
              <ShieldCheck size={17} />
            </span>
            <div>
              <span className="mini-label">THINGS TO CHECK</span>
              <h3>
                Potential risks{" "}
                <span className="count-pill">{analysis.risks.length}</span>
              </h3>
            </div>
          </div>
          {analysis.risks.length ? (
            <div className="item-list">
              {analysis.risks.map((risk, i) => (
                <div className="risk-item" key={i}>
                  <div className="item-top">
                    <span className={`severity ${risk.severity.toLowerCase()}`}>
                      {risk.severity}
                    </span>
                    <ChevronDown size={15} />
                  </div>
                  <strong>{risk.title}</strong>
                  <p>{risk.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Check size={16} /> No specific risks surfaced in this diff.
            </div>
          )}
        </div>
        <div className="detail-card">
          <div className="result-section-title">
            <span className="result-icon mint">
              <TestTube2 size={17} />
            </span>
            <div>
              <span className="mini-label">COVER THE EDGES</span>
              <h3>
                Suggested tests{" "}
                <span className="count-pill">{analysis.tests.length}</span>
              </h3>
            </div>
          </div>
          <div className="item-list">
            {analysis.tests.map((test, i) => (
              <div className="test-item" key={i}>
                <div className="item-top">
                  <span className="test-number">TEST 0{i + 1}</span>
                  <Clock3 size={14} />
                </div>
                <strong>{test.title}</strong>
                <p>{test.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="start-over" onClick={() => window.location.reload()}>
        Analyze another pull request <ArrowRight size={15} />
      </button>
    </section>
  );
}
