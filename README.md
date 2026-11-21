# Mini Checkout & Playwright Browser Test Suite

[![Playwright Tests](https://img.shields.io/badge/playwright-E2E%20Tests-green.svg)](https://playwright.dev/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **FyndHacks - SDET Track Submission**  
> A production-ready, lightweight single-page checkout application accompanied by an automated Playwright browser test suite, risk-prioritized test plan, and exploratory test records.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features & Business Rules](#-key-features--business-rules)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Prerequisites & Installation](#-prerequisites--installation)
5. [Running the Application](#-running-the-application)
6. [Executing Automated Browser Tests](#-executing-automated-browser-tests)
7. [Automated Test Suite Structure](#-automated-test-suite-structure)
8. [Test Plan & Key Checkout Risks](#-test-plan--key-checkout-risks)
9. [Manual Exploratory Testing & Defect Report](#-manual-exploratory-testing--defect-report)
10. [Known Gaps](#-assumptions--known-gaps)

---

## 🌟 Project Overview

This project implements a single-page e-commerce checkout experience designed for simplicity, user clarity, and operational resilience. The solution addresses the core requirements of:
- **Synthetic Products**: Two fixed-price products ("Mechanical Gaming Keyboard" at ₹75.00 and "Wireless Ergonomic Mouse" at ₹45.00) using custom product images.
- **Monochrome UI**: Clean, high-contrast pure Black and White interface.
- **Reactive Cart**: Add/remove items, increment/decrement quantities, dynamic line totals, and order total calculation in Indian Rupees (₹).
- **Mistake Handling & Form Preservation**: Blocks checkout if the cart is empty or the required customer name is missing, while rigorously preserving entered customer inputs.
- **Concurrency & Idempotency Safeguard**: Protects against rapid double-clicking on "Place Order" to guarantee that only one confirmation and one unique order reference are ever generated.
- **Automated Verification**: End-to-end browser test automation with Playwright covering successful checkouts, validation blocking, dynamic calculation updates, empty cart edge cases, and double-click race conditions.

---

## ⚙️ Key Features & Business Rules

### 1. Product Catalog & Cart Management
- **Products**:
  - `prod-1`: Mechanical Gaming Keyboard — **₹75.00**
  - `prod-2`: Wireless Ergonomic Mouse — **₹45.00**
- Customers can add products to the cart from the catalog.
- Customers can adjust quantities using `+` and `-` buttons or direct numeric input.
- Customers can remove any item with the `Remove` button.
- All line totals (`unit price × quantity`) and grand totals update reactively with exact currency precision.

### 2. Common Mistake Handling & Input Preservation
- **Empty Cart Prevention**: Attempting to check out with 0 items alerts the customer: `"Your cart is empty. Please add at least one product to check out."`.
- **Required Field Validation**: Full Name is mandatory. Submitting with a blank or whitespace-only name alerts the customer: `"Please enter your full name to complete the checkout."` and focuses the field.
- **Data Preservation**: Validation failures never wipe out entered form fields or cart items.

### 3. Double-Click & Race Condition Prevention
- The submit button immediately enters a disabled state (`isSubmitting = true`), displays `"Processing Order..."`, and discards any subsequent click events within the same cycle.
- Once placed, only a single confirmation screen is rendered displaying a unique reference number (e.g., `ORD-582910`).

---

## 🏗 Architecture & Tech Stack

- **Frontend**: Clean Vanilla JavaScript (ES6+), semantic HTML5, modern CSS3 (Flexbox/Grid, CSS custom properties, responsive design).
- **Backend / Web Server**: Zero-external-dependency Node.js HTTP server (`server.js`) serving static assets with proper MIME types.
- **Test Automation Framework**: **Playwright** (`@playwright/test`) with Chromium engine.
- **Locators & Accessibility**: Standardized `data-testid` attributes and ARIA roles for clean, flake-free, and resilient test automation.

---

## 📦 Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher

### Installation Steps

1. Clone or extract the repository:
   ```bash
   cd "d:/fynd project"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browser binaries (Chromium):
   ```bash
   npx playwright install chromium
   ```

---

## 🚀 Running the Application

To start the local web server:

```bash
npm start
```

The application will be accessible at:
👉 **`http://localhost:3000`**

Open the link in any modern web browser to interact with the single-page checkout manually.

---

## 🧪 Executing Automated Browser Tests

The Playwright configuration is pre-configured with a built-in `webServer` hook, which automatically launches `node server.js` before executing tests and shuts it down afterward.

### Run All Automated Tests (Headless)
```bash
npm test
```

### Run Tests in Headed Mode (Watch Browser Live)
```bash
npm run test:headed
```

### Run Interactive Playwright UI Mode
```bash
npm run test:ui
```

### Open the HTML Test Report & Trace Viewer
```bash
npm run test:report
```

---

## 🔬 Automated Test Suite Structure

Located in `tests/checkout.spec.js`, the test suite runs five comprehensive checks:

| Test ID | Test Name | Key Verifications |
| :--- | :--- | :--- |
| **Check 1** | Successful Checkout with Reference | Cart reflects added item (₹75.00), customer fills name, places order, asserts confirmation view is visible, asserts unique reference matches `^ORD-\d{6}$`, verifies customer name and total on confirmation. |
| **Check 2** | Missing Required Field Validation | Attempts checkout with blank customer name, asserts error alert appears, asserts confirmation is hidden, asserts input preservation. |
| **Check 3** | Reactive Quantity & Totals Update | Tests keyboard quantity increment (₹75 -> ₹150), adds mouse (₹150 -> ₹195), direct numeric edit on mouse quantity (₹195 -> ₹285), decrements keyboard (₹285 -> ₹210), removes mouse (₹210 -> ₹75). Asserts exact line and grand totals at every step. |
| **Check 4** | Empty Cart Mistake Handling | Enters name with 0 items in cart, asserts error banner, asserts entered name is preserved, asserts checkout is blocked. |
| **Check 5** | Double-Click Idempotency | Fires rapid consecutive clicks on Place Order, asserts button disables, asserts exactly ONE confirmation view and ONE order reference are generated. |

---

## 📑 Test Plan & Key Checkout Risks

The comprehensive test plan is documented in [`test-plan.md`](test-plan.md). Key checkout risks are prioritized:

1. **P0 - Duplicate Orders / Race Conditions**: Prevented via immediate button disabling and state guards.
2. **P0 - Financial & Calculation Discrepancies**: Prevented via exact mathematical logic and verified through dynamic assertions.
3. **P1 - Phantom / Incomplete Orders**: Prevented via empty cart and mandatory name validations.
4. **P1 - Data Loss on Mistake**: Handled by retaining user inputs across validation cycles.
5. **P2 - Traceability & Confirmation Ambiguity**: Mitigated via unique order reference numbers and itemized receipts.

---

## 🔍 Manual Exploratory Testing & Defect Report

Detailed in [`defect-reports.md`](defect-reports.md).

Per the evaluation instruction (*"Report real defects if found; don't invent one to satisfy the brief"*):
- **Empty Cart Manual Check**: Attempted checkout with empty cart; verified clear alert appears and customer name input is preserved. (Result: **PASS**)
- **Rapid Double-Click Manual Check**: Triggered rapid multi-clicks on Place Order; verified button disabled immediately and only one confirmation reference was generated. (Result: **PASS**)
- **Whitespace Input Check**: Verified whitespace strings cannot bypass required field. (Result: **PASS**)
- **No synthetic defects were invented.** All safeguards operated cleanly.

---

## 📌 Known Gaps

1. **In-Memory State**: No persistent backend database or localStorage is used (as requested: *no backend, database, payments, or external services required*).
2. **Payment Gateways**: Simulated checkout flow; real credit card / UPI gateways are out of scope.
3. **Synthetic Products**: Two hardcoded products with static pricing (₹75.00 and ₹45.00).

