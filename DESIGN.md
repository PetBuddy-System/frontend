---
name: PetBuddy
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db7'
  primary: '#004d99'
  on-primary: '#ffffff'
  primary-container: '#1565c0'
  on-primary-container: '#dae5ff'
  inverse-primary: '#a9c7ff'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#823800'
  on-tertiary: '#ffffff'
  tertiary-container: '#a84a00'
  on-tertiary-container: '#ffdece'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68f'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#773200'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
  stack-sm: 4px
  stack-md: 12px
---

## Brand & Style

The brand personality is vibrant, nurturing, and trustworthy, specifically tailored for dog owners who view their pets as family. The design system evokes a sense of "happy energy" through a bright, approachable aesthetic that balances professional pet care expertise with the playful nature of dogs.

The chosen style is **Corporate / Modern** with a **Soft, Tactile** edge. It uses clean, systematic layouts to ensure high usability for e-commerce, while incorporating organic shapes and friendly typography to remain warm and welcoming. Imagery should focus on "The Happy Tail"—high-quality photography of dogs in moments of joy, cleanliness (post-grooming), and health.

## Colors

The palette is derived from the core identity of professional pet care:
- **Primary (Blue):** Represents trust, hygiene, and the professional grooming services (Bathing, Haircutting).
- **Secondary (Gold):** Symbolizes premium quality, reward, and the "golden" joy of pet companionship.
- **Tertiary (Orange):** Evokes playfulness, toys, and energy.
- **Neutral:** A very light grey/white base keeps the interface clean and allows product photography to stand out.

Use the `sale-red` for flash sales and urgent discounts. The `cream-variant` is reserved for background accents in lifestyle sections to add warmth.

## Typography

This design system uses **Plus Jakarta Sans** for headings to provide a friendly, modern, and slightly rounded geometric feel. **Be Vietnam Pro** is used for body text to ensure maximum legibility for product descriptions and service details, especially for the Vietnamese language context.

Hierarchies are strictly enforced to separate product titles from pricing. Prices should always use the `price-display` style to ensure they are the second most visible element on a product card after the image.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **E-commerce Density:** Product grids should use a 24px gutter to provide breathing room between items.
- **Service Sections:** Sections for Bathing and Grooming services should use wider margins and higher vertical "section-gap" (80px) to feel premium and distinct from the high-density product catalog.
- **Mobile Navigation:** A fixed bottom navigation bar is required for quick access to the Cart, Account, and Zalo support, reflecting the high-touch service nature of the brand.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**. 

1.  **Base Layer:** The `neutral-color` (#f8f9fa) background.
2.  **Surface Layer:** Product cards and service blocks use white (#FFFFFF) backgrounds with a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to suggest they are interactable.
3.  **Floating Layer:** CTAs and sticky navigation use a slightly more pronounced shadow to appear "raised" above the content.

Avoid heavy borders; use subtle 1px outlines in a light grey only when components sit on a white background to maintain definition.

## Shapes

The shape language is **Rounded**, mirroring the soft, friendly nature of pets. 
- **Standard UI (Inputs, Small Buttons):** 0.5rem (8px).
- **Cards & Banners:** 1rem (16px) to create a "container" feel.
- **Interactive Pill Elements:** Categories and Chips should use the full pill shape (rounded-xl) for a tactile, "clickable" look.

## Components

### Buttons
- **Primary:** Solid `primary-color` with white text. High contrast for "Add to Cart" or "Book Service."
- **Secondary:** Outlined `primary-color` for secondary actions like "View Details."
- **Tertiary:** Solid `tertiary-color` specifically for promotional CTAs or "Flash Sale" buttons.

### Product Cards
Must include a square image container with a 16px radius, the product title in `headline-md`, the price in `price-display`, and a secondary "Buy" button. Use a badge in the top-left corner for "Sale" or "New" status.

### Service Blocks (Grooming/Bathing)
Use a horizontal layout on desktop with a large lifestyle image on one side and a list of inclusions on the other. Include a "Book Now" button that links directly to a Zalo/WhatsApp contact.

### Category Chips
Small, rounded-xl pills used for filtering (e.g., "Dog Food", "Toys", "Accessories"). Active states should use the `secondary-color` (Gold) to indicate selection.

### Contact Sticky
A persistent floating button for Zalo/Phone support, utilizing the `zalo-blue` to maintain platform familiarity.