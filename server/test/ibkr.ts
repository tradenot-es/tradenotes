// Unit tests for the IBKR Flex parsing and request flow (fetch is stubbed). The module
// loads the server config, so dummy values are enough:
//   DATABASE_URL=postgres://x@localhost/x BASE_URL=http://x BETTER_AUTH_SECRET=$(printf x%.0s {1..32}) npx tsx test/ibkr.ts
import assert from "node:assert/strict";
import { fetchFlexStatement, flexTime, parseFlexTrades } from "../src/ibkr.js";

const STATEMENT = `<FlexQueryResponse queryName="tradenotes" type="AF">
<FlexStatements count="1">
<FlexStatement accountId="U1234567" fromDate="20261020" toDate="20261026">
<Trades>
<Trade accountId="U1234567" currency="USD" assetCategory="FUT" symbol="ESZ6" underlyingSymbol="ES" multiplier="50" tradeID="111" ibExecID="0001f4e8.6720a1b2.01.01" dateTime="20261026;093102" quantity="2" tradePrice="6850.25" ibCommission="-4.24" buySell="BUY" levelOfDetail="EXECUTION" />
<Trade accountId="U1234567" currency="USD" assetCategory="FUT" symbol="ESZ6" underlyingSymbol="ES" multiplier="50" tradeID="112" ibExecID="0001f4e8.6720a1b2.01.02" dateTime="20261026;094511" quantity="-2" tradePrice="6853.75" ibCommission="-4.24" buySell="SELL" levelOfDetail="EXECUTION" />
<Trade accountId="U1234567" currency="USD" assetCategory="FUT" symbol="ESZ6" quantity="-2" tradePrice="6853.75" buySell="SELL" levelOfDetail="ORDER" dateTime="20261026;094511" />
<Trade accountId="DU7654321" currency="USD" assetCategory="STK" symbol="AAPL" multiplier="1" tradeID="113" dateTime="2026-01-15;10:00:00" quantity="100" tradePrice="262.10" ibCommission="-1" buySell="BUY" />
</Trades>
</FlexStatement>
</FlexStatements>
</FlexQueryResponse>`;

const cases: [string, () => void | Promise<void>][] = [
  ["eastern time to UTC (summer and winter)", () => {
    assert.equal(flexTime("20261026;093102"), "2026-10-26T13:31:02.000Z");
    assert.equal(flexTime("2026-01-15;10:00:00"), "2026-01-15T15:00:00.000Z");
    assert.equal(flexTime("2026-03-08, 03:30:00"), "2026-03-08T07:30:00.000Z"); // after the DST switch
    assert.equal(flexTime("nonsense"), null);
  }],
  ["executions parsed, order summaries skipped", () => {
    const ex = parseFlexTrades(STATEMENT);
    assert.equal(ex.length, 3);
    assert.deepEqual(
      { ...ex[0] },
      { id: "0001f4e8.6720a1b2.01.01", account: "U1234567", instrument: "ESZ6", symbol: "ES", instrumentType: "Future", side: "buy", qty: 2, price: 6850.25, time: "2026-10-26T13:31:02.000Z", commission: 4.24, pointValue: 50 },
    );
    assert.equal(ex[1].side, "sell");
    assert.equal(ex[1].qty, 2);
    assert.equal(ex[2].id, "113");
    assert.equal(ex[2].instrumentType, "Stock");
  }],
  ["request flow waits while the statement is generated", async () => {
    const calls: string[] = [];
    let polls = 0;
    globalThis.fetch = (async (url: string) => {
      calls.push(String(url));
      const body = String(url).includes("SendRequest")
        ? "<FlexStatementResponse><Status>Success</Status><ReferenceCode>42</ReferenceCode><Url>https://example.test/GetStatement</Url></FlexStatementResponse>"
        : polls++ === 0
          ? "<FlexStatementResponse><Status>Warn</Status><ErrorCode>1019</ErrorCode><ErrorMessage>Statement generation in progress.</ErrorMessage></FlexStatementResponse>"
          : STATEMENT;
      return new Response(body);
    }) as typeof fetch;
    const xml = await fetchFlexStatement("123456789012345678", "987654", async () => {});
    assert.ok(xml.includes("FlexQueryResponse"));
    assert.equal(calls.length, 3);
    assert.ok(calls[1].startsWith("https://example.test/GetStatement?q=42&t=123456789012345678&v=3"));
  }],
  ["invalid token is reported", async () => {
    globalThis.fetch = (async () =>
      new Response("<FlexStatementResponse><Status>Fail</Status><ErrorCode>1015</ErrorCode><ErrorMessage>Token is invalid.</ErrorMessage></FlexStatementResponse>")) as unknown as typeof fetch;
    await assert.rejects(fetchFlexStatement("x", "1", async () => {}), /1015 Token is invalid/);
  }],
];

let failed = 0;
for (const [name, run] of cases) {
  try {
    await run();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${(e as Error).message}`);
  }
}
if (failed) process.exit(1);
console.log("\nall ibkr tests passed");
