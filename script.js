const body = document.body;
const currentPage = body.dataset.page || "home";
const header = document.querySelector("#site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const yearNode = document.querySelector("#current-year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.querySelectorAll("[data-nav]").forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === currentPage);
});

const handleHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

handleHeaderState();
window.addEventListener("scroll", handleHeaderState, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = prefersReducedMotion.matches ? 0 : 1600;

    if (!target) {
      counter.textContent = "0";
      return;
    }

    if (duration === 0) {
      counter.textContent = String(target);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.floor(target * eased));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = String(target);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.target || "0";
  });
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".testimonial-card"));
  const prevButton = carousel.querySelector(".carousel-button.prev");
  const nextButton = carousel.querySelector(".carousel-button.next");
  const viewport = carousel.querySelector(".carousel-viewport");
  const dotsHost = carousel.querySelector(".carousel-dots");
  let activeIndex = 0;
  let autoPlayId = null;

  if (!slides.length) {
    return;
  }

  const syncViewportHeight = () => {
    if (!viewport) {
      return;
    }

    const tallest = slides.reduce((height, slide) => {
      return Math.max(height, slide.offsetHeight);
    }, 0);

    if (tallest > 0) {
      viewport.style.minHeight = `${tallest}px`;
    }
  };

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    if (dotsHost) {
      Array.from(dotsHost.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
      });
    }

    syncViewportHeight();
  };

  const startAutoPlay = () => {
    if (prefersReducedMotion.matches || slides.length < 2) {
      return;
    }

    window.clearInterval(autoPlayId);
    autoPlayId = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  };

  if (dotsHost) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => {
        showSlide(index);
        startAutoPlay();
      });
      dotsHost.appendChild(dot);
    });
  }

  prevButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoPlay();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoPlay();
  });

  showSlide(0);
  startAutoPlay();
  window.addEventListener("resize", syncViewportHeight);
});

document.querySelectorAll("[data-faq-item]").forEach((item) => {
  const button = item.querySelector("[data-faq-question]");

  button?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    item.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

document.querySelectorAll("[data-gallery-filter-group]").forEach((group) => {
  const buttons = Array.from(group.querySelectorAll("[data-gallery-filter]"));
  const targetSelector = group.dataset.galleryFilterGroup;
  const cards = Array.from(document.querySelectorAll(targetSelector));

  if (!buttons.length || !cards.length) {
    return;
  }

  const applyFilter = (value) => {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.galleryFilter === value);
      button.setAttribute(
        "aria-pressed",
        button.dataset.galleryFilter === value ? "true" : "false"
      );
    });

    cards.forEach((card) => {
      const categories = (card.dataset.category || "")
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
      const shouldShow = value === "all" || categories.includes(value);
      card.hidden = !shouldShow;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.galleryFilter || "all");
    });
  });

  applyFilter("all");
});

const outletsBody = document.querySelector("#outlets-body");

if (outletsBody && Array.isArray(window.OUTLETS_DATA)) {
  const searchInput = document.querySelector("#outlet-search");
  const sizeSelect = document.querySelector("#outlet-size");
  const statusNode = document.querySelector("#outlets-status");
  const paginationNode = document.querySelector("#outlets-pagination");
  let currentPageIndex = 1;
  let perPage = Number(sizeSelect?.value || 16);
  let searchTerm = "";

  const getFilteredRows = () => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return window.OUTLETS_DATA;
    }

    return window.OUTLETS_DATA.filter((row) => {
      return [row.name, row.location, row.contact]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  };

  const renderPagination = (totalPages) => {
    if (!paginationNode) {
      return;
    }

    paginationNode.innerHTML = "";

    if (totalPages <= 1) {
      return;
    }

    const createButton = (label, page, isDisabled = false, isActive = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = isDisabled;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-label", `Go to page ${page}`);

      button.addEventListener("click", () => {
        currentPageIndex = page;
        renderOutlets();
      });

      paginationNode.appendChild(button);
    };

    createButton("Prev", Math.max(1, currentPageIndex - 1), currentPageIndex === 1);

    for (let page = 1; page <= totalPages; page += 1) {
      createButton(String(page), page, false, page === currentPageIndex);
    }

    createButton(
      "Next",
      Math.min(totalPages, currentPageIndex + 1),
      currentPageIndex === totalPages
    );
  };

  const renderOutlets = () => {
    const rows = getFilteredRows();
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    currentPageIndex = Math.min(currentPageIndex, totalPages);

    const startIndex = total === 0 ? 0 : (currentPageIndex - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, total);
    const visibleRows = rows.slice(startIndex, endIndex);

    outletsBody.innerHTML = "";

    if (!visibleRows.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML =
        '<td colspan="4" class="empty-state">No outlets match your search yet.</td>';
      outletsBody.appendChild(emptyRow);
    } else {
      visibleRows.forEach((row) => {
        const tableRow = document.createElement("tr");

        const intl = row.contact ? "256" + row.contact.replace(/^0/, "") : "";
        const contactCell = row.contact
          ? `<div class="outlet-contact">
               <a class="outlet-call" href="tel:+${intl}" aria-label="Call ${row.name}">
                 <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h1.88a1 1 0 0 1 .97.757l.7 2.8a1 1 0 0 1-.287.985L6.53 7.77a11.05 11.05 0 0 0 5.7 5.7l1.228-1.23a1 1 0 0 1 .985-.288l2.8.7A1 1 0 0 1 18 13.62V15.5A1.5 1.5 0 0 1 16.5 17C8.492 17 2 10.508 2 3.5A1.5 1.5 0 0 1 3 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
                 ${row.contact}
               </a>
               <a class="outlet-whatsapp" href="https://wa.me/${intl}" target="_blank" rel="noreferrer" aria-label="WhatsApp ${row.name}">
                 <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2a8 8 0 0 1 6.77 12.24l.87 2.64-2.72-.86A8 8 0 1 1 10 2Zm-1.92 4.1c-.14 0-.3.04-.44.2-.15.16-.57.55-.57 1.34s.58 1.55.66 1.66c.08.1 1.13 1.72 2.74 2.41.57.24 1.02.39 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.41-.57 1.61-1.13.2-.55.2-1.03.14-1.13-.06-.1-.21-.16-.45-.28-.24-.12-1.41-.69-1.63-.77-.21-.08-.37-.12-.52.12-.16.24-.61.77-.75.93-.14.16-.27.18-.51.06-.24-.12-1.02-.37-1.95-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24 0-.37.11-.49.1-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.74-.19-.45-.39-.39-.52-.4h-.45Z"/></svg>
                 WhatsApp
               </a>
             </div>`
          : '<span class="outlet-no-contact">—</span>';

        tableRow.innerHTML = `
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.location}</td>
          <td>${contactCell}</td>
        `;

        outletsBody.appendChild(tableRow);
      });
    }

    if (statusNode) {
      const showingFrom = total === 0 ? 0 : startIndex + 1;
      statusNode.textContent = `Showing ${showingFrom} to ${endIndex} of ${total} entries`;
    }

    renderPagination(totalPages);
  };

  searchInput?.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    currentPageIndex = 1;
    renderOutlets();
  });

  sizeSelect?.addEventListener("change", (event) => {
    perPage = Number(event.target.value || 16);
    currentPageIndex = 1;
    renderOutlets();
  });

  renderOutlets();
}

// ── Shop page ────────────────────────────────────────────────

if (document.querySelector(".shop-product-grid")) {
  const cart = []; // { id, name, size, price, qty }

  const fmtPrice = (n) => "UGX " + n.toLocaleString("en-UG");

  // Size button selection per card
  document.querySelectorAll(".shop-card").forEach((card) => {
    const sizeBtns = card.querySelectorAll(".size-btn");
    const priceEl = card.querySelector(".shop-price");

    sizeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        card.dataset.productPrice = btn.dataset.price;
        card.dataset.productName =
          card.querySelector("h3").textContent.trim() + " " + btn.dataset.size;
        if (priceEl) priceEl.textContent = fmtPrice(Number(btn.dataset.price));
      });
    });

    card.querySelector(".add-to-cart").addEventListener("click", () => {
      const activeBtn = card.querySelector(".size-btn.is-active");
      const id = card.dataset.productId + "-" + activeBtn.dataset.size;
      const name = card.querySelector("h3").textContent.trim();
      const size = activeBtn.dataset.size;
      const price = Number(activeBtn.dataset.price);
      const existing = cart.find((i) => i.id === id);
      if (existing) { existing.qty += 1; } else { cart.push({ id, name, size, price, qty: 1 }); }
      renderCart();
      document.getElementById("cart").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function renderCart() {
    const itemsEl = document.getElementById("cart-items");
    const countEl = document.getElementById("cart-count");
    const totalRowEl = document.getElementById("cart-total-row");
    const totalEl = document.getElementById("cart-total");

    if (!itemsEl) return;

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    countEl.textContent = totalQty + (totalQty === 1 ? " item" : " items");

    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add a product above.</p>';
      totalRowEl.hidden = true;
      return;
    }

    itemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-sub">${item.size} — ${fmtPrice(item.price)} each</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.qty}</span>
          <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item-price">${fmtPrice(item.price * item.qty)}</div>
        <button type="button" class="cart-remove" data-action="remove" aria-label="Remove ${item.name} from cart">✕</button>
      </div>`
      )
      .join("");

    // Qty / remove handlers
    itemsEl.querySelectorAll(".cart-item").forEach((row) => {
      const id = row.dataset.cartId;
      row.querySelector("[data-action='inc']").addEventListener("click", () => {
        const item = cart.find((i) => i.id === id);
        if (item) item.qty += 1;
        renderCart();
      });
      row.querySelector("[data-action='dec']").addEventListener("click", () => {
        const item = cart.find((i) => i.id === id);
        if (item) {
          item.qty -= 1;
          if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
        }
        renderCart();
      });
      row.querySelector("[data-action='remove']").addEventListener("click", () => {
        const idx = cart.findIndex((i) => i.id === id);
        if (idx > -1) cart.splice(idx, 1);
        renderCart();
      });
    });

    totalRowEl.hidden = false;
    totalEl.textContent = fmtPrice(totalPrice);
  }

  // Order form
  const orderForm = document.getElementById("order-form-el");

  if (orderForm) {
    const fields = {
      name: document.getElementById("order-name"),
      phone: document.getElementById("order-phone"),
      location: document.getElementById("order-location"),
    };

    const validate = () => {
      let valid = true;
      Object.entries(fields).forEach(([key, input]) => {
        const err = document.getElementById("error-" + key);
        if (!input.value.trim()) {
          input.classList.add("is-invalid");
          if (err) err.textContent = "This field is required.";
          valid = false;
        } else {
          input.classList.remove("is-invalid");
          if (err) err.textContent = "";
        }
      });
      return valid;
    };

    // Live clear errors
    Object.values(fields).forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
        const err = document.getElementById("error-" + input.id.replace("order-", ""));
        if (err) err.textContent = "";
      });
    });

    // Payment method handling
    const paymentRadios = orderForm.querySelectorAll("input[name='payment']");
    const submitBtn = document.getElementById("submit-order");
    const paymentNote = document.getElementById("payment-note");

    const paymentConfig = {
      whatsapp: {
        label: "Place Order via WhatsApp",
        note: "Your order will be sent to our sales team on WhatsApp. They will confirm and guide you on payment.",
        disabled: false,
      },
      mtn: {
        label: "Pay with MTN Mobile Money",
        note: "MTN Mobile Money payments are coming soon. Please select WhatsApp to order now.",
        disabled: true,
      },
      airtel: {
        label: "Pay with Airtel Money",
        note: "Airtel Money payments are coming soon. Please select WhatsApp to order now.",
        disabled: true,
      },
    };

    const applyPaymentState = (value) => {
      const config = paymentConfig[value] || paymentConfig.whatsapp;
      if (submitBtn) {
        submitBtn.textContent = config.label;
        submitBtn.disabled = config.disabled;
        submitBtn.style.opacity = config.disabled ? "0.5" : "";
        submitBtn.style.cursor = config.disabled ? "not-allowed" : "";
      }
      if (paymentNote) paymentNote.textContent = config.note;
    };

    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const config = paymentConfig[radio.value];
        if (config && config.disabled) {
          // Snap back to whatsapp — coming soon options are not selectable
          orderForm.querySelector("input[value='whatsapp']").checked = true;
          applyPaymentState("whatsapp");
          // Brief visual feedback on the card
          const card = radio.nextElementSibling;
          card.style.animation = "none";
          card.classList.add("is-disabled");
          setTimeout(() => card.classList.remove("is-disabled"), 1200);
        } else {
          applyPaymentState(radio.value);
        }
      });
    });

    // Init state
    applyPaymentState("whatsapp");

    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      if (!cart.length) {
        alert("Please add at least one product to your cart before ordering.");
        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
        return;
      }

      const name = fields.name.value.trim();
      const phone = fields.phone.value.trim();
      const location = fields.location.value.trim();
      const notes = document.getElementById("order-notes").value.trim();
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

      const lines = cart.map((i) => `• ${i.name} (${i.size}) x${i.qty} = ${fmtPrice(i.price * i.qty)}`);
      const msg = [
        "🛒 *New Order — Kaawa Mpologoma*",
        "",
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        `*Delivery/Pickup:* ${location}`,
        notes ? `*Notes:* ${notes}` : null,
        "",
        "*Items:*",
        ...lines,
        "",
        `*Total: ${fmtPrice(total)}*`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const summaryEl = document.getElementById("form-summary");
      const summaryItems = document.getElementById("form-summary-items");
      const summaryTotal = document.getElementById("form-summary-total");
      if (summaryEl) {
        summaryItems.innerHTML = lines.map((l) => `<p>${l}</p>`).join("");
        summaryTotal.textContent = fmtPrice(total);
        summaryEl.hidden = false;
      }

      const successEl = document.getElementById("form-success");
      if (successEl) successEl.hidden = false;

      window.open("https://wa.me/256778253810?text=" + encodeURIComponent(msg), "_blank");

      // Reset form and hide success after 5s
      setTimeout(() => {
        if (successEl) successEl.hidden = true;
        orderForm.reset();
        cart.length = 0;
        renderCart();
        if (summaryEl) summaryEl.hidden = true;
        applyPaymentState("whatsapp");
      }, 5000);
    });
  }
}
