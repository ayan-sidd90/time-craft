const bag = [];

const bagButton = document.getElementById("bag-button");
const bagClose = document.getElementById("bag-close");
const bagPanel = document.getElementById("bag-panel");
const overlay = document.getElementById("overlay");
const bagItems = document.getElementById("bag-items");
const bagCount = document.getElementById("bag-count");
const bagTotal = document.getElementById("bag-total");
const checkout = document.getElementById("checkout");

const navigation = document.getElementById("navigation");
const menuToggle = document.getElementById("menu-toggle");

// Apna WhatsApp number country code ke sath add karna.
// Example format: 923001234567
const WHATSAPP_NUMBER = "923001234567";

function formatPrice(amount) {
    return "Rs. " + amount.toLocaleString("en-PK");
}

// Mobile menu
menuToggle.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// Shopping bag open and close
function openBag() {
    document.body.classList.add("bag-open");
    bagPanel.setAttribute("aria-hidden", "false");
    bagButton.setAttribute("aria-expanded", "true");
}

function closeBag() {
    document.body.classList.remove("bag-open");
    bagPanel.setAttribute("aria-hidden", "true");
    bagButton.setAttribute("aria-expanded", "false");
}

bagButton.addEventListener("click", openBag);
bagClose.addEventListener("click", closeBag);
overlay.addEventListener("click", closeBag);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeBag();
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

// Product category filters
const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");

filters.forEach(function (button) {
    button.addEventListener("click", function () {
        const category = button.dataset.filter;

        filters.forEach(function (filter) {
            filter.classList.remove("active");
        });

        button.classList.add("active");

        products.forEach(function (product) {
            product.hidden =
                category !== "all" &&
                product.dataset.category !== category;
        });
    });
});

// Add product to shopping bag
document.querySelectorAll(".add-button").forEach(function (button) {
    button.addEventListener("click", function () {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!name || !Number.isFinite(price) || price <= 0) {
            return;
        }

        const existing = bag.find(function (item) {
            return item.name === name;
        });

        if (existing) {
            existing.quantity++;
        } else {
            bag.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        renderBag();
        openBag();
    });
});

// Update bag display
function renderBag() {
    const quantity = bag.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    const total = bag.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    bagCount.textContent = quantity;
    bagTotal.textContent = formatPrice(total);

    bagItems.replaceChildren();

    if (bag.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent =
            "Your bag is empty. Find a timepiece you love.";

        bagItems.appendChild(emptyMessage);
        return;
    }

    bag.forEach(function (item) {
        const row = document.createElement("div");
        row.className = "bag-item";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(item.price) + " each";

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity");

        const quantityLabel = document.createElement("span");
        quantityLabel.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity");

        minus.addEventListener("click", function () {
            item.quantity--;

            if (item.quantity <= 0) {
                bag.splice(bag.indexOf(item), 1);
            }

            renderBag();
        });

        plus.addEventListener("click", function () {
            item.quantity++;
            renderBag();
        });

        controls.append(minus, quantityLabel, plus);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-button";
        remove.textContent = "Remove";

        remove.addEventListener("click", function () {
            bag.splice(bag.indexOf(item), 1);
            renderBag();
        });

        details.append(title, price, controls, remove);

        const subtotal = document.createElement("strong");
        subtotal.textContent =
            formatPrice(item.price * item.quantity);

        row.append(details, subtotal);
        bagItems.appendChild(row);
    });
}

// WhatsApp order message
checkout.addEventListener("click", function () {
    if (bag.length === 0) {
        alert("Your shopping bag is empty. Please select a watch first.");
        return;
    }

    if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
        alert("Please add your correct WhatsApp number in script.js.");
        return;
    }

    const total = bag.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    const orderDetails = bag.map(function (item) {
        return (
            item.name +
            " x " + item.quantity +
            " — " + formatPrice(item.price * item.quantity)
        );
    });

    const message = [
        "Hello Time Craft!",
        "",
        "I am interested in ordering these watches:",
        ...orderDetails,
        "",
        "Total: " + formatPrice(total),
        "",
        "Please confirm availability and payment details."
    ].join("\n");

    const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
});

// Current copyright year
document.getElementById("year").textContent =
    new Date().getFullYear();

// Initial shopping bag state
renderBag();