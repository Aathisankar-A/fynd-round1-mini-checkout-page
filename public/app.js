// ============================================================================
// Mini Checkout Application Logic
// ============================================================================

// Synthetic Products Catalog
const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Mechanical Gaming Keyboard',
    price: 75.00,
    image: 'keyboard.jpg',
    description: 'RGB backlit tactile mechanical keyboard with hot-swappable switches.'
  },
  {
    id: 'prod-2',
    name: 'Wireless Ergonomic Mouse',
    price: 45.00,
    image: 'mouse.jpg',
    description: 'Precision optical sensor, dual Bluetooth/2.4G wireless with silent clicks.'
  }
];

// Application State
const state = {
  cart: [], // Array of { productId, quantity }
  isSubmitting: false,
  orderPlaced: false,
  lastOrder: null
};

// DOM Elements
const elements = {
  productsList: document.getElementById('products-list'),
  cartBadge: document.getElementById('cart-badge'),
  emptyCartMessage: document.getElementById('empty-cart-message'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartTableBody: document.getElementById('cart-table-body'),
  summarySubtotal: document.getElementById('summary-subtotal'),
  orderTotal: document.getElementById('order-total'),
  checkoutForm: document.getElementById('checkout-form'),
  customerNameInput: document.getElementById('customer-name'),
  errorMessage: document.getElementById('error-message'),
  placeOrderBtn: document.getElementById('place-order-btn'),
  checkoutView: document.getElementById('checkout-view'),
  confirmationView: document.getElementById('confirmation-view'),
  confirmedReference: document.getElementById('confirmed-reference'),
  confirmedName: document.getElementById('confirmed-name'),
  confirmedDate: document.getElementById('confirmed-date'),
  confirmedItemsList: document.getElementById('confirmed-items-list'),
  confirmedTotal: document.getElementById('confirmed-total'),
  startNewOrderBtn: document.getElementById('start-new-order-btn')
};

// ============================================================================
// Formatters & Utilities
// ============================================================================
function formatCurrency(amount) {
  return `₹${amount.toFixed(2)}`;
}

function generateOrderReference() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNum}`;
}

// ============================================================================
// Render Catalog
// ============================================================================
function renderCatalog() {
  elements.productsList.innerHTML = '';

  PRODUCTS.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-testid', `product-card-${product.id}`);

    card.innerHTML = `
      <div class="product-image-container">
        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-image"
          data-testid="product-image-${product.id}"
        />
      </div>
      <h3 class="product-name" data-testid="product-name-${product.id}">${product.name}</h3>
      <p class="product-desc">${product.description}</p>
      <div class="product-footer">
        <span class="product-price" data-testid="product-price-${product.id}">${formatCurrency(product.price)}</span>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          data-testid="add-to-cart-${product.id}"
          onclick="addToCart('${product.id}')"
        >
          Add to Cart
        </button>
      </div>
    `;

    elements.productsList.appendChild(card);
  });
}

// ============================================================================
// Cart Operations
// ============================================================================
function addToCart(productId) {
  // Clear any existing cart-empty error when user adds an item
  clearError();

  const existingItem = state.cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({
      productId,
      quantity: 1
    });
  }

  renderCart();
}

function updateQuantity(productId, newQty) {
  clearError();

  const itemIndex = state.cart.findIndex(item => item.productId === productId);
  if (itemIndex === -1) return;

  const parsedQty = parseInt(newQty, 10);

  if (isNaN(parsedQty) || parsedQty <= 0) {
    // If set to 0 or invalid, remove item
    removeFromCart(productId);
    return;
  }

  state.cart[itemIndex].quantity = parsedQty;
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  renderCart();
}

// ============================================================================
// Render Cart & Totals
// ============================================================================
function calculateTotals() {
  let subtotal = 0;
  let totalQuantity = 0;

  state.cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
      totalQuantity += item.quantity;
    }
  });

  return {
    subtotal,
    total: subtotal,
    totalQuantity
  };
}

function renderCart() {
  const { subtotal, total, totalQuantity } = calculateTotals();

  // Update Badge
  elements.cartBadge.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;

  // Update Totals
  const formattedSubtotal = formatCurrency(subtotal);
  const formattedTotal = formatCurrency(total);
  elements.summarySubtotal.textContent = formattedSubtotal;
  elements.orderTotal.textContent = formattedTotal;

  // Toggle Empty State vs Items Table
  if (state.cart.length === 0) {
    elements.emptyCartMessage.classList.remove('hidden');
    elements.cartItemsContainer.classList.add('hidden');
    elements.cartTableBody.innerHTML = '';
    return;
  }

  elements.emptyCartMessage.classList.add('hidden');
  elements.cartItemsContainer.classList.remove('hidden');
  elements.cartTableBody.innerHTML = '';

  state.cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return;

    const lineTotal = product.price * item.quantity;
    const tr = document.createElement('tr');
    tr.setAttribute('data-testid', `cart-item-${product.id}`);

    tr.innerHTML = `
      <td>
        <strong>${product.name}</strong>
      </td>
      <td class="text-right" data-testid="cart-item-price-${product.id}">
        ${formatCurrency(product.price)}
      </td>
      <td class="text-center">
        <div class="qty-control">
          <button
            type="button"
            class="qty-btn"
            data-testid="decrease-qty-${product.id}"
            onclick="updateQuantity('${product.id}', ${item.quantity - 1})"
            aria-label="Decrease quantity"
            ${item.quantity <= 1 ? 'disabled' : ''}
          >-</button>
          <input
            type="number"
            class="qty-input"
            data-testid="qty-input-${product.id}"
            value="${item.quantity}"
            min="1"
            max="99"
            aria-label="Item quantity"
            onchange="updateQuantity('${product.id}', this.value)"
          />
          <button
            type="button"
            class="qty-btn"
            data-testid="increase-qty-${product.id}"
            onclick="updateQuantity('${product.id}', ${item.quantity + 1})"
            aria-label="Increase quantity"
          >+</button>
        </div>
      </td>
      <td class="text-right" data-testid="line-total-${product.id}">
        ${formatCurrency(lineTotal)}
      </td>
      <td class="text-center">
        <button
          type="button"
          class="btn-remove"
          data-testid="remove-item-${product.id}"
          onclick="removeFromCart('${product.id}')"
          aria-label="Remove ${product.name} from cart"
        >
          Remove
        </button>
      </td>
    `;

    elements.cartTableBody.appendChild(tr);
  });
}

// ============================================================================
// Validation & Error Handling
// ============================================================================
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.remove('hidden');
}

function clearError() {
  elements.errorMessage.textContent = '';
  elements.errorMessage.classList.add('hidden');
  elements.customerNameInput.classList.remove('input-error');
}

// ============================================================================
// Checkout Form Submission & Idempotency
// ============================================================================
function handleCheckout(e) {
  if (e) e.preventDefault();

  // Guard against duplicate / concurrent submission
  if (state.isSubmitting || state.orderPlaced) {
    return;
  }

  clearError();

  const customerName = elements.customerNameInput.value.trim();

  // Mistake Rule 1: Empty cart check
  if (state.cart.length === 0) {
    showError('Your cart is empty. Please add at least one product to check out.');
    // Keep user's input intact
    return;
  }

  // Mistake Rule 2: Blank required field check
  if (!customerName) {
    elements.customerNameInput.classList.add('input-error');
    elements.customerNameInput.focus();
    showError('Please enter your full name to complete the checkout.');
    // Keep user's input intact
    return;
  }

  // Start submission process & lock button (Rapid double-click protection)
  state.isSubmitting = true;
  elements.placeOrderBtn.disabled = true;
  elements.placeOrderBtn.textContent = 'Processing Order...';

  // Build order summary snapshot
  const { total } = calculateTotals();
  const orderDetails = {
    reference: generateOrderReference(),
    customerName,
    date: new Date().toLocaleString(),
    items: state.cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    }),
    total: formatCurrency(total)
  };

  // Complete order placement
  state.lastOrder = orderDetails;
  state.orderPlaced = true;
  state.isSubmitting = false;

  displayConfirmation(orderDetails);
}

// ============================================================================
// Order Confirmation Display
// ============================================================================
function displayConfirmation(order) {
  elements.checkoutView.classList.add('hidden');
  elements.confirmationView.classList.remove('hidden');

  elements.confirmedReference.textContent = order.reference;
  elements.confirmedName.textContent = order.customerName;
  elements.confirmedDate.textContent = order.date;
  elements.confirmedTotal.textContent = order.total;

  elements.confirmedItemsList.innerHTML = '';
  order.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'confirmed-item-row';
    row.innerHTML = `
      <span>${item.name} &times; ${item.quantity}</span>
      <strong>${formatCurrency(item.lineTotal)}</strong>
    `;
    elements.confirmedItemsList.appendChild(row);
  });

  // Scroll to confirmation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// Reset / Start New Order
// ============================================================================
function startNewOrder() {
  state.cart = [];
  state.isSubmitting = false;
  state.orderPlaced = false;
  state.lastOrder = null;

  elements.customerNameInput.value = '';
  elements.placeOrderBtn.disabled = false;
  elements.placeOrderBtn.textContent = 'Place Order';
  clearError();

  elements.confirmationView.classList.add('hidden');
  elements.checkoutView.classList.remove('hidden');

  renderCart();
}

// ============================================================================
// Initialization & Event Listeners
// ============================================================================
function init() {
  renderCatalog();
  renderCart();

  elements.checkoutForm.addEventListener('submit', handleCheckout);
  elements.startNewOrderBtn.addEventListener('click', startNewOrder);

  // Clear name input error when user begins typing
  elements.customerNameInput.addEventListener('input', () => {
    if (elements.customerNameInput.classList.contains('input-error')) {
      clearError();
    }
  });
}

// Make global handlers accessible for inline onclicks
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

document.addEventListener('DOMContentLoaded', init);

