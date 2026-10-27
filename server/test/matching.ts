// Unit tests for the fill → trade matching: npx tsx test/matching.ts
import assert from "node:assert/strict";
import { Fill, matchFills } from "../src/matching.js";

let n = 0;
const fill = (side: "buy" | "sell", qty: number, price: number, extra: Partial<Fill> = {}): Fill => ({
  id: `f${++n}`,
  side,
  qty,
  price,
  time: new Date(Date.UTC(2026, 9, 26, 14, n)).toISOString(),
  commission: 0,
  high: null,
  low: null,
  ...extra,
});

const cases: [string, () => void][] = [
  ["simple long", () => {
    const { trades, open } = matchFills([fill("buy", 1, 100), fill("sell", 1, 110)]);
    assert.equal(trades.length, 1);
    assert.equal(trades[0].side, "long");
    assert.equal(trades[0].points, 10);
    assert.equal(open.length, 0);
  }],
  ["simple short", () => {
    const { trades } = matchFills([fill("sell", 2, 110), fill("buy", 2, 100)]);
    assert.equal(trades[0].side, "short");
    assert.equal(trades[0].points, 20);
  }],
  ["scale out", () => {
    const { trades } = matchFills([fill("buy", 2, 100), fill("sell", 1, 110), fill("sell", 1, 120)]);
    assert.equal(trades.length, 1);
    assert.equal(trades[0].qty, 2);
    assert.equal(trades[0].points, 30);
    assert.equal(trades[0].exitPrice, 115);
  }],
  ["scale in", () => {
    const { trades } = matchFills([fill("buy", 1, 100), fill("buy", 1, 105), fill("sell", 2, 110)]);
    assert.equal(trades.length, 1);
    assert.equal(trades[0].entryPrice, 102.5);
    assert.equal(trades[0].points, 15);
  }],
  ["fifo with partial lots", () => {
    // buy 2 @100, buy 1 @106, sell 1 @110 → still long 2, sell 2 @104
    const { trades } = matchFills([fill("buy", 2, 100), fill("buy", 1, 106), fill("sell", 1, 110), fill("sell", 2, 104)]);
    // closes: 1@100→110 (+10), 1@100→104 (+4), 1@106→104 (-2)
    assert.equal(trades[0].points, 12);
  }],
  ["reversal splits the fill", () => {
    const { trades, open } = matchFills([fill("buy", 1, 100, { commission: 1 }), fill("sell", 3, 110, { commission: 3 }), fill("buy", 2, 105)]);
    assert.equal(trades.length, 2);
    assert.deepEqual(trades.map((t) => [t.side, t.qty, t.points]), [["long", 1, 10], ["short", 2, 10]]);
    assert.equal(trades[0].commission, 2); // 1 + a third of 3
    assert.equal(trades[1].commission, 2);
    assert.equal(trades[1].fills[0].copyOf, trades[0].fills[1].id);
    assert.equal(open.length, 0);
  }],
  ["open position stays open", () => {
    const { trades, open } = matchFills([fill("buy", 1, 100), fill("sell", 1, 101), fill("buy", 2, 102), fill("sell", 1, 103)]);
    assert.equal(trades.length, 1);
    assert.equal(open.length, 2);
  }],
  ["high/low from client and fills", () => {
    const { trades } = matchFills([fill("buy", 1, 100), fill("sell", 1, 104, { high: 108, low: 97 })]);
    assert.equal(trades[0].high, 108);
    assert.equal(trades[0].low, 97);
  }],
  ["out-of-order input is sorted by time", () => {
    const a = fill("buy", 1, 100);
    const b = fill("sell", 1, 110);
    const { trades } = matchFills([b, a]);
    assert.equal(trades[0].side, "long");
    assert.equal(trades[0].points, 10);
  }],
];

let failed = 0;
for (const [name, run] of cases) {
  try {
    run();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${(e as Error).message}`);
  }
}
if (failed) process.exit(1);
console.log("\nall matching tests passed");
