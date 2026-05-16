#!/usr/bin/env tsx
/**
 * Compute pipeline metrics from the GitHub Actions run history of the
 * current repository (resolved via `gh`). Prints a Markdown report on
 * stdout. Designed to be piped to GITHUB_STEP_SUMMARY in CI or read
 * locally via `pnpm metrics`.
 *
 * Targets reference testing.md §5.1 and §6.
 */

import { execSync } from 'node:child_process';

type Run = {
  databaseId: number;
  workflowName: string;
  status: string;
  conclusion: string | null;
  headSha: string;
  createdAt: string;
  updatedAt: string;
  event: string;
};

const WINDOW = 100;

function gh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' });
}

function fetchRuns(limit: number): Run[] {
  const out = gh(
    `gh run list --limit ${limit} --json databaseId,workflowName,status,conclusion,headSha,createdAt,updatedAt,event`,
  );
  return JSON.parse(out) as Run[];
}

function durationSec(r: Run): number {
  return (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / 1000;
}

function median(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function p95(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.floor(s.length * 0.95));
  return s[idx];
}

function fmtSec(s: number): string {
  if (Number.isNaN(s)) return 'n/a';
  if (s < 60) return `${s.toFixed(0)}s`;
  return `${Math.floor(s / 60)}m${Math.round(s % 60)
    .toString()
    .padStart(2, '0')}s`;
}

function fmtPct(num: number, den: number): string {
  if (den === 0) return 'n/a';
  return `${((num / den) * 100).toFixed(1)}%`;
}

function verdict(actual: number, targetSec: number): string {
  if (Number.isNaN(actual)) return '➖';
  return actual <= targetSec ? '✅' : '❌';
}

function main() {
  const runs = fetchRuns(WINDOW);
  const completed = runs.filter((r) => r.status === 'completed');

  const byWorkflow = new Map<string, Run[]>();
  for (const r of completed) {
    if (!byWorkflow.has(r.workflowName)) byWorkflow.set(r.workflowName, []);
    byWorkflow.get(r.workflowName)!.push(r);
  }

  const lines: string[] = [];
  lines.push(`## Pipeline metrics — last ${completed.length} completed runs`);
  lines.push('');
  if (completed.length === 0) {
    lines.push('_no completed runs in window_');
    console.log(lines.join('\n'));
    return;
  }
  lines.push(`Window: ${completed.at(-1)!.createdAt} → ${completed[0]!.createdAt}`);
  lines.push('');

  lines.push('### Per-workflow');
  lines.push('');
  lines.push('| Workflow | Runs | Success | Median | p95 |');
  lines.push('|---|---:|---:|---:|---:|');
  for (const [name, list] of byWorkflow) {
    const success = list.filter((r) => r.conclusion === 'success').length;
    const durs = list.map(durationSec);
    lines.push(
      `| ${name} | ${list.length} | ${fmtPct(success, list.length)} | ${fmtSec(median(durs))} | ${fmtSec(p95(durs))} |`,
    );
  }
  lines.push('');

  const ciRuns = byWorkflow.get('CI') ?? [];
  const ciDurs = ciRuns.map(durationSec);
  const ciPushes = completed.filter((r) => r.workflowName === 'CI' && r.event === 'push');
  const smokes = completed.filter((r) => r.workflowName === 'Post-Deploy Smoke');
  const smokeBySha = new Map(smokes.map((s) => [s.headSha, s]));

  const pushToProdReady: number[] = [];
  for (const ci of ciPushes) {
    const smoke = smokeBySha.get(ci.headSha);
    if (!smoke) continue;
    pushToProdReady.push(
      (new Date(smoke.updatedAt).getTime() - new Date(ci.createdAt).getTime()) / 1000,
    );
  }

  lines.push('### Lead time vs testing.md §5.1');
  lines.push('');
  lines.push('| Metric | Target | Median | p95 | Verdict |');
  lines.push('|---|---|---:|---:|:---:|');
  lines.push(
    `| Pre-deploy pipeline (CI) | <5 min | ${fmtSec(median(ciDurs))} | ${fmtSec(p95(ciDurs))} | ${verdict(median(ciDurs), 300)} |`,
  );
  lines.push(
    `| Push → production-ready | <15 min | ${fmtSec(median(pushToProdReady))} | ${fmtSec(p95(pushToProdReady))} | ${verdict(median(pushToProdReady), 900)} |`,
  );
  lines.push('');

  const ciFailed = ciRuns.filter((r) => r.conclusion === 'failure').length;
  const monitorRuns = byWorkflow.get('Prod Monitor') ?? [];
  const monitorFailed = monitorRuns.filter((r) => r.conclusion === 'failure').length;
  const smokeFailed = smokes.filter((r) => r.conclusion === 'failure').length;

  lines.push('### Reliability vs testing.md §6');
  lines.push('');
  lines.push('| Metric | Target | Value |');
  lines.push('|---|---|---:|');
  lines.push(
    `| CI failure rate | <1% (flaky) | ${fmtPct(ciFailed, ciRuns.length)} (${ciFailed}/${ciRuns.length}) |`,
  );
  lines.push(`| Post-deploy smoke failures | 0 | ${smokeFailed}/${smokes.length} |`);
  lines.push(`| Prod monitor failures | 0 | ${monitorFailed}/${monitorRuns.length} |`);

  console.log(lines.join('\n'));
}

main();
