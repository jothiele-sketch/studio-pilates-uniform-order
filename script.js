const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvgwsJntrPHyQXsXtpUHRD_FwuwAY8RuaE7aSOpcVErk5EcnYJvggqDP58C4eAqf4o/exec";

const products = [
  {
    category: "Women's",
    name: "Women's Crew T-Shirt",
    price: 25,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    type: "shirt",
    fit: "Classic crew tee. Choose your usual size; size up if you prefer a looser fit.",
    measurements: [
      ["XS", "45.5", "62.5"], ["S", "48", "63.5"], ["M", "50.5", "64.5"],
      ["L", "53", "65.5"], ["XL", "55.5", "66.5"], ["2XL", "58", "67.5"], ["3XL", "60.5", "68.5"]
    ]
  },
  {
    category: "Women's",
    name: "Women's Long Sleeve Crew Tee",
    price: 35,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    type: "long-sleeve",
    fit: "Long sleeve crew tee. Good for cooler mornings or layering.",
    measurements: [
      ["XS", "45.5", "63.5"], ["S", "48", "64.5"], ["M", "50.5", "65.5"],
      ["L", "53", "66.5"], ["XL", "55.5", "67.5"], ["2XL", "58", "68.5"]
    ]
  },
  {
    category: "Women's",
    name: "Women's Crew Jumper",
    price: 45,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    type: "jumper",
    fit: "Crew jumper. Slightly roomier than the tees; choose your usual size for a casual fit.",
    measurements: [
      ["XS", "49", "60"], ["S", "51.5", "62"], ["M", "54", "64"],
      ["L", "56.5", "66"], ["XL", "59", "68"], ["2XL", "61.5", "70"], ["3XL", "64", "72"]
    ]
  },
  {
    category: "Women's",
    name: "Women's Crew Leggings",
    price: 57,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    type: "leggings",
    fit: "Firm activewear fit. If between sizes, consider sizing up.",
    measurements: [
      ["XS", "61-67", "87-93"], ["S", "68-74", "94-100"], ["M", "75-81", "101-107"],
      ["L", "82-88", "108-114"], ["XL", "89-95", "115-121"], ["2XL", "96-102", "122-128"]
    ],
    measurementHeaders: ["Size", "Waist cm", "Hip cm"]
  },
  {
    category: "Men's",
    name: "Men's Crew T-Shirt",
    price: 25,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    type: "shirt",
    fit: "Standard men's crew tee. Choose your usual size.",
    measurements: [
      ["S", "47", "71"], ["M", "52", "75"], ["L", "56.5", "78.5"], ["XL", "61", "82"],
      ["2XL", "64", "83.5"], ["3XL", "68", "85"], ["4XL", "75", "87"], ["5XL", "80", "89"]
    ]
  },
  {
    category: "Men's",
    name: "Men's Long Sleeve Crew Tee",
    price: 36.50,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    type: "long-sleeve",
    fit: "Standard men's long sleeve tee.",
    measurements: [
      ["S", "47", "71"], ["M", "52", "75"], ["L", "56.5", "78.5"], ["XL", "61", "82"],
      ["2XL", "64", "83.5"], ["3XL", "68", "85"], ["4XL", "75", "87"], ["5XL", "80", "89"]
    ]
  },
  {
    category: "Men's",
    name: "Men's Crew Jumper",
    price: 47,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    type: "jumper",
    fit: "Men's crew jumper. Casual fit.",
    measurements: [
      ["XS", "49", "64"], ["S", "52", "67"], ["M", "55", "70"], ["L", "58", "73"], ["XL", "61", "76"],
      ["2XL", "64", "79"], ["3XL", "67", "82"], ["4XL", "70", "85"], ["5XL", "73", "88"]
    ]
  }
];

const state = {
  filter: "all",
  selectedSizes: {},
  cart: []
};

const productsEl = document.getElementById("products");
const template = document.getElementById("productTemplate");
const cart = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const cartToggle = document.getElementById("cartToggle");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartItemTotal = document.getElementById("cartItemTotal");
const cartTotal = document.getElementById("cartTotal");
const checkoutForm = document.getElementById("checkoutForm");
const formMessage = document.getElementById("formMessage");
const modal = document.getElementById("sizeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

function money(value) {
  return Number(value).toFixed(2);
}

function renderProducts() {
  productsEl.innerHTML = "";
  products
    .filter(product => state.filter === "all" || product.category === state.filter)
    .forEach(product => {
      const node = template.content.cloneNode(true);
      const card = node.querySelector(".product-card");
      const image = node.querySelector(".product-image");
      const category = node.querySelector(".category");
      const title = node.querySelector("h3");
      const price = node.querySelector(".price");
      const fit = node.querySelector(".fit-note");
      const sizes = node.querySelector(".sizes");
      const qty = node.querySelector(".qty");
      const sizeGuide = node.querySelector(".size-guide");
      const add = node.querySelector(".add-to-cart");

      card.dataset.category = product.category;
      image.innerHTML = `<div class="${product.type === "leggings" ? "mock-leggings" : "mock-shirt"} ${product.type}"></div>`;
      category.textContent = product.category;
      title.textContent = product.name;
      price.textContent = `$${money(product.price)}`;
      fit.textContent = product.fit;

      product.sizes.forEach(size => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "size-btn";
        button.textContent = size;
        button.addEventListener("click", () => {
          state.selectedSizes[product.name] = size;
          sizes.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
          button.classList.add("selected");
        });
        sizes.appendChild(button);
      });

      sizeGuide.addEventListener("click", () => openSizeGuide(product));
      add.addEventListener("click", () => addToCart(product, Number(qty.value)));

      productsEl.appendChild(node);
    });
}

function addToCart(product, quantity) {
  const size = state.selectedSizes[product.name];
  if (!size) {
    alert("Please select a size first.");
    return;
  }
  if (!quantity || quantity < 1) {
    alert("Please enter a quantity of at least 1.");
    return;
  }

  const existing = state.cart.find(item => item.name === product.name && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      product: product.name,
      size,
      quantity,
      price: product.price
    });
  }

  renderCart();
  openCart();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  if (!state.cart.length) {
    cartItems.innerHTML = `<p class="empty">No items added yet.</p>`;
  } else {
    cartItems.innerHTML = state.cart.map((item, index) => `
      <div class="cart-line">
        <strong>${item.product}</strong>
        <small>${item.size} × ${item.quantity}</small>
        <div>$${money(item.price * item.quantity)}</div>
        <button type="button" onclick="removeCartItem(${index})">Remove</button>
      </div>
    `).join("");
  }

  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartCount.textContent = itemCount;
  cartItemTotal.textContent = itemCount;
  cartTotal.textContent = money(total);
}

function openCart() {
  cart.classList.add("open");
  overlay.classList.add("show");
}

function closeCartPanel() {
  cart.classList.remove("open");
  overlay.classList.remove("show");
}

function openSizeGuide(product) {
  modalTitle.textContent = `${product.name} Size Guide`;
  const headers = product.measurementHeaders || ["Size", "Width cm", "Length cm"];
  const rows = product.measurements.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`
  ).join("");

  modalBody.innerHTML = `
    <p>${product.fit}</p>
    <table class="size-table">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:12px;color:#666;">Measurements are based on the supplier size guide screenshots provided. Please check carefully before submitting.</p>
  `;
  modal.hidden = false;
}

function closeSizeGuide() {
  modal.hidden = true;
}

async function submitOrder(event) {
  event.preventDefault();

  if (!state.cart.length) {
    alert("Please add at least one item to your order.");
    return;
  }

  const name = document.getElementById("staffName").value.trim();
  const email = document.getElementById("staffEmail").value.trim();

  if (!name || !email) {
    alert("Please enter your name and email.");
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const payload = {
    name,
    email,
    total,
    items: state.cart,
    source: "Vercel uniform order page"
  };

  formMessage.className = "form-message";
  formMessage.textContent = "Submitting your order...";
  document.getElementById("submitButton").disabled = true;

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    formMessage.className = "form-message success";
    formMessage.innerHTML = `Thank you ${name}. Your order has been submitted.<br>Total owing: <strong>$${money(total)}</strong><br>The studio will cover shipping.`;
    state.cart = [];
    renderCart();
    checkoutForm.reset();
  } catch (error) {
    formMessage.className = "form-message error";
    formMessage.textContent = "Something went wrong. Please try again or let Jo know.";
  } finally {
    document.getElementById("submitButton").disabled = false;
  }
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    renderProducts();
  });
});

cartToggle.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);
checkoutForm.addEventListener("submit", submitOrder);
closeModal.addEventListener("click", closeSizeGuide);
modal.addEventListener("click", event => {
  if (event.target === modal) closeSizeGuide();
});

renderProducts();
renderCart();
