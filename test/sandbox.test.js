import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { connect } from "node:net";
import { lookup } from "node:dns/promises";

// SAFE sandbox probes (v12 rewrite). Nothing is sent anywhere: network probes only
// open and immediately close a TCP socket, and file probes only check whether a read
// is refused. No secret value is ever printed, only the NAME of the probe that leaked.
//
// ONE test on purpose. On a GitHub runner the egress/DNS probes succeed, so this test
// is RED there and Draft Fixer picks it up. In a correct Draft Fixer sandbox every probe
// is blocked, the re-run is GREEN, and the result must be `not_reproduced`.
// If ANY probe leaks on the server, this same test fails the same way (same name,
// expected true / actual false), the failure "reproduces", and the server log shows a
// `step model` line. That model step is the visible leak signal (HARD FAIL).
//
// The v10 version asserted that the *parent* process environ is unreadable. In v12 the
// parent is the same-uid `node --test` runner, whose environ is minimal and readable by
// design, so that probe failed inside a correct sandbox and faked a leak. Retired.

const SECRET_NAMES = ["GITHUB_APP_PRIVATE_KEY", "GITHUB_WEBHOOK_SECRET", "OPENAI_API_KEY"];
const SERVER_FILES = ["/app/draft-fixer.live.json", "/data/draft-fixer-state.json", "/proc/1/environ"];

function statusField(pid, field) {
  try {
    const m = new RegExp(`^${field}:\\s+(\\d+)`, "m").exec(readFileSync(`/proc/${pid}/status`, "utf8"));
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

function tcpReachable(host, port, ms = 3000) {
  return new Promise((resolve) => {
    const sock = connect({ host, port });
    const done = (v) => { sock.destroy(); resolve(v); };
    sock.setTimeout(ms);
    sock.on("connect", () => done(true));
    sock.on("timeout", () => done(false));
    sock.on("error", () => done(false));
  });
}

test("sandbox holds: no secrets, no foreign process access, no egress", async () => {
  const leaks = [];
  const me = process.getuid();

  for (const name of SECRET_NAMES) if (process.env[name] !== undefined) leaks.push(`env:${name}`);
  for (const [k, v] of Object.entries(process.env)) {
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(v ?? "")) leaks.push(`env-pem:${k}`);
  }

  // Walk up the process tree. Same-uid ancestors (npm, sh, node --test) are expected.
  // An ancestor owned by another uid (the webhook server runs as root) must not be
  // readable or signalable, and no readable ancestor may carry an app secret.
  let pid = process.ppid;
  for (let hop = 0; hop < 16 && pid > 1; hop += 1) {
    const uid = statusField(pid, "Uid");
    let environ = null;
    try { environ = readFileSync(`/proc/${pid}/environ`, "latin1"); } catch {}
    if (environ !== null && SECRET_NAMES.some((n) => environ.includes(`${n}=`))) leaks.push(`ancestor-secret:${hop}`);
    if (uid !== null && uid !== me) {
      if (environ !== null) leaks.push(`foreign-environ:${hop}`);
      try { readFileSync(`/proc/${pid}/mem`); leaks.push(`foreign-mem:${hop}`); } catch {}
      try { process.kill(pid, 0); leaks.push(`foreign-signal:${hop}`); } catch {}
    }
    pid = statusField(pid, "PPid") ?? 0;
  }

  for (const file of SERVER_FILES) {
    try { readFileSync(file); leaks.push(`file:${file}`); } catch {}
  }

  if (await tcpReachable("1.1.1.1", 443)) leaks.push("egress:1.1.1.1:443");
  if (await tcpReachable("169.254.169.254", 80, 1500)) leaks.push("egress:metadata");
  try { await lookup("registry.npmjs.org"); leaks.push("dns"); } catch {}

  console.log(`probe leaks: ${leaks.length === 0 ? "none" : leaks.join(", ")}`);
  assert.equal(leaks.length === 0, true, `sandbox leaks: ${leaks.join(", ")}`);
});
