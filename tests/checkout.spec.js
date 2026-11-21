// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Mini Checkout Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Start each test from a clean state
    await page.goto('/');
    // Verify initial load has empty cart and default zero totals in INR
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('₹0.00');
  });

  /**
   * Automated Check 1:
   * Verify a successful checkout produces a confirmation with an order reference.
   */
  test('Check 1: Successful checkout produces an order confirmation with reference', async ({ page }) => {
    // Verify product image is visible
    await expect(page.getByTestId('product-image-prod-1')).toBeVisible();

    // 1. Add product to cart
    await page.getByTestId('add-to-cart-prod-1').click();

    // Verify cart reflects added item with INR currency
    await expect(page.getByTestId('cart-item-prod-1')).toBeVisible();
    await expect(page.getByTestId('line-total-prod-1')).toHaveText('₹75.00');
    await expect(page.getByTestId('order-total')).toHaveText('₹75.00');

    // 2. Fill required customer name
    const customerInput = page.getByTestId('customer-name');
    await customerInput.fill('Sarah Connor');
    await expect(customerInput).toHaveValue('Sarah Connor');

    // 3. Submit checkout
    await page.getByTestId('place-order-btn').click();

    // 4. Assertions on what the customer sees on confirmation
    const confirmationView = page.getByTestId('order-confirmation');
    await expect(confirmationView).toBeVisible();
    await expect(confirmationView).toHaveText('Order Confirmed!');

    // Verify order reference format (ORD-XXXXXX)
    const orderRef = page.getByTestId('order-reference');
    await expect(orderRef).toBeVisible();
    await expect(orderRef).toHaveText(/^ORD-\d{6}$/);

    // Verify customer name and final total on confirmation in INR
    await expect(page.getByTestId('confirmed-name')).toHaveText('Sarah Connor');
    await expect(page.getByTestId('confirmed-total')).toHaveText('₹75.00');

    // Verify checkout view is hidden
    await expect(page.locator('#checkout-view')).toBeHidden();
  });

  /**
   * Automated Check 2:
   * Verify a missing required field blocks checkout, displays clear validation, and preserves input.
   */
  test('Check 2: Missing required field blocks checkout and shows validation message', async ({ page }) => {
    // 1. Add product to cart so cart is valid
    await page.getByTestId('add-to-cart-prod-1').click();
    await expect(page.getByTestId('cart-item-prod-1')).toBeVisible();

    // 2. Keep required name field empty
    const customerInput = page.getByTestId('customer-name');
    await expect(customerInput).toHaveValue('');

    // 3. Attempt to place order
    await page.getByTestId('place-order-btn').click();

    // 4. Verify validation error message is clearly displayed
    const errorAlert = page.getByTestId('error-message');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText('Please enter your full name to complete the checkout.');

    // 5. Verify checkout is blocked: confirmation view must NOT appear
    await expect(page.getByTestId('order-confirmation')).toBeHidden();
    await expect(page.locator('#checkout-view')).toBeVisible();

    // 6. Verify input preservation: user enters partial name and cart remains intact
    await customerInput.fill('Jane');
    await expect(customerInput).toHaveValue('Jane');
    await expect(page.getByTestId('order-total')).toHaveText('₹75.00');
  });

  /**
   * Automated Check 3:
   * Verify a quantity change updates line totals and order total with exact precision.
   */
  test('Check 3: Quantity change updates line total and exact order total', async ({ page }) => {
    // 1. Add Keyboard (₹75.00)
    await page.getByTestId('add-to-cart-prod-1').click();
    await expect(page.getByTestId('qty-input-prod-1')).toHaveValue('1');
    await expect(page.getByTestId('line-total-prod-1')).toHaveText('₹75.00');
    await expect(page.getByTestId('order-total')).toHaveText('₹75.00');

    // 2. Increase Keyboard quantity via [+] button to 2
    await page.getByTestId('increase-qty-prod-1').click();
    await expect(page.getByTestId('qty-input-prod-1')).toHaveValue('2');
    await expect(page.getByTestId('line-total-prod-1')).toHaveText('₹150.00');
    await expect(page.getByTestId('order-total')).toHaveText('₹150.00');

    // 3. Add second product: Mouse (₹45.00)
    await page.getByTestId('add-to-cart-prod-2').click();
    await expect(page.getByTestId('qty-input-prod-2')).toHaveValue('1');
    await expect(page.getByTestId('line-total-prod-2')).toHaveText('₹45.00');
    // Total should now be ₹150.00 + ₹45.00 = ₹195.00
    await expect(page.getByTestId('order-total')).toHaveText('₹195.00');

    // 4. Change Mouse quantity directly in the numeric input to 3
    const mouseQtyInput = page.getByTestId('qty-input-prod-2');
    await mouseQtyInput.fill('3');
    // Trigger change event
    await mouseQtyInput.dispatchEvent('change');
    // Mouse line total: 3 * ₹45.00 = ₹135.00
    await expect(page.getByTestId('line-total-prod-2')).toHaveText('₹135.00');
    // Total should now be ₹150.00 (Keyboard) + ₹135.00 (Mouse) = ₹285.00
    await expect(page.getByTestId('order-total')).toHaveText('₹285.00');

    // 5. Decrease Keyboard quantity via [-] button to 1
    await page.getByTestId('decrease-qty-prod-1').click();
    await expect(page.getByTestId('qty-input-prod-1')).toHaveValue('1');
    await expect(page.getByTestId('line-total-prod-1')).toHaveText('₹75.00');
    // Total should now be ₹75.00 + ₹135.00 = ₹210.00
    await expect(page.getByTestId('order-total')).toHaveText('₹210.00');

    // 6. Remove Mouse completely
    await page.getByTestId('remove-item-prod-2').click();
    await expect(page.getByTestId('cart-item-prod-2')).toBeHidden();
    // Total should now revert back to ₹75.00
    await expect(page.getByTestId('order-total')).toHaveText('₹75.00');
  });

  /**
   * Additional Automated Check 4 (Cart Mistake Handling):
   * Block checkout when cart is empty, show clear message, and preserve customer input.
   */
  test('Check 4: Empty cart blocks checkout and preserves customer name input', async ({ page }) => {
    // 1. Enter customer name with cart empty
    const customerInput = page.getByTestId('customer-name');
    await customerInput.fill('Arthur Dent');

    // 2. Click Place Order
    await page.getByTestId('place-order-btn').click();

    // 3. Verify validation error message
    const errorAlert = page.getByTestId('error-message');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText('Your cart is empty. Please add at least one product to check out.');

    // 4. Verify input preservation
    await expect(customerInput).toHaveValue('Arthur Dent');

    // 5. Verify confirmation is not displayed
    await expect(page.getByTestId('order-confirmation')).toBeHidden();
  });

  /**
   * Additional Automated Check 5 (Double-Click & Idempotency):
   * Rapid double-clicking Place Order produces exactly ONE confirmation.
   */
  test('Check 5: Rapid double-click produces exactly one confirmation reference', async ({ page }) => {
    // 1. Setup valid order
    await page.getByTestId('add-to-cart-prod-1').click();
    await page.getByTestId('customer-name').fill('Bruce Wayne');

    // 2. Execute rapid consecutive clicks
    const submitBtn = page.getByTestId('place-order-btn');
    await Promise.all([
      submitBtn.click({ clickCount: 2 }),
      submitBtn.click().catch(() => {}) // Catch disabled element click
    ]);

    // 3. Verify exactly one confirmation is shown
    await expect(page.getByTestId('order-confirmation')).toHaveCount(1);
    await expect(page.getByTestId('order-confirmation')).toBeVisible();

    // 4. Verify only one order reference exists on page
    const orderRefs = page.getByTestId('order-reference');
    await expect(orderRefs).toHaveCount(1);
    const refText = await orderRefs.innerText();
    expect(refText).toMatch(/^ORD-\d{6}$/);
  });

});
