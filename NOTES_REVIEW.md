# Notes review — 2026-10-08

Audience: Web3 beginners, DeFi product managers, and smart-contract developers.

Reviewed all 14 notes, their Chinese/English content structure, the index, and repository documentation. Checked selected consequential technical claims against primary documentation. This is an editorial and technical content review, not an audit of deployed contracts or a complete verification of every market statistic. This document records the initial review; its line references refer to the files before expansion. The follow-up content update is summarized below.

## Overall assessment

The collection is strongest at explaining protocol mechanisms, call paths, asset locations, and trust boundaries. The existing diagrams, short summaries, reader directions, and separation between developer and user risks are useful. Uniswap, account abstraction, Hyperliquid, and the bridge notes already go substantially beyond introductory summaries.

The main gaps are **beginner prerequisites, executable development exercises, failure/recovery flows, and PM decision frameworks**. Adding more architecture detail alone will make the longest notes harder to use. Correct misleading implementation guidance first, then give each reader a clear route through the material.

| Concern | Existing coverage | What to fill |
|---|---|---|
| Main concepts | Substantial protocol coverage | Shared foundations, defined terms, worked numerical examples, explicit simplification boundaries |
| Logic flow | Strong happy-path diagrams | Failure states, who can retry, who pays, where funds remain, completion evidence |
| How to develop | Many useful snippets | Pinned dependencies, complete projects, verified addresses, commands, expected outputs, meaningful tests |
| Security | Broad vulnerability and trust coverage | Correct several claims; turn lists into threat models, invariants, and incident procedures |
| Market | Many headline figures | Traceable snapshots, comparable metrics, economic sustainability, product selection criteria |

## Corrections before expansion

### 1. Proxy: namespaced storage still has layout rules

**Location:** `public/notes/proxy-upgradeable.html:568`, and the surrounding ERC-7201 explanation in both languages.

The comment says “ordering no longer matters.” Namespaces isolate modules, but reordering or changing existing fields **inside a namespace** can still corrupt state. Keep namespace identifiers stable, preserve compatible struct layouts, and validate upgrades. OpenZeppelin explicitly validates changes within each namespace against storage compatibility rules. [OpenZeppelin upgrade guidance](https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable)

Also fix the UUPS paragraph at line 627: standard OpenZeppelin UUPS upgrade logic checks the new implementation's `proxiableUUID` compatibility. A noncompatible implementation normally causes the upgrade to revert; it does not simply succeed because the developer deployed manually. Compatible but malicious code can still remove future upgrade ability. Distinguish runtime compatibility checks from plugin validation. [OpenZeppelin Proxy API](https://docs.openzeppelin.com/contracts/5.x/api/proxy)

The public `initializeV2` example at line 620 demonstrates no authorization. `reinitializer(2)` limits repeat execution; it does not choose who may execute it. Show an authorized, atomic upgrade-and-initialize path. The example also assigns `_main().fee` although the earlier struct does not declare `fee`; label the snippets as separate sketches or supply a complete V2 contract.

### 2. Flash loan: preserve approval until repayment is collected

**Location:** `public/notes/flash-loan.html:405`, and the corresponding Chinese checklist.

“Zero out … before the callback ends” is ambiguous and can make repayment fail if readers remove the required allowance. The receiver must leave enough approval for Aave to pull principal plus premium **after the callback returns**. Approve the exact amount; clear any remaining allowance after the flash-loan call completes where needed. [Aave flash-loan execution flow](https://aave.com/docs/aave-v3/guides/flash-loans)

The sample's unrestricted `start()` also lets anyone repeatedly initiate loans that consume the receiver's stored fee funds. The initiator check still passes because `start()` makes the receiver call the Pool. Add caller authorization or user-funded fees, operation context, and a minimum-profit check. Include a repeated-call griefing test.

Replace “no size limit” at line 244 with “limited by available eligible pool liquidity.” Replace “costless” at line 269 with a description of gas, premiums, trading fees, slippage, and inclusion competition. Instant access to capital changes the threat model; it does not eliminate economic attack costs. Explain separately that Aave's multi-asset `flashLoan` can open an authorized collateralized debt position, while `flashLoanSimple` must repay atomically. [Aave flash-loan guide](https://aave.com/docs/aave-v3/guides/flash-loans)

### 3. Starknet: fix the L1 withdrawal caller model

**Location:** `public/notes/zk-rollup.html:320` and `:707`.

The instruction to require `msg.sender == starknetCore` before unlocking is inconsistent with the described consume-message path. Normally a user/relayer calls the L1 application, which calls `StarknetCore.consumeMessageFromL2`. Core checks the message for that consumer address; it does not call back into the application to deliver the withdrawal. Verify the expected L2 sender and payload, consume the message, then release funds with appropriate accounting and reentrancy protection. Show this call sequence explicitly. [Starknet messaging example](https://www.starknet.io/cairo-book/ch103-04-L1-L2-messaging.html)

### 4. Security: correct reentrancy and rounding guidance

**Location:** `public/notes/solidity-security.html:539` and `:698`, plus the Chinese equivalents.

OpenZeppelin's shared guard blocks cross-function entry **when both entrypoints use the same guard**. Unguarded functions and readable intermediate state remain potential attack surfaces. Replace the blanket statement that it only stops same-function reentry. Ordinary state-writing `nonReentrant` cannot simply be added to a `view` function; explain a version-supported view guard or lock-state check. [OpenZeppelin utilities](https://docs.openzeppelin.com/contracts/5.x/api/utils)

For ERC-4626, distinguish methods: `deposit` rounds shares down, `mint` rounds required assets up, `withdraw` rounds required shares up, and `redeem` rounds assets down. “Round down when minting” is misleading when it refers to the actual `mint` method. Correct rounding alone does not prevent donation/inflation attacks; include offsets, output limits, and attack tests. Avoid presenting an empty vault as a universal prerequisite for all donation-related attacks. [ERC-4626 specification](https://eips.ethereum.org/EIPS/eip-4626)

### 5. Aave: separate transferable assets from nontransferable debt

**Location:** `public/notes/aave.html:268` and `:292`.

Not every supplied asset is necessarily usable as collateral: eligibility, collateral enablement, reserve parameters, and modes matter. Borrow limits use LTV, while ongoing liquidation eligibility uses the liquidation threshold and health factor. The opening summary currently blurs these.

aTokens can be transferable subject to account checks; variable debt tokens are nontransferable. Tokenized accounting does not make the entire borrowing position freely transferable. [Aave tokenization](https://www.aave.com/docs/aave-v3/smart-contracts/tokenization)

The integration example needs a caller/account table: whose underlying tokens fund supply/repayment, whose collateral backs borrowing, who receives borrowed funds, and whose aTokens fund withdrawal. Document credit delegation when `onBehalfOf` differs from the caller and check the deployed Pool's max-repayment rules. [Aave Pool](https://aave.com/docs/aave-v3/smart-contracts/pool?language=en), [credit delegation](https://www.aave.com/docs/aave-v3/guides/credit-delegation)

Replace fixed “safe” HF recommendations with an illustrative policy whose assumptions are stated. HF below 1 makes a position eligible for liquidation; actual execution depends on profitability, liquidity, oracle state, chain conditions, and applicable rules. Likewise, explain bad-debt resolution and protection mechanisms for the relevant market/version rather than asserting a universal automatic supplier haircut.

### 6. Sky: reconcile the opening with actual backing dependencies

**Location:** `public/notes/makerdao-sky.html:237` and `:269`.

“Incentives, not reserves” and “trust no company” conflict with the later PSM/RWA discussion. The peg depends on collateral quality, redemption/conversion liquidity, governance, and arbitrage together. Explain crypto collateral, stablecoin exposure, and RWA/counterparty dependence at the beginning. Sky's own disclosures describe RWA risks and strategies. [Sky user risks](https://docs.sky.money/legal/skybase-international/user-risks), [Sky platform explanation](https://sky.money/blog/what-is-sky-money)

Treat “migration completed August 2026,” exchange forced conversions, and specific rates/supplies as claims requiring dated official evidence, not established facts from this review. Separate legacy Maker vault/auction mechanics from current USDS, savings, and allocation products.

### 7. Cloudflare: correct Function routing precedence

**Location:** `public/notes/cloudflare-pages.html:552`, and the matching Chinese diagram/caption.

The note says static files always win. Cloudflare's Pages documentation says a matched Function handles the request, with static fallback when no Function matches. Explain routing exclusions and `env.ASSETS.fetch()` rather than teaching unconditional static precedence. [Pages routing](https://developers.cloudflare.com/pages/functions/routing/)

Also scope immutable caching to fingerprinted assets. This site's `app.js` and `style.css` have stable filenames, so the example's broad `/assets/*` immutable rule should not be copied without an asset-versioning strategy.

### 8. Gas: distinguish illustrative parameters from live configuration

**Location:** `public/notes/evm-gas.html:332`, `:376`, and `:421`.

Replace “currently ~15M target, ~30M limit” with a dated example or a live block lookup. Show `target = gasLimit / elasticityMultiplier` for the specified chain/configuration.

Two-times headroom is exceeded at the sixth full-block increase (`1.125^6 ≈ 2.03`); don't promise that it covers six full increases. Explain the upfront affordability requirement, actual receipt cost, unused gas, unused price headroom, and EVM refund credits separately. The current `refunded = gasUsed × (maxFee − effectivePrice)` is not a complete transaction refund calculation.

### 9. Market claims: evidence is too far from the numbers

This affects almost every protocol note. “Approximate, as of 2026-09” plus a generic source footer does not make a specific figure reproducible.

Add a direct source, exact measurement date/window, chain/version scope, and metric definition to each table. Keep TVL, TVS, cumulative transfers, message counts, volume, open interest, gross fees, protocol revenue, and annualized revenue distinct. LayerZero's “leads on transfer volume” cannot be established from the table's mixture of messaging share and incompatible cumulative/daily measures.

The 62.1% attack statistic, historical loss percentages, Drift/KelpDAO amounts and root-cause claims, Sky migration dates, and product-status assertions need specific reports or announcements. This review has not verified them. Remove or label unsupported claims until sourced; avoid summing loss categories without proving the dataset uses nonoverlapping classifications.

### 10. Navigation and copy

The ZK index summary implies finalization once the proof lands, while the article correctly discusses commit/prove/execute. Make the summary reflect the chain-specific completion gates.

A local-path check found `../assets/style.css` and `../assets/app.js` in root-level `public/404.html`. They resolve outside `public` when interpreted relative to that file. Check actual nested 404 handling on each host before choosing a base-path strategy. Other checked local file references resolved.

## What to add to each note

These are additions to existing coverage, not suggestions to duplicate the sections already present.

| Note | Main concept / logic addition | Development / security addition | PM / market addition |
|---|---|---|---|
| Aave | One complete numerical supply → borrow → interest → price shock → partial liquidation example | Runnable adapter with delegation; pause/freeze/cap matrix; chain-specific oracle and liquidation tests | Borrow/supply economics, reserve factor, utilization, exit liquidity, bad-debt response; comparison with isolated lending |
| Flash Loans | Track principal, premium, fees, and profit through one collateral-swap transaction | Complete receiver with constructor/imports, protected start, exact approval, slippage, failed-repayment and griefing tests | Break-even calculation and gas/MEV sensitivity; realistic limits on usable liquidity |
| MakerDAO / Sky | Map legacy vaults to current stablecoin, savings, conversion, PSM, and allocation products | One current supported integration; WAD/RAY/RAD worked example; savings share conversion and redemption limits | Yield sources and sustainability, collateral composition, issuer/custodian exposure, peg-stress scenarios |
| Uniswap v2/v3/v4 | Worked range-position example with token units; distinguish LP inventory change from earned fees | One runnable swap and LP lifecycle; concrete v4 settlement helper; callback authorization and min-out tests | Depth at target trade size, routing cost, LP net return after LVR/rebalancing; hook selection criteria |
| Hyperliquid | Beginner perp PnL/margin/funding example before the architecture | Action IDs, partial fills, timeout/cancel/reconcile state machine; bounded precompile gas; permissioned contract trading functions | Spread/depth, funding, liquidation/ADL behavior, HLP economics, API dependency and bridge exit assumptions |
| ERC-4337 | Short guided first operation, followed by advanced reference sections | Fully specified account/SDK/EntryPoint pairing; replace-operation and sponsor-outage exercise; negative authorization tests | Activation vs retained funded users, sponsorship cost per successful action, recovery support cost, provider portability |
| Optimistic Rollup / Bridge | A withdrawal timeline with separate proof age, game status, finality, and actual release | SDK-based deposit/withdraw example; replayable messenger failure vs raw Portal failure; chain/version parameter table | Exit latency/cost, fast-bridge execution guarantees, upgrade powers, practical escape-path availability |
| ZK Rollup | One chain-specific deposit/withdraw timeline; circuit validity vs DA vs governance | Correct Starknet consumer example; failed-deposit recovery; complete executed-batch withdrawal proof exercise | Measured withdrawal p50/p95, prover availability, DA, upgrade delays, tooling compatibility, ecosystem depth |
| LayerZero | Distinguish message delivery from asset conservation; diagram OFT burn/mint and Adapter lock/mint separately | Runnable two-chain OApp; duplicate/out-of-order/retry/compose tests; peer/library migration runbook; constrained mint authority | Pathway-specific DVN independence and availability, delivery cost/latency, operational recovery, comparable alternatives |
| Solidity Security | Threat → violated invariant → exploit trace → mitigation → residual risk for each class | Executable attacker tests; oracle decimals/heartbeat/sequencer checks; signature contracts; token quirks; response drill | Risk register with loss scope, mitigation owner, trigger, response, and governance/key compromise exposure |
| Proxy / Upgradeability | Governance/admin/implementation diagram for UUPS, Transparent, Beacon | Complete V1/V2 project, compatible storage diff, authorized atomic migration, unauthorized upgrade tests | Upgrade SLA, emergency powers vs timelock, effective exit window, audit scope after code/config changes |
| EVM Gas | Worked successful/reverted/out-of-gas/replacement examples | Receipt-based accounting, bigint units, chain-aware fee estimation, nonce/replacement handling | Cost per successful user action, failure cost, sponsorship budget, L2 fee breakdown |
| Cloudflare Pages | Deployment → validation → domain → rollback flow with routing fallback | Minimal working project, preview protection, secret boundaries, correct Functions routing, caching test | Operating cost, limits, dependency/incident response; tie hosting risk to a wallet-connected frontend |
| Deploying this site | GitHub Pages and Workers release paths with base-path behavior | Exact output directory, preview steps, local link check, nested 404 handling, rollback and verification | Explain domain/repo control and frontend supply-chain risk; keep as a tooling appendix |

## A shared article structure

1. **Problem and user story:** what the reader is trying to do, and when this protocol fits.
2. **Prerequisites and terms:** link foundations; define new terminology when introduced.
3. **Mental model:** actors, balances, permissions, and trust assumptions.
4. **Worked logic flow:** calls, state changes, amounts/units, fees, and completion evidence.
5. **Build it:** pinned version, verified chain/address, install/run commands, full example, expected result.
6. **Failure and recovery:** revert, timeout, partial completion, pause, retry/refund, who acts and pays.
7. **Security:** explicit invariants, privileges, adversary capabilities, meaningful negative tests.
8. **PM decision:** alternatives, economics, user friction, dependency risk, go/no-go conditions.
9. **Evidence:** direct dated references; separate reviewed mechanisms from refreshed market snapshots.

Do not force every note to be equally long. Put deep version tables and advanced code in an appendix. Account abstraction especially needs a short entry route and anchored table of contents; its reserve and cross-chain material can link to a shared asset-backing note.

For cross-chain reserve examples, define liability states carefully: locked backing, minted supply, pending mint, burned pending redemption, released funds. A formula must not subtract a pending redemption obligation simply because its token was burned; it is still owed until settled. Check conservation across every transition and avoid double counting.

## Missing collection-level topics

**Start with a foundations note:** wallets/accounts, signatures vs transactions, native/ERC-20 balances, decimals, allowances/permits, RPC/explorers, transaction receipts, reverts, finality, and custody. These are currently prerequisites rather than a beginner learning path.

Then add three focused notes:

- **Oracles and market integrity:** spot vs TWAP vs external feeds, liquidity and manipulation costs, freshness/decimals, sequencer downtime, circuit breakers, liquidation price.
- **ERC-4626 vaults and yield economics:** share conversion and rounding, donation/inflation, strategy losses, fees, withdrawal liquidity, APY sources, net returns.
- **Building a DeFi integration end to end:** wallet → chain selection → amount parsing → approval/permit → quote → simulation → signature → submission → receipt → indexing → recovery. Show one concrete integration, its deployment controls, and its monitoring.

MEV/order execution, governance/key operations, and asset backing/redemption deserve additional focused material as the collection grows. They currently appear across several notes without a single reusable reference.

## Reader paths

- **Beginners:** foundations → gas/transactions → Uniswap v2 mental model → Aave worked example → stablecoins → security essentials → rollup/bridge overview. Treat flash loans, v4 internals, smart-account internals, and HyperCore as later material.
- **DeFi PMs:** foundations → protocol user stories → alternatives and economics → permission/trust matrix → failure/recovery UX → launch metrics and go/no-go checklist.
- **Developers:** token/account fundamentals → security → one complete integration → fork/negative/invariant tests → upgrades and governance → production monitoring → advanced cross-chain/AA flows.

The home page currently starts with advanced protocols. Add “Start here” and these paths while retaining the journal list. Keep website deployment notes visibly separate from the DeFi curriculum.

## Suggested implementation order

**First:** repair storage/UUPS/reinitializer guidance, flash-loan approvals and initiation, Starknet authentication, reentrancy/rounding explanations, and Function routing. Update both languages and affected diagrams/captions.

**Second:** resolve unsupported numerical/incident claims; tighten Aave and Sky summaries, gas examples, and index descriptions. Give every market row an attributable snapshot.

**Third:** create foundations and reader navigation; add runnable examples to Aave, Uniswap, and flash loans. Each exercise should teach one real integration and one material failure mode.

**Fourth:** extend async notes with explicit recovery state machines, then add PM economics/selection tables and the oracle/vault material.

Completion criteria: a beginner can explain the asset and authority flow; a developer can run the example and reproduce its failure cases; a PM can justify choosing the protocol, estimate costs, name dependencies, and describe what happens when an action fails.

## Follow-up implementation — 2026-10-08

- Added bilingual foundations, oracle, ERC-4626 vault, and integration guides.
- Expanded all 14 existing articles with worked examples, development acceptance, PM economics, or failure/recovery guidance.
- Added three reader paths, prerequisite links, and language-specific section navigation.
- Corrected storage/UUPS/reinitializer, flash-loan approval/initiation, Starknet consumer, reentrancy, rounding, gas, reserve-liability, and Pages routing explanations.
- Removed unsupported incident/root-cause and attack-percentage claims in affected passages. Original protocol market snapshots remain explicitly historical and unverified in this update.

Remaining deeper work: separately versioned executable integration projects with fork tests, primary-source refresh of each market metric, and deployed-chain verification of every advanced API example. Code sketches are educational; the update does not claim a live financial integration was tested.
