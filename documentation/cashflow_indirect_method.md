# 💧 Indirect Method of Cash Flow Statement

This document outlines the complete structure, components, and derivation logic for preparing a **Statement of Cash Flows (Indirect Method)** under IFRS / Dutch GAAP / US GAAP.  
All values are derived from comparative Trial Balances (TB), General Ledgers (GL), or adjustments schedules.

---

## 🧩 1. Structure Overview

The cash flow statement (CFS) summarizes the movement of cash and cash equivalents between two reporting dates, classified into:

1. **Operating Activities (CFO)**  
   Adjust net income for non-cash transactions and changes in working capital.
2. **Investing Activities (CFI)**  
   Capture cash used for or generated from acquisition/disposal of long-term assets.
3. **Financing Activities (CFF)**  
   Record cash inflows/outflows from funding sources such as loans and equity.

The reconciliation logic:
> Opening Cash + CFO + CFI + CFF = Closing Cash

---

## 🏭 2. Cash Flow from Operating Activities (CFO)

### Step 1: Start with Net Profit or Loss
**Derived from:** Income Statement (Retained earnings movement or P&L).  
> `Net Income = Profit After Tax (Current Year)`

---

### Step 2: Adjust for Non-Cash / Non-Operating Items

| Component | Derivation | Impact |
|------------|-------------|--------|
| **Depreciation & Amortization** | Sum of expense accounts tagged as "Depreciation", "Amortization", "Impairment of PPE/Intangibles". | Add back |
| **Impairment losses** | From P&L or asset impairment ledger. | Add back |
| **Unrealized FX (gain)/loss** | From FX revaluation GLs (non-cash). | Add back losses / Deduct gains |
| **Deferred Tax movement** | Δ in Deferred Tax Asset/Liability. | Add back |
| **Provisions movement** | Δ in Provision balances (e.g., warranty, restructuring). | Add back if increase; deduct if release |
| **Gain/Loss on sale of asset** | Difference between disposal proceeds and carrying value. | Deduct gain / add back loss (reclassified to investing) |
| **Interest Expense / Income** | Classified under financing/investing; adjust in CFO if presented below EBIT. | Add back expense / deduct income |

---

### Step 3: Adjust for Working Capital Movements

| Working Capital Item | Derivation | Logic (Increase/Decrease) |
|-----------------------|-------------|----------------------------|
| **Trade Receivables (AR)** | Δ (Closing – Opening) | Increase → Cash Outflow; Decrease → Cash Inflow |
| **Inventory** | Δ (Closing – Opening) | Increase → Outflow; Decrease → Inflow |
| **Trade Payables (AP)** | Δ (Closing – Opening) | Increase → Inflow; Decrease → Outflow |
| **Other Current Assets** | Δ (Closing – Opening) | Increase → Outflow; Decrease → Inflow |
| **Other Current Liabilities / Accruals** | Δ (Closing – Opening) | Increase → Inflow; Decrease → Outflow |
| **Contract Liabilities (Deferred Revenue)** | Δ (Closing – Opening) | Increase → Inflow; Decrease → Outflow |
| **Contract Assets / Unbilled Revenue** | Δ (Closing – Opening) | Increase → Outflow; Decrease → Inflow |
| **Prepaid Expenses** | Δ (Closing – Opening) | Increase → Outflow; Decrease → Inflow |
| **Income Tax Payable / Receivable** | Δ in tax-related accounts | Payable ↑ = Inflow; Receivable ↑ = Outflow |

**Formula:**
> `CFO = Net Income + Non-Cash Adjustments + (– Δ Working Capital Items)`

---

## 🏗 3. Cash Flow from Investing Activities (CFI)

| Component | Derivation | Direction |
|------------|-------------|------------|
| **Purchase of Property, Plant & Equipment (PPE)** | Additions to PPE from FA register / GL (excluding depreciation). | Outflow |
| **Sale Proceeds of PPE** | Cash received from asset disposal. | Inflow |
| **Acquisition of Subsidiaries / Investments** | Payments for acquiring shares, JVs, or subsidiaries. | Outflow |
| **Sale of Subsidiaries / Investments** | Proceeds received from sale or dilution. | Inflow |
| **Intangible Asset Additions (Software, R&D)** | Capitalized development cost, software, etc. | Outflow |
| **Loan/Advance Given** | Movement in long-term loans or deposits given. | Outflow |
| **Loan/Advance Received Back** | Receipts against earlier advances. | Inflow |
| **Interest Income** | If treated as investing cash inflow. | Inflow |
| **Dividends Received** | From investments. | Inflow |

**Formula:**
> `CFI = Σ(Inflow) – Σ(Outflow)`

---

## 🏦 4. Cash Flow from Financing Activities (CFF)

| Component | Derivation | Direction |
|------------|-------------|------------|
| **Proceeds from Issue of Share Capital** | Δ in Share Capital or Share Premium. | Inflow |
| **Buyback / Redemption of Shares** | Payments made to repurchase equity. | Outflow |
| **Proceeds from Borrowings (Long/Short-term)** | Δ in Borrowings (increase). | Inflow |
| **Repayment of Borrowings** | Δ in Borrowings (decrease). | Outflow |
| **Lease Liability Payments** | Principal component of lease payments (IFRS 16). | Outflow |
| **Interest Paid** | From Interest expense schedule (if classified as financing). | Outflow |
| **Dividends Paid** | Actual cash dividend payments to shareholders. | Outflow |
| **Debt Issue / Arrangement Costs** | Financing fees paid. | Outflow |
| **Government Grants Received (Financing Nature)** | Recorded if linked to financing facilities. | Inflow |

**Formula:**
> `CFF = Σ(Inflow) – Σ(Outflow)`

---

## 💰 5. Net Movement & Reconciliation

**Step 1:** Compute total change in cash  
> `Net Increase / (Decrease) = CFO + CFI + CFF`

**Step 2:** Reconcile with balance sheet  
> `Opening Cash + Net Change = Closing Cash`

Where *Cash & Cash Equivalents* = Cash + Bank Balances + Short-term deposits (≤3 months).

---

## 📊 6. Validation & Control Checks

| Check | Formula | Tolerance |
|--------|----------|------------|
| **BS Reconciliation** | Δ Cash (BS) – (CFO+CFI+CFF) | Must = 0 |
| **Working Capital Cross-Check** | Δ CA–Δ CL – Δ Cash = Δ Non-Cash Working Capital | Match |
| **Interest Reclass Check** | Interest expense/income matches movement in loan/cash accounts | Verify |
| **Dividend Validation** | Dividends paid = Movement in retained earnings + declared dividends | Verify |

---

## 🧠 7. Example Summary Layout

| Section | Description | FY24 | FY23 | Δ |
|----------|--------------|------|------|---|
| **Operating Activities** | | | | |
| Profit Before Tax | From P&L | 4,500 | 3,800 | 700 |
| Depreciation | Add back | 1,200 | 1,000 | 200 |
| Working Capital Change | Δ(AR, AP, Inv) | (500) | (100) | (400) |
| **Net Cash from Operating Activities** | | **5,200** | **4,700** | **500** |
| **Investing Activities** | | | | |
| Purchase of PPE | (2,000) | (1,800) | (200) |
| Proceeds from Sale of PPE | 300 | 100 | 200 |
| **Net Cash from Investing** | | **(1,700)** | **(1,700)** | — |
| **Financing Activities** | | | | |
| Borrowings raised | 1,500 | 1,200 | 300 |
| Repayment of loans | (700) | (900) | 200 |
| Dividends paid | (500) | (400) | (100) |
| **Net Cash from Financing** | | **300** | **(100)** | **400** |
| **Net Increase in Cash** | | **3,800** | **2,900** | **900** |
| Opening Cash | | 2,000 | 1,100 | — |
| Closing Cash | | **5,800** | **2,000** | — |

---

## 🧩 8. Supplementary Notes (AI Mapping Reference)

| Account Type | Expected Section | Mapping Logic |
|---------------|------------------|----------------|
| Depreciation, Amortization | CFO | Non-cash add-back |
| Accounts Receivable | CFO | Δ balance |
| Inventory | CFO | Δ balance |
| Fixed Asset additions | CFI | PPE additions |
| Loan Payable | CFF | Δ in borrowings |
| Share Capital | CFF | Δ in equity |
| Deferred Tax | CFO | Non-cash |
| Lease Liability | CFF | Principal component |
| Accrued Expenses | CFO | Δ in accruals |
| Prepaid Expenses | CFO | Δ in prepaids |

---

