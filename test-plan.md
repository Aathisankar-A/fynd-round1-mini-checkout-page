# Test Plan: Mini Checkout and Browser Test Suite

**Project:** Mini Checkout Single-Page Application  
**Author:** SDET Candidate  
**Submission:** FyndHacks - SDET Track  
**Date:** November 2026  

---

## 1. Overview & Objectives

The goal of this test plan is to define the testing strategy, risk prioritization, manual exploratory testing records, and automated test suite for a single-page checkout flow. 

The checkout application allows customers to:
1. Select from two synthetic products with fixed prices.
2. Add/remove items and dynamically adjust quantities.
3. Observe real-time line total and order total recalculations.
4. Input mandatory customer information (Full Name).
5. Submit the order and receive a single unambiguous confirmation with a unique order reference.

---

## 2. Key Checkout Risks & Prioritization

In e-commerce checkout flows, failure impacts revenue, customer trust, and operational integrity. The key risks are prioritized below from highest to lowest severity:

| Priority | Risk Area | Failure Mode & Potential Impact | Mitigation & Verification |
| :--- | :--- | :--- | :--- |
| **P0 - Critical** | **Duplicate Submissions & Race Conditions** | Rapid double-clicking the "Place Order" button creates duplicate orders, produces multiple confirmation references, or triggers multiple backend transactions. | Submit button debouncing, immediate disabling upon click (`isSubmitting` flag), idempotency verification. |
| **P0 - Critical** | **Calculation & Financial Discrepancies** | Line totals or order total fail to reflect quantity changes accurately, or floating-point arithmetic errors misstate charge amounts. | Rigorous precision tests on quantity addition, increment, decrement, and removal across multiple line items. |
| **P1 - High** | **Invalid Order Submission (Empty Cart / Missing Data)** | Submitting orders with zero items or missing customer identification creates invalid/phantom orders. | Client-side validation blocking checkout with clear error alerts before state transition. |
| **P1 - High** | **Input Discard & State Loss** | Validation errors cause form or cart data to reset, forcing users to re-enter details and increasing cart abandonment. | Stateful persistence: validation failures preserve entered names and current cart quantities. |
| **P2 - Medium** | **Confirmation Ambiguity & State Leakage** | Lack of an identifiable reference number or failure to isolate post-checkout views from pre-checkout views. | Full UI view transition with unique `ORD-XXXXXX` reference, customer receipt details, and clean reset mechanism. |

---

## 3. Test Scope

### 3.1 In Scope
- Product catalog interaction (Add to Cart).
- Cart item management: quantity increment (`+`), decrement (`-`), direct numerical input, item removal.
- Line total and grand total real-time reactive recalculation.
- Mandatory field validation (Full Name required, non-empty, whitespace handling).
- Empty cart validation.
- Form input preservation during validation triggers.
- Button state locking during order placement to prevent double confirmation.
- Confirmation screen rendering with unique order reference, customer name, itemized list, and order total.
- Automated end-to-end browser regression suite in Playwright.

### 3.2 Out of Scope
- Backend database persistence (as per brief: no backend, database, payments, or external services required).
- Payment gateway integration (Stripe, PayPal, etc.).
- Authentication / User account login.
- Email/SMS receipt delivery.

---

## 4. Test Environment & Execution Strategy

- **Application Server:** Node.js static HTTP server (`http://localhost:3000`).
- **Test Automation Framework:** Playwright (`@playwright/test`) running on Chromium.
- **Clean State Isolation:** Every test suite and test case starts from an isolated browser context, loading `/` anew (`test.beforeEach`) to ensure zero cross-test pollution.
- **Assertion Philosophy:** Prefer user-facing semantic assertions (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`) over arbitrary `sleep()` or timeout-based assertions.

---

## 5. Automated Test Cases Specification

| ID | Title | Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-AUTO-01** | Successful Checkout Flow | Add product, enter customer name, submit order. | Order confirmed screen displayed, unique `ORD-XXXXXX` generated, customer name & total matched, checkout view hidden. |
| **TC-AUTO-02** | Missing Required Field Validation | Add product, leave customer name blank, submit order. | Checkout blocked, error alert shown, input marked, confirmation hidden, cart state intact. |
| **TC-AUTO-03** | Reactive Quantity & Totals Recalculation | Increment quantity, add second product, direct-edit quantity, decrement quantity, remove item. | Line totals and order total update accurately at each step down to the cent (₹75.00 -> ₹150.00 -> ₹195.00 -> ₹285.00 -> ₹210.00 -> ₹75.00). |
| **TC-AUTO-04** | Empty Cart Validation | Enter customer name with zero items in cart, click Place Order. | Checkout blocked, error alert shown, customer name retained in input field. |
| **TC-AUTO-05** | Double-Click Idempotency | Fill valid order, trigger rapid double-click on Place Order button. | Exactly ONE confirmation view and ONE order reference produced; no duplicate orders. |

---

## 6. Manual Exploratory Testing Matrix & Results

As mandated by Task 4, manual exploratory testing was conducted specifically focusing on an empty cart and a rapid double-click.

### Manual Test 1: Empty Cart Submission
- **Test Procedure:**
  1. Open fresh checkout page at `http://localhost:3000`.
  2. Observe empty cart notice ("Your cart is empty. Add a product from above to proceed.").
  3. Enter customer name: `Sanka Tester`.
  4. Click `Place Order` button.
- **Observed Behavior:**
  - Checkout is immediately blocked.
  - Alert banner displays: `"Your cart is empty. Please add at least one product to check out."`
  - The customer name `"Sanka Tester"` remains intact in the input field (not cleared).
  - No order confirmation is generated.
- **Verdict:** **PASS** (Risk mitigated).

### Manual Test 2: Rapid Double-Click on Place Order
- **Test Procedure:**
  1. Add 1x "Mechanical Gaming Keyboard" (₹75.00).
  2. Enter customer name: `Dr. Bruce Banner`.
  3. Rapidly double-click / multi-click `Place Order` in rapid succession (< 100ms interval).
- **Observed Behavior:**
  - On the first event, the button is immediately set to `disabled = true` and displays `"Processing Order..."`.
  - The second click event is ignored by the state guard (`isSubmitting || orderPlaced`).
  - Exactly one confirmation screen appears with a single order reference (e.g. `ORD-682194`).
  - Only one receipt record exists; no UI flicker, duplicate references, or duplicate screens.
- **Verdict:** **PASS** (Risk mitigated).

