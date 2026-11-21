# Defect & Exploratory Testing Report

**Project:** Mini Checkout Single-Page Application  
**Author:** SDET Candidate  
**Assessment:** FyndHacks - SDET Track  
**Evaluation Standard:** *"Report real defects if found; don't invent one to satisfy the brief."*  

---

## 1. Summary of Defect Investigation

A comprehensive battery of exploratory, boundary, negative, and concurrency tests was executed across the application. Per the prompt instructions, **no synthetic or artificial defects were fabricated**. Each area was probed against the requirements to ensure genuine quality assurance.

| Category | Tests Executed | Passed | Defects Found | Status |
| :--- | :--- | :--- | :--- | :--- |
| Empty Cart Validation | 3 | 3 | 0 | Verified |
| Rapid Double-Click / Race Condition | 4 | 4 | 0 | Verified |
| Input Validation & State Retention | 4 | 4 | 0 | Verified |
| Dynamic Pricing & Calculation | 5 | 5 | 0 | Verified |
| Reset & Navigation Flow | 2 | 2 | 0 | Verified |

---

## 2. Detailed Exploratory Test Records

### Test Case EXP-01: Empty Cart Submission with Form Data Retention
- **Objective:** Verify that placing an order with 0 items in the cart is prevented, an alert is surfaced, and customer input is preserved.
- **Initial State:** Clean browser session (`/`), cart is empty.
- **Steps:**
  1. Leave cart empty (0 items).
  2. Type `"Dr. Alex Rivera"` in the Full Name input field.
  3. Click `"Place Order"`.
- **Expected Result:**
  - Order is blocked; confirmation view is NOT loaded.
  - An error message appears stating `"Your cart is empty. Please add at least one product to check out."`.
  - The customer name field retains `"Dr. Alex Rivera"`.
- **Actual Result:**
  - Order was blocked.
  - Alert message `#error-message` displayed `"Your cart is empty. Please add at least one product to check out."`.
  - The value of `#customer-name` remained `"Dr. Alex Rivera"`.
- **Defect Status:** None. Behaved as expected.

---

### Test Case EXP-02: Rapid Double-Click & Multi-Click Concurrency
- **Objective:** Verify that rapid consecutive clicks on the `"Place Order"` button do not trigger multiple order confirmations or duplicate order references.
- **Initial State:** Product 1 added to cart, Customer Name entered (`"Sarah Connor"`).
- **Steps:**
  1. Trigger 2 consecutive click events within 50ms using automated script and manual rapid tapping.
- **Expected Result:**
  - First click locks the submission state (`isSubmitting = true`), disables the button, and initiates checkout.
  - Subsequent clicks within the same cycle are discarded.
  - Exactly one order confirmation view is rendered.
  - Exactly one order reference (`ORD-XXXXXX`) is generated.
- **Actual Result:**
  - Button was immediately disabled and updated text to `"Processing Order..."`.
  - Only a single confirmation screen rendered.
  - Single unique reference `ORD-XXXXXX` was created.
- **Defect Status:** None. Button debouncing and submission lock functioned as expected.

---

### Test Case EXP-03: Whitespace-Only Name Input
- **Objective:** Verify whether whitespace-only strings (e.g. `"    "`) can bypass the required field validation.
- **Initial State:** 1 item in cart.
- **Steps:**
  1. Click Full Name field and press Spacebar 5 times.
  2. Click `"Place Order"`.
- **Expected Result:**
  - Checkout is blocked because whitespace does not constitute a valid customer name.
  - Validation message `"Please enter your full name to complete the checkout."` appears.
- **Actual Result:**
  - `.trim()` validation successfully blocked checkout and highlighted the input with `.input-error`.
- **Defect Status:** None. Handled cleanly.

---

### Test Case EXP-04: Non-Numeric or Zero Quantity Handling
- **Objective:** Verify how the cart responds when a user manually types `0` or negative numbers into the quantity field.
- **Initial State:** Keyboard in cart with quantity 1.
- **Steps:**
  1. Highlight quantity input and type `0`.
- **Expected Result:**
  - Application handles quantity `0` gracefully by removing the item from the cart and updating the total to `$0.00`.
- **Actual Result:**
  - Cart automatically cleared the item, updated cart badge to 0 items, and showed the empty cart placeholder.
- **Defect Status:** None. Expected standard e-commerce behavior.

---

## 3. Assumptions, Known Gaps & What Was Not Tested

Per the submission guidelines, the following assumptions and exclusions are explicitly noted:

1. **Synthetic In-Memory State:**
   - The application does not persist data to a remote SQL/NoSQL database or localStorage. A page refresh resets state to initial clean defaults.
2. **Payment Processing:**
   - Payment gateways (Stripe, card tokens) are out of scope. The checkout simulates order completion with reference generation.
3. **Multi-Tab Synchronization:**
   - Synchronizing cart state across multiple browser tabs via BroadcastChannel or WebSockets was not tested or implemented as this is a single-page checkout demonstration.
4. **Extreme Volume Concurrency:**
   - Distributed server-level concurrency (multiple concurrent users submitting to the same backend inventory) was not tested since the app runs fully client-side.

