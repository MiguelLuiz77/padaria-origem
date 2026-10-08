(function () {
  'use strict';

  window.ORIGEM_WHATSAPP_NUMBER = '5512988491334';
  const WHATSAPP_NUMBER = window.ORIGEM_WHATSAPP_NUMBER;
  const CART_KEY = 'origem-cart-v1';
  const ORDERS_KEY = 'origem-orders-v1';
  const products = [
    { id: 'cesta-fornada', name: 'Seleção da fornada', category: 'paes', categoryLabel: 'Seleção da casa', description: 'Uma escolha generosa para levar um pouco de cada fornada.', price: 58, image: 'assets/colecao-da-fornada.jpg', alt: 'Seleção de pães e viennoiseries artesanais sobre uma mesa de madeira', position: '76% center' },
    { id: 'pao-natural', name: 'Pão de fermentação natural', category: 'paes', categoryLabel: 'Pães artesanais', description: 'Casca dourada, miolo macio e sabor para apreciar sem pressa.', price: 28, image: 'assets/pao-fermentacao-natural.jpg', alt: 'Pão rústico de fermentação natural sobre uma mesa de madeira', position: 'center' },
    { id: 'pao-graos', name: 'Pão de grãos', category: 'paes', categoryLabel: 'Pães artesanais', description: 'Uma fornada cheia de textura para acompanhar o seu dia.', price: 27, image: 'assets/pao-de-graos.jpg', alt: 'Pão artesanal de grãos com sementes e fatias cortadas', position: 'center' },
    { id: 'rosca-casa', name: 'Rosca da casa', category: 'doces', categoryLabel: 'Da vitrine', description: 'Massa macia e cobertura delicada, com gostinho de encontro.', price: 24, image: 'assets/rosca-da-casa.jpg', alt: 'Rosca artesanal coberta com uma camada cremosa e lascas douradas', position: 'center' },
    { id: 'bolo-chocolate', name: 'Bolo de chocolate', category: 'doces', categoryLabel: 'Da vitrine', description: 'Bolo macio com cobertura generosa para dividir à mesa.', price: 42, image: 'assets/bolo-de-chocolate.jpg', alt: 'Bolo de chocolate com cobertura brilhante em um suporte de confeitaria', position: 'center' },
    { id: 'pao-queijo', name: 'Pão de queijo', category: 'paes', categoryLabel: 'Da fornada', description: 'Uma porção douradinha para os intervalos do dia.', price: 18, image: 'assets/pao-de-queijo.jpg', alt: 'Pãezinhos dourados servidos em uma tigela de cerâmica', position: 'center' },
    { id: 'baguete', name: 'Baguete artesanal', category: 'paes', categoryLabel: 'Pães artesanais', description: 'Casca crocante e miolo leve para compartilhar.', price: 18, image: 'assets/baguete-artesanal.jpg', alt: 'Baguetes artesanais polvilhadas com farinha em uma cesta rústica', position: 'center' },
    { id: 'croissant', name: 'Croissant da casa', category: 'doces', categoryLabel: 'Da vitrine', description: 'Camadas delicadas e douradas para a pausa do café.', price: 16, image: 'assets/croissant-da-casa.jpg', alt: 'Croissant artesanal dourado ao lado de uma xícara de café', position: 'center' },
    { id: 'cafe-croissant', name: 'Café & croissant', category: 'cafe', categoryLabel: 'Café & combinações', description: 'Um café passado e um croissant para aproveitar o momento.', price: 25, image: 'assets/combo-cafe-croissant.png', alt: 'Café servido com um croissant artesanal sobre uma tábua de madeira', position: 'center' },
    { id: 'pao-leite', name: 'Pãezinhos de leite', category: 'paes', categoryLabel: 'Pães artesanais', description: 'Pãezinhos macios para dividir ou guardar para depois.', price: 22, image: 'assets/paes-de-leite.jpg', alt: 'Pãezinhos artesanais dourados empilhados em uma cesta', position: 'center' }
  ];

  const productById = new Map(products.map(function (product) { return [product.id, product]; }));
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const productGrid = document.querySelector('#product-grid');
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartBackdrop = document.querySelector('[data-cart-backdrop]');
  const cartItems = document.querySelector('[data-cart-items]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartFooter = document.querySelector('[data-cart-footer]');
  const checkoutButton = document.querySelector('[data-checkout]');
  const toast = document.querySelector('[data-toast]');
  let cart = readObject(CART_KEY);
  let orders = readArray(ORDERS_KEY);
  let activeFilter = 'todos';
  let previousFocus = null;
  let toastTimer = null;

  cart = sanitizeCart(cart);
  orders = orders.slice(0, 12);

  function readObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) {
      return {};
    }
  }

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function sanitizeCart(value) {
    const clean = {};
    Object.keys(value).forEach(function (id) {
      const quantity = Number(value[id]);
      if (productById.has(id) && Number.isFinite(quantity) && quantity > 0) {
        clean[id] = Math.min(99, Math.floor(quantity));
      }
    });
    return clean;
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (error) { /* A sessão continua funcional sem armazenamento persistente. */ }
  }

  function saveOrders() {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 12)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function cartQuantity() {
    return Object.values(cart).reduce(function (sum, quantity) { return sum + quantity; }, 0);
  }

  function cartTotal() {
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + productById.get(id).price * cart[id];
    }, 0);
  }

  function whatsappUrl(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function formatWhatsAppNumber() {
    const match = WHATSAPP_NUMBER.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    return match ? '+55 ' + match[1] + ' ' + match[2] + '-' + match[3] : '+' + WHATSAPP_NUMBER;
  }

  function initializeWhatsAppLinks() {
    document.querySelectorAll('[data-whatsapp-message]').forEach(function (link) {
      link.href = whatsappUrl(link.dataset.whatsappMessage);
    });
    document.querySelectorAll('[data-whatsapp-display]').forEach(function (element) {
      element.textContent = formatWhatsAppNumber();
    });
  }

  function productCard(product, index) {
    const directMessage = 'Ol\u00e1! Vim pelo site da Padaria Origem e gostaria de pedir ' + product.name + '.';
    const directUrl = whatsappUrl(directMessage);
    return '<article class="product-card" data-category="' + product.category + '" style="animation-delay:' + (index % 4) * 45 + 'ms">' +
      '<div class="product-media"><img src="' + product.image + '" alt="' + product.alt + '" loading="lazy" decoding="async" style="object-position:' + product.position + '"><span class="product-category">' + product.categoryLabel + '</span></div>' +
      '<div class="product-body"><h3 class="product-name">' + product.name + '</h3><p class="product-description">' + product.description + '</p>' +
      '<div class="product-price-row"><span class="product-price">' + money.format(product.price) + '</span><button class="add-to-cart" type="button" data-add="' + product.id + '" aria-label="Adicionar ' + product.name + ' à sacola"><svg class="icon"><use href="#icon-plus"></use></svg> Sacola</button></div>' +
      '<a class="button product-whatsapp" href="' + directUrl + '" target="_blank" rel="noopener noreferrer"><svg class="icon"><use href="#icon-whatsapp"></use></svg> Pedir pelo WhatsApp</a></div></article>';
  }

  function renderProducts() {
    const filtered = activeFilter === 'todos' ? products : products.filter(function (product) { return product.category === activeFilter; });
    productGrid.innerHTML = filtered.length ? filtered.map(productCard).join('') : '<p class="catalog-empty">Nenhum produto encontrado nesta seleção.</p>';
  }

  function renderCart() {
    const quantity = cartQuantity();
    document.querySelectorAll('[data-cart-count]').forEach(function (badge) {
      badge.textContent = String(quantity);
      badge.setAttribute('aria-label', quantity + (quantity === 1 ? ' item no carrinho' : ' itens no carrinho'));
    });
    const drawerCount = document.querySelector('[data-drawer-count]');
    drawerCount.textContent = quantity ? '(' + quantity + ')' : '';
    document.querySelector('[data-cart-total]').textContent = money.format(cartTotal());
    cartEmpty.classList.toggle('is-visible', quantity === 0);
    cartItems.hidden = quantity === 0;
    cartFooter.classList.toggle('is-hidden', quantity === 0);
    checkoutButton.disabled = quantity === 0;

    const rows = Object.keys(cart).filter(function (id) { return productById.has(id); });
    cartItems.innerHTML = rows.map(function (id) {
      const product = productById.get(id);
      const count = cart[id];
      return '<article class="cart-item" data-cart-row="' + id + '">' +
        '<img class="cart-item-image" src="' + product.image + '" alt="" loading="lazy">' +
        '<div class="cart-item-main"><h3>' + product.name + '</h3><span>' + money.format(product.price) + ' / unidade</span>' +
        '<div class="quantity-stepper" aria-label="Quantidade de ' + product.name + '"><button type="button" data-change="-1" data-id="' + id + '" aria-label="Diminuir quantidade">−</button><span>' + count + '</span><button type="button" data-change="1" data-id="' + id + '" aria-label="Aumentar quantidade">+</button></div></div>' +
        '<div class="cart-item-end"><strong>' + money.format(product.price * count) + '</strong><button class="remove-item" type="button" data-remove="' + id + '">Remover</button></div></article>';
    }).join('');
    renderOrderHistory();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function renderOrderHistory() {
    document.querySelector('[data-order-count]').textContent = String(orders.length);
    const history = document.querySelector('[data-order-history-list]');
    if (!orders.length) {
      history.innerHTML = '<p class="history-entry">Seus pedidos enviados aparecerão aqui.</p>';
      return;
    }
    history.innerHTML = orders.map(function (order) {
      const date = new Date(order.createdAt);
      const when = Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const lines = Array.isArray(order.items) ? order.items.map(function (item) {
        return escapeHtml(item.quantity) + ' × ' + escapeHtml(item.name);
      }).join(' · ') : '';
      return '<div class="history-entry"><strong>Pedido ' + escapeHtml(order.id || '') + ' · ' + escapeHtml(when) + '</strong><span>' + lines + '</span><br><span>Total estimado: ' + escapeHtml(money.format(Number(order.total) || 0)) + ' · enviado ao WhatsApp</span></div>';
    }).join('');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2800);
  }

  function addProduct(id) {
    if (!productById.has(id)) return;
    cart[id] = Math.min(99, (cart[id] || 0) + 1);
    saveCart();
    renderCart();
    showToast(productById.get(id).name + ' adicionado à sacola.');
  }

  function openCart() {
    previousFocus = document.activeElement;
    cartDrawer.hidden = false;
    cartBackdrop.hidden = false;
    document.body.classList.add('cart-open');
    window.setTimeout(function () { document.querySelector('[data-close-cart]').focus(); }, 0);
  }

  function closeCart() {
    cartDrawer.hidden = true;
    cartBackdrop.hidden = true;
    document.body.classList.remove('cart-open');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  function changeQuantity(id, difference) {
    if (!cart[id]) return;
    const next = cart[id] + difference;
    if (next < 1) delete cart[id];
    else cart[id] = Math.min(99, next);
    saveCart();
    renderCart();
  }

  function buildOrderMessage(orderId, items, total) {
    const lines = items.map(function (item) {
      return '• ' + item.quantity + 'x ' + item.name + ' — ' + money.format(item.price * item.quantity);
    });
    return 'Olá, Origem! Vim pelo site e gostaria de fazer este pedido:\n\n' + lines.join('\n') + '\n\nTotal estimado: ' + money.format(total) + '\nPedido: ' + orderId + '\n\nComo podemos combinar?';
  }

  function sendCartToWhatsApp() {
    const items = Object.keys(cart).map(function (id) {
      const product = productById.get(id);
      return { id: id, name: product.name, price: product.price, quantity: cart[id] };
    }).filter(function (item) { return item.quantity > 0; });
    if (!items.length) return;

    const total = items.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
    const orderId = 'OR-' + Date.now().toString().slice(-7);
    const order = { id: orderId, createdAt: new Date().toISOString(), items: items, total: total };
    orders.unshift(order);
    orders = orders.slice(0, 12);
    const saved = saveOrders();
    const message = buildOrderMessage(orderId, items, total);
    const url = whatsappUrl(message);
    cart = {};
    saveCart();
    renderCart();

    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else window.location.assign(url);
    if (saved) {
      document.querySelector('[data-cart-status]').textContent = 'Pedido ' + orderId + ' registrado neste dispositivo.';
    }
    showToast(saved ? 'Pedido registrado. Abrindo o WhatsApp…' : 'Abrindo o WhatsApp com os itens do seu pedido…');
  }

  initializeWhatsAppLinks();
  renderProducts();
  renderCart();
  document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

  document.addEventListener('click', function (event) {
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      activeFilter = filterButton.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(function (button) {
        const selected = button === filterButton;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      renderProducts();
      return;
    }

    const addButton = event.target.closest('[data-add]');
    if (addButton) { addProduct(addButton.dataset.add); return; }

    const openButton = event.target.closest('[data-open-cart]');
    if (openButton) { openCart(); return; }

    if (event.target.closest('[data-close-cart]')) { closeCart(); return; }
    if (event.target === cartBackdrop) { closeCart(); return; }

    if (event.target.closest('[data-close-cart-and-shop]')) {
      closeCart();
      document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const changeButton = event.target.closest('[data-change]');
    if (changeButton) { changeQuantity(changeButton.dataset.id, Number(changeButton.dataset.change)); return; }

    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      delete cart[removeButton.dataset.remove];
      saveCart();
      renderCart();
      return;
    }

    if (event.target.closest('[data-clear-cart]')) {
      cart = {};
      saveCart();
      renderCart();
      return;
    }

    if (event.target.closest('[data-checkout]')) { sendCartToWhatsApp(); return; }

    const menuToggle = event.target.closest('[data-menu-toggle]');
    if (menuToggle) {
      const nav = document.querySelector('[data-nav]');
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menuToggle.innerHTML = '<svg class="icon"><use href="#' + (open ? 'icon-close' : 'icon-menu') + '"></use></svg>';
      nav.classList.toggle('is-open', open);
      return;
    }

    if (event.target.closest('[data-nav] a')) {
      const nav = document.querySelector('[data-nav]');
      const toggle = document.querySelector('[data-menu-toggle]');
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.innerHTML = '<svg class="icon"><use href="#icon-menu"></use></svg>';
      return;
    }

  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !cartDrawer.hidden) closeCart();
    if (event.key === 'Escape') {
      const nav = document.querySelector('[data-nav]');
      const toggle = document.querySelector('[data-menu-toggle]');
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.innerHTML = '<svg class="icon"><use href="#icon-menu"></use></svg>';
    }
  });

  const header = document.querySelector('.site-header');
  function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 36); }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());
