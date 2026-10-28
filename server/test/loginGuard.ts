// Per-account lock after wrong passwords: npx tsx test/loginGuard.ts
import { isLocked, MAX_FAILURES, recordFailure, recordSuccess } from "../src/loginGuard.js";

let failures = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failures++;
}

const t = 1_000_000;
const locks = Array.from({ length: MAX_FAILURES }, (_, i) => recordFailure("Anna@Example.com", t + i));
check("10th wrong password locks", locks.indexOf(true) === MAX_FAILURES - 1);
check("locked regardless of case and spaces", isLocked(" anna@example.com ", t + 20));
check("lock ends after 15 minutes", !isLocked("anna@example.com", t + 16 * 60 * 1000));

for (let i = 0; i < MAX_FAILURES - 1; i++) recordFailure("bob@example.com", t + i);
recordSuccess("bob@example.com");
check("a successful login resets the count", !recordFailure("bob@example.com", t + 100) && !isLocked("bob@example.com", t + 101));

for (let i = 0; i < MAX_FAILURES - 1; i++) recordFailure("carl@example.com", t + i * 1000);
check("old failures (over an hour) do not count", !recordFailure("carl@example.com", t + 61 * 60 * 1000));
check("missing e-mail is ignored", !recordFailure(undefined) && !isLocked(undefined));

console.log(failures ? `\n${failures} check(s) failed` : "\nall login guard tests passed");
process.exit(failures ? 1 : 0);
