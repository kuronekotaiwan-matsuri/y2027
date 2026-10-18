#!/usr/bin/env node
// yomiyasu（AI が生成した日本語を推敲するスキル。プラグイン yomiyasu@yomiyasu）の
// 導入済みの版と、GitHub の最新リリースを比べる。/polish スキルが最初に実行する。
//
// 使い方:
//   node scripts/yomiyasu-check-update.mjs
//
// 出力は1〜5行。「配置:」の行は、導入済みの SKILL.md と scripts/ があるフォルダ。
// ネットワークに出られないときは「確認できません」と出すだけで、作業は止めない。
// 終了コードは常に 0。

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const REPO = "nanaism/yomiyasu";
const PLUGIN_ID = "yomiyasu@yomiyasu";
const API = `https://api.github.com/repos/${REPO}/releases/latest`;
const TIMEOUT_MS = 6000;

function configDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(homedir(), ".claude");
}

function normalizePath(p) {
  return path.resolve(p).toLowerCase();
}

function isSemver(v) {
  return /^\d+\.\d+\.\d+/.test(v ?? "");
}

// installed_plugins.json から、このプロジェクト向けの導入を探す
function installedVersion() {
  const file = path.join(configDir(), "plugins", "installed_plugins.json");
  if (!existsSync(file)) return null;
  let json;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
  const entries = json?.plugins?.[PLUGIN_ID];
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const cwd = normalizePath(process.cwd());
  const pick =
    entries.find((e) => e.projectPath && normalizePath(e.projectPath) === cwd) ??
    entries.find((e) => e.scope === "user") ??
    entries[0];
  let version = pick.version;
  if (!isSemver(version) && pick.installPath) {
    // 版がコミットハッシュのときは plugin.json の version を見る
    try {
      const manifest = JSON.parse(
        readFileSync(path.join(pick.installPath, ".claude-plugin", "plugin.json"), "utf8"),
      );
      if (isSemver(manifest.version)) version = manifest.version;
    } catch {
      // 読めなければ installed_plugins.json の値のまま
    }
  }
  const skillDir = pick.installPath ? path.join(pick.installPath, "skills", "yomiyasu") : null;
  return { version: String(version ?? "unknown"), scope: pick.scope, skillDir };
}

async function latestRelease() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "kuronekotaiwan-matsuri-y2027-yomiyasu-check",
      },
      signal: controller.signal,
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const json = await res.json();
    return {
      version: String(json.tag_name ?? "").replace(/^v/, ""),
      published: String(json.published_at ?? "").slice(0, 10),
      url: json.html_url,
    };
  } catch (e) {
    return { error: e?.name === "AbortError" ? "タイムアウト" : (e?.message ?? String(e)) };
  } finally {
    clearTimeout(timer);
  }
}

function compareVersions(a, b) {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

async function main() {
  const installed = installedVersion();
  const latest = await latestRelease();
  const lines = [];

  if (!installed) {
    lines.push("yomiyasu: 導入されていません。次を1つずつ実行してから使う:");
    lines.push(`  claude plugin marketplace add ${REPO} --scope project`);
    lines.push(`  claude plugin install ${PLUGIN_ID} --scope project`);
  } else if (latest.error) {
    lines.push(
      `yomiyasu: 導入 ${installed.version}。最新版を確認できません（${latest.error}）。現行版で進めてよい`,
    );
  } else if (!isSemver(installed.version)) {
    lines.push(
      `yomiyasu: 導入 ${installed.version}（版を読めない） / 最新 ${latest.version}（${latest.published}）。比べられないので、念のため更新手順を実行してよい`,
    );
  } else if (compareVersions(installed.version, latest.version) >= 0) {
    lines.push(
      `yomiyasu: 導入 ${installed.version} / 最新 ${latest.version}（${latest.published}）→ 最新です`,
    );
  } else {
    lines.push(
      `yomiyasu: 導入 ${installed.version} / 最新 ${latest.version}（${latest.published}）→ 更新あり ${latest.url}`,
    );
    lines.push("  更新するには次を1つずつ実行する:");
    lines.push("  1. claude plugin marketplace update yomiyasu");
    lines.push(`  2. claude plugin update ${PLUGIN_ID}`);
    lines.push("  3. Claude Code を再起動する（更新は再起動後に反映され、今のセッションは現行版のまま）");
  }
  if (installed?.skillDir) {
    lines.push(`  配置: ${installed.skillDir}`);
  }

  process.stdout.write(lines.join("\n") + "\n");
}

main().catch((e) => {
  process.stdout.write(`yomiyasu: 確認に失敗（${e?.message ?? e}）。現行版で進めてよい\n`);
});
