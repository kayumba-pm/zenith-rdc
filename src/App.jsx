import { useEffect, useMemo, useState } from 'react'
import { categories, products } from './data/products'
import logo from './assets/images/logo.jpg'
import heroImage from './assets/images/hero.jpeg'
import './styles/store.css'

const PAYMENT_URL = 'https://pay.fondeka.com/p/J3NV4FRTS'
const WHATSAPP_NUMBER = '243903179957'

const formatPrice = (value) =>
  new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const buildWhatsAppLink = (name, phone, message) => {
  const text = `Bonjour, je suis ${name || 'un client'}${phone ? `, téléphone: ${phone}` : ''}. ${message || 'Je souhaite obtenir plus d’informations.'}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

const specialOffers = [
  {
    id: 4,
    title: 'Laptop Business',
    badge: 'OFFRE SPÉCIALE',
    description: 'Profitez de -15% sur les laptops professionnels pour vos équipes.',
    image: products[3].image,
    category: 'Laptops',
  },
  {
    id: 12,
    title: 'Pack Bureau Premium',
    badge: 'MEILLEUR CHOIX',
    description: 'Mobiles et postes de travail avec remise immédiate sur les packs.',
    image: products[11].image,
    category: 'Meubles',
  },
  {
    id: 8,
    title: 'Imprimantes & Accessoires',
    badge: 'PROMO FLASH',
    description: 'Bundle pratique pour les bureaux qui veulent gagner du temps.',
    image: products[7].image,
    category: 'Imprimantes',
  },
]

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('zenith-cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Impossible de charger le panier local:', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zenith-cart', JSON.stringify(cart))
  }, [cart])

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) =>
      [product.name, product.category, product.description, product.badge]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [search])

  const filteredProducts = useMemo(() => {
    const baseProducts = search ? searchResults : products

    if (selectedCategory === 'Tous') return baseProducts
    return baseProducts.filter((product) => product.category === selectedCategory)
  }, [selectedCategory, search, searchResults])

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []

    return products
      .filter((product) =>
        [product.name, product.category, product.badge]
          .join(' ')
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 5)
  }, [search])

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, direction) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) return item
          const nextQty = item.quantity + direction
          return nextQty > 0 ? { ...item, quantity: nextQty } : null
        })
        .filter(Boolean),
    )
  }

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const delivery = subtotal > 0 ? 25 : 0
  const total = subtotal + delivery

  const redirectToPayment = () => {
    window.open(PAYMENT_URL, '_blank', 'noopener,noreferrer')
  }

  const openCart = () => {
    setShowCart(true)
  }

  const closeCart = () => {
    setShowCart(false)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setSelectedCategory('Tous')
    document.getElementById('catalogue')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearch('')
    document.getElementById('catalogue')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleContactChange = (event) => {
    const { name, value } = event.target
    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleContactSubmit = (event) => {
    event.preventDefault()
    const contactLink = buildWhatsAppLink(contactForm.name, contactForm.phone, contactForm.message)
    window.open(contactLink, '_blank', 'noopener,noreferrer')
    setShowContact(false)
    setContactForm({ name: '', phone: '', message: '' })
  }

  return (
    <div className="store-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo-wrap">
            <img src={logo} alt="Logo STE. ZENITH INFO/RDC SARL" className="brand-logo" />
          </div>
          <div>
            <div className="brand-text">STE. ZENITH INFO/RDC SARL</div>
            <span className="brand-sub">Technologies & équipement</span>
          </div>
        </div>

        <div className="header-tools">
          <nav className="nav" aria-label="Navigation principale">
            <a href="#accueil">Accueil</a>
            <a href="#catalogue">Catalogue</a>
            <a href="#promos">Promos</a>
            <button type="button" className="nav-contact-btn" onClick={() => setShowContact(true)}>
              Contact
            </button>
          </nav>

          <form className="search-bar" onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
            />
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="search-suggestions" role="listbox" aria-label="Suggestions de recherche">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="search-suggestion"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setSearch(product.name)
                      setSelectedCategory('Tous')
                      setSearchFocused(false)
                      document.getElementById('catalogue')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }}
                  >
                    <span>{product.name}</span>
                    <small>{product.category}</small>
                  </button>
                ))}
              </div>
            )}
            <button type="submit">Rechercher</button>
          </form>
        </div>

        <button type="button" className="cart-button" aria-label="Voir le panier" onClick={openCart}>
          Panier
          <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </button>
      </header>

      {showCart && (
        <div className="cart-overlay" onClick={closeCart}>
          <aside className="cart-panel" aria-label="Panier d'achat" onClick={(event) => event.stopPropagation()}>
            <div className="cart-panel-header">
              <h3>Votre panier</h3>
              <button type="button" className="close-contact" onClick={closeCart}>×</button>
            </div>

            <div className="cart-list">
              {cart.length === 0 ? (
                <div className="cart-empty">Aucun article dans votre panier.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <h4>{item.name}</h4>
                      <small>{formatPrice(item.price)} / unité</small>
                      <div className="cart-controls">
                        <div className="qty-box">
                          <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        Supprimer
                      </button>
                    </div>
                    <div className="item-total">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="summary">
              <div className="summary-row">
                <span>Sous-total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Livraison</span>
                <strong>{formatPrice(delivery)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button type="button" className="checkout-btn" onClick={redirectToPayment}>
                Finaliser l’achat
              </button>
            </div>
          </aside>
        </div>
      )}

      <section className="special-offers-bar" aria-label="Offres spéciales">
        <div className="special-offers-header">
          <span className="kicker">Promotions</span>
          <h3>Des offres spéciales pour votre espace de travail</h3>
        </div>

        <div className="special-offers-grid">
          {specialOffers.map((offer) => (
            <button
              key={offer.id}
              type="button"
              className="special-offer-card"
              onClick={() => handleCategorySelect(offer.category)}
            >
              <img src={offer.image} alt={offer.title} />
              <div className="special-offer-content">
                <span className="special-offer-badge">{offer.badge}</span>
                <h4>{offer.title}</h4>
                <p>{offer.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {showContact && (
        <div className="contact-overlay" onClick={() => setShowContact(false)}>
          <div className="contact-modal" onClick={(event) => event.stopPropagation()}>
            <div className="contact-header">
              <h3>Contactez-nous</h3>
              <button type="button" className="close-contact" onClick={() => setShowContact(false)}>
                ×
              </button>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <label>
                Nom
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Votre nom"
                  required
                />
              </label>

              <label>
                Téléphone
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  placeholder="Votre numéro"
                />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Décrivez votre besoin..."
                  rows="4"
                  required
                />
              </label>

              <button type="submit" className="contact-submit">Envoyer via WhatsApp</button>
            </form>
          </div>
        </div>
      )}

      <main id="accueil">
        <section className="hero">
          <div className="hero-panel">
            <span className="kicker">Nouvelle collection</span>
            <h1>La qualité avant tout, la perfection au quotidien.</h1>
            <p className="hero-copy">
              Solutions informatiques, matériel bureautique, ordinateurs, imprimantes et accessoires
              pour les entreprises, les écoles, les bureaux et les particuliers.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#catalogue">Découvrir les produits</a>
              <button type="button" className="secondary-btn" onClick={() => setShowContact(true)}>
                Voir les promos
              </button>
            </div>

            <div className="hero-stat">
              <div>
                <strong>2.4k+</strong>
                <span>Clients</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Satisfaction</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>

          <aside className="highlight-card" aria-label="Produit vedette">
            <span className="badge-box">Produit vedette</span>
            <div className="showcase">
              <img src={heroImage} alt="Bannière principale" />
              <div className="showcase-label">
                <strong>Collection premium</strong>
                <span>Offres</span>
              </div>
            </div>
          </aside>
        </section>

        <div className="content" id="catalogue">
          <section className="catalog">
            <div className="section-heading">
              <h2>Catalogue produit</h2>
              <div className="filter-list" aria-label="Filtres de catégories">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="search-empty">
                  Aucun produit ne correspond à votre recherche.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <article key={product.id} className="product-card">
                    <div className="product-card-image">
                      <img src={product.image} alt={product.name} />
                      <span className="product-badge">{product.badge}</span>
                    </div>

                    <div className="product-row">
                      <div>
                        <h3>{product.name}</h3>
                        <span className="product-category">{product.category}</span>
                      </div>
                      <span className="product-price">{formatPrice(product.price)}</span>
                    </div>

                    <p>{product.description}</p>

                    <div className="product-meta">
                      <span className="rating">★ {product.rating}</span>
                      <span className="stock">{product.stock} en stock</span>
                    </div>

                    <div className="product-actions">
                      <button type="button" className="add-btn" onClick={() => addToCart(product)}>
                        Ajouter au panier
                      </button>
                      <button type="button" className="pay-btn" onClick={redirectToPayment}>
                        Payer
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      <footer id="contact" className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-logo-wrap footer-logo-wrap">
              <img src={logo} alt="Logo STE. ZENITH INFO/RDC SARL" className="brand-logo" />
            </div>
            <h3>STE. ZENITH INFO/RDC SARL</h3>
            <p>Solutions technologiques, équipement bureautique et matériel informatique pour entreprises et particuliers.</p>
          </div>

          <div className="footer-column">
            <h4>Adresse</h4>
            <p>Lubumbashi, République Démocratique du Congo</p>
            <p>Centre-ville, Lubumbashi</p>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <p>📞 +243 90 317 99 57</p>
            <p>📱 WhatsApp: +243 90 317 99 57</p>
            <p>✉️ contact@zenithinfo-rdc.com</p>
          </div>

          <div className="footer-column">
            <h4>Heures</h4>
            <p>Lun – Sam: 08h00 – 18h00</p>
            <p>Dimanche: Fermé</p>
          </div>

          <div className="footer-column">
            <h4>Réseaux sociaux</h4>
            <p><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></p>
            <p><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></p>
            <p><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
