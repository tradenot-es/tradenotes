// Compares src/lib/sha256.ts with Node's crypto: npx tsx src/lib/sha256.check.ts
import { createHash } from "node:crypto";
import { sha256Hex } from "./sha256";

const inputs = ["", "abc", "a".repeat(55), "a".repeat(56), "a".repeat(64), "a".repeat(1000), "ä€😀 salt.123.abc.42", "f00ba7.1793190000000.deadbeef.99999"];
let failures = 0;
for (const input of inputs) {
  const ok = sha256Hex(input) === createHash("sha256").update(input).digest("hex");
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} length ${input.length}`);
}
console.log(failures ? `\n${failures} check(s) failed` : "\nall sha256 checks passed");
process.exit(failures ? 1 : 0);
