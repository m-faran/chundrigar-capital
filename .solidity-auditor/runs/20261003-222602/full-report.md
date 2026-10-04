# 🔐 Security Review — Chundrigar Capital

---

## Scope

|  |  |
| --- | --- |
| **Mode** | filename |
| **Files reviewed** | `smart-contracts/src/CompliantToken.sol` · `smart-contracts/src/GlobalWhitelist.sol` · `smart-contracts/src/Treasury.sol`<br>`smart-contracts/script/Deploy.s.sol` |
| **Confidence threshold (1-100)** | 75 |

---

## Findings

[82] **1. Deploy script leaves the fee receiver unwhitelisted, so SPKR trades revert.**

`DeployScript.run` · Confidence: 82

**Description**
The script whitelists the test user and the Treasury but not the fee receiver, so the SPKR fee transfer reverts and the trade fails.

**Fix**

```diff
         // 1. Deploy GlobalWhitelist
         GlobalWhitelist whitelist = new GlobalWhitelist(deployerAddress);
 
-        // Whitelist the test user
-        whitelist.setWhitelist(testUser, true);
+        // Whitelist the test user and the fee receiver
+        // (deployerAddress is passed to the Treasury as feeReceiver)
+        whitelist.setWhitelist(testUser, true);
+        whitelist.setWhitelist(deployerAddress, true);
```

---

[78] **2. Frozen balance can exceed the account balance, so its transfers revert.**

`CompliantToken.freeze` · Confidence: 78

**Description**
freeze() accepts an amount larger than the balance, and forceTransfer() and forceBurn() never lower frozenBalances, so balanceOf(from) - frozenBalances[from] underflows and reverts.

**Fix (Option A — cap the freeze at the balance)**

```diff
     function freeze(address account, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
+        require(frozenBalances[account] + amount <= balanceOf(account), "Freeze exceeds balance");
         frozenBalances[account] += amount;
         emit Frozen(account, amount);
     }
```

**Fix (Option B — lower the frozen amount after a force action)**

```diff
     function forceTransfer(address from, address to, uint256 amount) external onlyRole(COMPLIANCE_ROLE) {
         _isComplianceBypass = true;
         _transfer(from, to, amount);
         _isComplianceBypass = false;
+        if (frozenBalances[from] > balanceOf(from)) {
+            frozenBalances[from] = balanceOf(from);
+        }
         emit ForceTransfer(from, to, amount);
     }
```

---

[72] **3. Signed quotes replay on another Treasury with the same signer.**

`Treasury.buy` · Confidence: 72

**Description**
The digest has no contract address or chain id, so one backend signature verifies on any deployment that shares the signer key.

---

Findings List

| # | Confidence | Title |
|---|---|---|
| 1 | [82] | Deploy script leaves the fee receiver unwhitelisted, so SPKR trades revert. |
| 2 | [78] | Frozen balance can exceed the account balance, so its transfers revert. |
| | | **Below Confidence Threshold** |
| 3 | [72] | Signed quotes replay on another Treasury with the same signer. |

---

## Leads

_Vulnerability trails with concrete code smells where the full exploit path could not be completed in one analysis pass. These are not false positives — they are high-signal leads for manual review. Not scored._

- **The admin EOA keeps MINTER_ROLE on every stock token the Treasury deploys.** — `CompliantToken.constructor` — Code smells: `_grantRole(MINTER_ROLE, defaultAdmin)` combined with `deployToken` passing `owner()` as defaultAdmin — The owner can mint unbacked stock tokens to a whitelisted address and sell them into the Treasury pool. The path needs the owner key, so the trail is a trust-boundary note, not a proved attack.
- **forceTransfer with a zero sender mints new tokens.** — `CompliantToken.forceTransfer` — Code smells: `_transfer(address(0), to, amount)` reaches the ERC20 mint path with the compliance bypass on — A compliance call with `from = address(0)` raises totalSupply, so the seize function doubles as a mint. We did not find an unprivileged caller for it.
- **The deploy script defaults the backend signer to the deployer address.** — `DeployScript.run` — Code smells: `vm.envOr("BACKEND_SIGNER_ADDRESS", deployerAddress)` — A deployment that omits the env var gives the owner account the power to sign every trade quote. We could not determine the operator's environment.
- **No on-chain payment-token allowlist, so the backend alone decides what the Treasury accepts.** — `Treasury.buy` — Code smells: the only check is `paymentToken != address(0)` — The contract accepts any ERC20 the backend signs, so one backend policy mistake mints stock tokens against a worthless token. We could not test the backend, so the policy gap stays unverified.
- **Sellers draw from one shared pool per payment token, so the last seller cannot exit.** — `Treasury.sell` — Code smells: no per-asset reserve accounting, no solvency check, the caller picks the payment token — The Treasury pays every seller from the same balance and keeps no record of which payment backs which stock, so a price rise lets early sellers take the cash and later sellers revert. We did not prove a profitable attacker path, because the backend sets the price.
- **setFee accepts a fee receiver that is not whitelisted, so SPKR trades revert.** — `Treasury.setFee` — Code smells: no whitelist check on the new receiver — The owner can point the fee at an address the whitelist does not contain, and every SPKR trade then reverts on the fee transfer. Same root cause as finding 1, different fix site.
- **No pause and no circuit breaker, so a leaked signer key drains the pool until setSigner runs.** — `Treasury.setSigner` — Code smells: no pause, no timelock, `setSigner` accepts `address(0)` — The only response to a compromised backend key is an owner transaction, and `setSigner(address(0))` stops every trade with no way back except another owner call.

---

> ⚠️ This review was performed by an AI assistant. AI analysis can never verify the complete absence of vulnerabilities and no guarantee of security is given. Team security reviews, bug bounty programs, and on-chain monitoring are strongly recommended. For a consultation regarding your projects' security, visit [https://www.pashov.com](https://www.pashov.com)
