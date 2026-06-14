export interface SeoProductData {
  displayName: string;
  seoTitle: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  ogImage?: string; // Optional per-product OG image override
  useCases: string[];
  whyBuy: string[];
  faqs: { question: string; answer: string }[];
}

export const PRODUCT_SEO_DATA: Record<string, SeoProductData> = {
  "lunar-wooden-3d-moon-lamp": {
    displayName: "Lunar 3D Moon Lamp",
    seoTitle: "Vurlo 3D Moon Lamp – Aesthetic Ambient Night Light for Bedroom Decor",
    metaTitle: "3D Moon Lamp with Wooden Base – Ambient Bedroom Night Light | Vurlo",
    metaDescription:
      "Buy Vurlo 3D Lunar Moon Lamp with wooden base. Adjustable warm & cool light modes, perfect ambient lighting for bedroom decor and aesthetic setups in India. Free shipping.",
    description:
      "Transform your room into a serene glowing sanctuary with the Vurlo 3D Lunar Moon Lamp. Advanced 3D printing technology replicates the actual craters and topography of the lunar surface in stunning detail. Resting on a premium solid wooden base, it adds an organic touch of aesthetic room decor to any nightstand, study desk, or corner table. Toggle between a cool white glow and warm yellow illumination to match any mood — perfect for winding down, meditating, or setting a cozy night vibe. A standout piece of ambient bedroom lighting and an ideal gift for space lovers across India.",
    useCases: [
      "Bedside ambient lighting for nightly relaxation and sleep preparation",
      "Cozy reading nook accent lamp to reduce eye strain",
      "Meditation or yoga space calming atmosphere backdrop",
    ],
    whyBuy: [
      "Realistic 3D textured detailing mimicking actual moon topography",
      "Premium solid natural wooden stand for an organic aesthetic touch",
      "Dual-color adjustable light control — warm yellow and cool white",
    ],
    faqs: [
      {
        question: "Does the moon lamp have multiple colors?",
        answer:
          "Yes, you can toggle between warm yellow and cool white tones to suit your room's vibe.",
      },
      {
        question: "How is the lamp powered?",
        answer:
          "It is USB powered for maximum convenience — compatible with phone chargers or laptops.",
      },
      {
        question: "Is the wooden stand included in the package?",
        answer:
          "Yes, each moon lamp comes with a high-quality, easy-to-assemble solid wooden stand.",
      },
    ],
  },

  "panda-glow-lamp": {
    displayName: "Panda Night Lamp",
    seoTitle: "Vurlo Panda Night Lamp – Cute LED Ambient Light for Bedroom Decor & Kids",
    metaTitle: "Panda Night Lamp – Cute Soft LED Ambient Light for Bedroom | Vurlo",
    metaDescription:
      "Shop Vurlo Cute Panda Night Lamp. BPA-free silicone, tap-to-change colors, rechargeable — ideal ambient bedroom decor and aesthetic lighting for kids in India.",
    description:
      "Bring warm, cute, calming energy into your bedroom or nursery with the Vurlo Cute Panda Night Lamp. Crafted from high-quality BPA-free soft silicone, this adorable panda night light is gentle to touch, squeezeable, and completely child-safe. Tap the silicone body to cycle through a variety of RGB lighting modes, creating a soothing ambient room light tailored to your evening. The built-in rechargeable battery gives up to 10 hours of wireless cordless illumination — no cables needed. A charming bedroom decor accent and a top-selling aesthetic gift in India.",
    useCases: [
      "Nursery or kids room soothing nighttime sleeping companion",
      "Bedside table cute ambient decor accent light",
      "Playful study desk character RGB lighting piece",
    ],
    whyBuy: [
      "Safe, eco-friendly BPA-free soft silicone build",
      "Intuitive tap-sensitive color changing touch control",
      "Long-lasting rechargeable battery for wireless portability",
    ],
    faqs: [
      {
        question: "How do you change colors on the panda lamp?",
        answer:
          "Simply tap the soft silicone body to toggle between warm white, rotating color modes, and individual static colors.",
      },
      {
        question: "Is the material safe for children?",
        answer:
          "Absolutely — BPA-free soft silicone that stays completely cool to the touch.",
      },
      {
        question: "How long does the battery last on a single charge?",
        answer:
          "The built-in rechargeable battery provides up to 10 hours of warm white night light on a full charge.",
      },
    ],
  },

  "mistflow-ambient-humidifier-lamp": {
    displayName: "MistFlow Humidifier Lamp",
    seoTitle: "Vurlo MistFlow Humidifier Lamp – 2-in-1 Cool Mist & Ambient Desk Light",
    metaTitle: "Desk Humidifier with Ambient Lamp – Cool Mist Office Decor Light | Vurlo",
    metaDescription:
      "Buy Vurlo MistFlow humidifier lamp. Silent cool mist + soft ambient glow for desk setups and bedrooms. Premium aesthetic room decor with auto-shutoff in India.",
    description:
      "Transform your workspace or bedroom into a peaceful sanctuary with the Vurlo MistFlow Humidifier Lamp. This 2-in-1 device combines fine cool mist with soft ambient lighting — elevating air quality and aesthetic vibe simultaneously. Operating silently under 30dB, it ensures your focus, reading, or sleep is never disturbed. The sleek minimalist design makes it a premium decor piece even when switched off. Adds essential moisture to dry rooms while casting a warm relaxing glow. The ideal fusion of functional wellness and modern ambient room decor for setups across India.",
    useCases: [
      "Desk setup humidifier improving focus and workspace comfort",
      "Bedroom ambient night light easing dry throat and supporting sleep",
      "Aromatherapy companion dispersing water-soluble essential oil mist",
    ],
    whyBuy: [
      "Dual-function design delivering both humidification and soft ambient glow",
      "Ultra-silent misting below 30dB for peaceful nights and focus sessions",
      "Intelligent water-less auto-shutoff for complete device protection",
    ],
    faqs: [
      {
        question: "Can I use essential oils with the MistFlow humidifier?",
        answer:
          "Yes, add a few drops of water-soluble essential oils into the water tank for relaxing aromatherapy.",
      },
      {
        question: "How often do I need to refill the water tank?",
        answer:
          "The tank holds enough water for up to 6 hours of continuous misting per fill.",
      },
      {
        question: "Does it turn off automatically when empty?",
        answer:
          "Yes, it features an intelligent auto-shutoff system to protect the device from damage.",
      },
    ],
  },

  "sunset-glow-projection-lamp": {
    displayName: "Sunset Projection Lamp",
    seoTitle: "Vurlo Sunset Lamp – RGB Projection Ambient Light for Gaming Setup & Bedroom",
    metaTitle: "Sunset Projection Lamp – RGB Ambient Light for Gaming Setup & Bedroom Decor | Vurlo",
    metaDescription:
      "Shop Vurlo Sunset Projection Lamp. Viral RGB sunset light with HD crystal lens and 360° rotation — perfect for gaming setup, bedroom decor & photography in India.",
    description:
      "Bring warm golden hues of a beautiful sunset directly into your space with the Vurlo Sunset Projection Lamp. A viral sensation across TikTok and Instagram, this projection lamp is a must-have for content creators, photographers, and anyone building an aesthetic room decor setup. It projects a realistic sunset halo on walls or ceiling, casting a warm calming glow that instantly transforms the vibe. Built with a heavy-duty aluminum base and high-definition crystal lens, it offers 360-degree rotation to perfectly adjust the projection. Ideal for gaming setups, bedroom lighting, and artistic photography backdrops in India.",
    useCases: [
      "Background aesthetic projection for TikTok videos and photography",
      "Cozy gaming setup mood lighting or media room RGB glow",
      "Warm golden hour vibes for bedrooms and living spaces",
    ],
    whyBuy: [
      "High-definition crystal lens for ultra-vibrant sharp projections",
      "Flexible 360-degree rotating head controlling halo angle and size",
      "Heavy-duty aluminum construction with durable stable base",
    ],
    faqs: [
      {
        question: "Can I adjust the size of the projected sunset circle?",
        answer:
          "Yes — move the lamp further from the wall to enlarge the projection, or closer to shrink it.",
      },
      {
        question: "How flexible is the lamp head rotation?",
        answer:
          "The head rotates 180° vertically and 360° horizontally — project on ceilings, floors, or walls.",
      },
      {
        question: "Is it powered by USB?",
        answer:
          "Yes, a USB cable with an inline on/off switch is included — compatible with power banks and adapters.",
      },
    ],
  },

  "orbit-galaxy-projector": {
    displayName: "Galaxy Projector Lamp",
    seoTitle: "Vurlo Orbit Galaxy Projector – Nebula Night Light for Gaming Setup & Bedroom",
    metaTitle: "Galaxy Projector – Starry Nebula Night Light for Gaming Room & Bedroom | Vurlo",
    metaDescription:
      "Buy Vurlo Orbit Galaxy Projector. Smart nebula & laser star projector ideal for gaming setups, bedroom decor, and home theaters. Remote control included. Free shipping India.",
    description:
      "Escape reality and enter your own cosmic sky with the Vurlo Orbit Galaxy Projector. This smart nebula room light projects HD moving nebula clouds and laser stars across your walls and ceiling. Customize RGB lighting colors, rotation speed, and brightness to create a relaxing cosmic atmosphere for sleep, gaming, or parties. The sleek futuristic design fits perfectly in gaming setups, bedrooms, and home theaters. Comes with wireless remote for effortless control. The ultimate ambient lighting upgrade for aesthetic room decor in India.",
    useCases: [
      "Cosmic starry ceiling projection for relaxing bedtime routines",
      "Immersive gaming room setup and streaming background RGB lights",
      "Home theater ambient lighting or party mood accent",
    ],
    whyBuy: [
      "Customizable RGB color blending modes for unique nebula projections",
      "Realistic moving clouds combined with sparkling green laser stars",
      "Wireless remote to adjust brightness, speed, and star patterns",
    ],
    faqs: [
      {
        question: "Can I turn off stars and keep only the nebula clouds?",
        answer:
          "Yes, the remote allows independent toggling of laser stars and moving nebula clouds.",
      },
      {
        question: "Does it have a sleep timer?",
        answer:
          "Yes, a built-in auto-off timer (1 or 2 hours) lets you fall asleep under the stars safely.",
      },
      {
        question: "How do I control the nebula rotation speed?",
        answer:
          "The remote has dedicated speed buttons to increase, decrease, or freeze nebula movement.",
      },
    ],
  },

  "aquawave-projector-lamp": {
    displayName: "AquaWave Projector Lamp",
    seoTitle: "Vurlo AquaWave Projector Lamp – Ocean Wave RGB Ambient Light for Bedroom Decor",
    metaTitle: "Ocean Wave Projector Lamp – Kinetic RGB Ambient Light for Bedroom | Vurlo",
    metaDescription:
      "Shop Vurlo AquaWave ocean wave projector lamp. Dynamic ripple effects with RGB colors on crystal acrylic + wooden base — ideal for bedroom decor and gaming setups in India.",
    description:
      "Experience the serene tranquility of moving water with the Vurlo AquaWave Projector Lamp. This premium ocean ripple LED light casts organic fluid wave effects across your walls, mimicking the calming motion of underwater currents. Crafted with a premium crystal acrylic shade and natural wooden base, it looks stunningly elegant as decor even when off. Multiple RGB lighting color modes shift the atmosphere from warm relaxation tones to vibrant ocean blues or sunset purples. Designed for bedroom ambient lighting, gaming desk backdrops, and sensory relaxation rooms — a uniquely calming aesthetic addition for setups in India.",
    useCases: [
      "Bedroom calming night light mimicking gentle underwater wave motion",
      "Gaming desk ambient RGB backdrop or setup accent",
      "Sensory relaxation or meditation room calming light",
    ],
    whyBuy: [
      "Mesmerizing moving water ripple projection via internal motor",
      "Premium faceted crystal acrylic shade on a natural wooden base",
      "Multiple RGB color schemes and rotation speeds for full mood customization",
    ],
    faqs: [
      {
        question: "Does the ripple effect actually move?",
        answer:
          "Yes — an internal motor rotates the LED core, projecting fluid organic water ripples that move smoothly.",
      },
      {
        question: "Is it bright enough to illuminate a full room?",
        answer:
          "It projects a wide bright wash of wave patterns that easily covers a medium-sized bedroom ceiling and walls.",
      },
      {
        question: "Can I pause the ripple rotation?",
        answer:
          "Yes, use the remote to pause rotation and enjoy a static crystal light pattern.",
      },
    ],
  },

  "aura-rgb-led-strip-lights": {
    displayName: "RGB LED Strip Lights",
    seoTitle: "Vurlo Aura RGB LED Strip Lights – Smart Ambient Backlighting for Gaming Setup",
    metaTitle: "RGB LED Strip Lights – Smart Ambient Gaming Setup Backlighting | Vurlo",
    metaDescription:
      "Buy Vurlo Aura RGB LED strip lights. 3.5m smart glow kit with sound-sync, self-adhesive mount — perfect for desk backlighting and gaming setup ambient lighting in India.",
    description:
      "Upgrade your entire room with vibrant customizable glow using the Vurlo Aura RGB LED Strip Lights. Spanning 3.5 meters, this smart room glow kit is perfect for outlining desks, TV backs, beds, or ceilings. Millions of RGB colors and dynamic lighting modes let you set the perfect ambiance for movies, gaming sessions, or late-night reading. Self-adhesive backing allows quick tool-free installation on any dry flat surface — trim to your exact measurement with ease. A sound-sensitive microphone syncs the LEDs to your music or game audio in real time. The essential base layer for any modern gaming setup or aesthetic bedroom decor in India.",
    useCases: [
      "Gaming desk backlighting and immersive RGB setup accent",
      "Bedroom under-bed mood glow or ceiling outline ambient light",
      "TV backlighting reducing eye strain and improving contrast",
    ],
    whyBuy: [
      "Generous 3.5-meter length of high-density bright RGB LEDs",
      "Strong self-adhesive backing for simple tool-free installation",
      "Built-in sound-sync microphone for music-reactive pulsing modes",
    ],
    faqs: [
      {
        question: "Can these LED strip lights be cut to size?",
        answer:
          "Yes — marked copper cutting lines along the strip let you safely cut to your exact desired length.",
      },
      {
        question: "How do I mount the strip lights?",
        answer:
          "Peel the protective film to expose the strong double-sided adhesive, then press onto any clean dry surface.",
      },
      {
        question: "Do they sync with music or game audio?",
        answer:
          "Yes — the built-in high-sensitivity microphone detects sound and pulses colors in real-time sync.",
      },
    ],
  },

  "crystal-aura-lamp": {
    displayName: "Crystal Aura Lamp",
    seoTitle: "Vurlo Crystal Aura Lamp – 3D Laser Engraved Glass Ball Ambient Night Light",
    metaTitle: "3D Crystal Ball Night Lamp – Laser Engraved Ambient Bedroom Decor | Vurlo",
    metaDescription:
      "Shop Vurlo Crystal Aura Lamp. Solid glass sphere with 3D laser engravings and warm LED wooden base — stunning ambient bedroom lighting and aesthetic desk decor in India.",
    description:
      "Elevate your setup with the mystical elegance of the Vurlo Crystal Aura Lamp. A heavy solid glass sphere with high-precision 3D laser engraving inside projects a beautiful ambient lighting pattern that illuminates the cosmic design within. Resting on a minimalist natural wood base with warm LED light, the glow refracts through the crystal to create a stunning ceiling pattern. Available in Saturn, Moon, and Galaxy engravings. Perfect for bedside ambient lighting, aesthetic desk decor, and premium gifting in India. A piece that functions as a night light and a luxury ornament simultaneously.",
    useCases: [
      "Bedside table ornament or calming ambient bedroom night light",
      "Aesthetic desk setup focal point or shelf styling accessory",
      "Cosmic themed room decor or creative photography prop",
    ],
    whyBuy: [
      "High-precision 3D internal laser engraving — Saturn, Moon, or Galaxy themes",
      "Solid heavy crystal glass sphere for supreme optical clarity",
      "Natural warm-glow wooden base complementing modern room decor",
    ],
    faqs: [
      {
        question: "What designs are engraved inside the crystal glass?",
        answer:
          "Saturn rings, floating astronauts, or moving galaxies — each with incredible internal 3D depth.",
      },
      {
        question: "Does the wooden base get hot?",
        answer:
          "No — energy-efficient cool LEDs mean the base stays completely cold even after hours of use.",
      },
      {
        question: "What powers the lamp?",
        answer:
          "A standard USB cable — plug into any USB adapter, computer port, or power bank.",
      },
    ],
  },

  "infinity-bloom-lamp": {
    displayName: "Infinity Bloom Lamp",
    seoTitle: "Vurlo Infinity Bloom Lamp – Tulip Night Light | Rectangle, Cloud & Glass Dome",
    metaTitle: "Tulip Infinity Mirror & Dome Lamp – 3 Shapes | Handcrafted Bedroom Decor | Vurlo",
    metaDescription:
      "Buy Vurlo Infinity Bloom Lamp in Rectangle, Cloud, or Glass Dome. Handcrafted glowing tulips, warm LED glow, perfect aesthetic room decor and gift in India. ₹499 onwards.",
    description:
      "Three shapes, one magical lamp. The Infinity Bloom Lamp comes in Rectangle (classic infinity mirror cube that doubles as a vanity mirror), Cloud (cloud-shaped frame with endless tulip reflection inside), and Glass Dome (premium glass globe terrarium with natural wood base and crystal pebbles). All three feature handcrafted glowing tulips, warm LED ambient light, and USB power. Pick your favourite shape and bring a dreamy floral glow to any room.",
    useCases: [
      "Bedroom nightstand warm ambient flower lamp",
      "Cozy vanity table mirror and decorative desk light (Rectangle)",
      "Dreamy shelf, window sill, or bookcase decor (Cloud & Dome)",
      "Premium gift for birthdays, anniversaries, and room decor lovers",
      "Study desk aesthetic accent light",
    ],
    whyBuy: [
      "3 unique shapes — Rectangle, Cloud, Glass Dome — same magical tulip glow",
      "Infinity mirror illusion (Rectangle & Cloud) — endless glowing tulip rows",
      "Rectangle is a 2-in-1: ambient lamp + desktop vanity mirror when off",
      "Glass Dome: premium terrarium aesthetic with natural wood base and crystals",
      "Handcrafted warm tulips, USB powered, no heat, no batteries needed",
    ],
    faqs: [
      {
        question: "What shapes are available?",
        answer:
          "Three shapes: Rectangle (infinity mirror cube), Cloud (cloud frame with infinity mirror interior), and Glass Dome (glass globe terrarium with wooden base). Select your shape before adding to cart.",
      },
      {
        question: "What does the Rectangle lamp look like when off?",
        answer:
          "The cube sides become highly reflective mirrors — a stylish functional desktop vanity mirror.",
      },
      {
        question: "What is the Glass Dome made of?",
        answer:
          "A clear glass globe dome, natural wood circular base, decorative crystal pebbles at the base, and handcrafted warm LED tulips inside. No infinity mirror — purely a terrarium/globe aesthetic.",
      },
      {
        question: "Can the Glass Dome cover be removed?",
        answer:
          "Yes — the dome lifts off the wooden base, making it easy to clean or rearrange the tulips inside.",
      },
      {
        question: "Are the tulips real flowers?",
        answer:
          "No — high-quality handcrafted artificial tulips lit by durable warm LEDs, glowing indefinitely without wilting.",
      },
      {
        question: "How is it powered?",
        answer:
          "USB powered — connect to any standard charger, adapter, computer port, or power bank. No batteries needed.",
      },
      {
        question: "Is there any heat from the lamp?",
        answer:
          "No — energy-efficient LEDs mean the lamp stays completely cool even after hours of use.",
      },
    ],
  },

  "luminary-bonsai-tree-lamp": {
    displayName: "Luminary Bonsai Tree Lamp",
    seoTitle: "Vurlo Luminary Bonsai Tree Lamp – LED Fairy Light Tree for Aesthetic Bedroom Decor",
    metaTitle: "LED Bonsai Tree Lamp – Fairy Light Tree for Bedroom & Desk Decor | Vurlo",
    metaDescription:
      "Buy Vurlo Luminary Bonsai Tree Lamp. 108 warm LED pearl lights on bendable gold branches, touch base, USB powered. Best aesthetic room decor gift in India. ₹699.",
    description:
      "Bring a magical forest glow into your room with the Vurlo Luminary Bonsai Tree Lamp. Featuring 108 warm white LED pearl lights across gracefully bendable gold wire branches, this lamp creates a dreamy, cozy atmosphere unlike anything else. Shape the branches however you like — every arrangement looks stunning. The touch-sensitive base makes it effortless to switch on and off, and dual USB + battery power means you can place it anywhere. Whether it's on your bedside table, study desk, vanity, or shelf, the Luminary Bonsai adds an instant warm glow and a conversation-starting centrepiece to any aesthetic room setup. Comes in premium gift packaging — the perfect birthday, anniversary, or housewarming gift.",
    useCases: [
      "Bedside nightstand warm ambient accent lamp",
      "Study desk or vanity aesthetic decor piece",
      "Shelf, bookcase, or window sill decorative light",
      "Premium gift for birthdays, anniversaries, and housewarming",
      "Photography and content creation background prop",
    ],
    whyBuy: [
      "108 warm LED pearls on bendable gold branches — shape it your way",
      "Touch base on/off — no fumbling for switches in the dark",
      "Dual power: USB + AA battery backup, place it anywhere",
      "Comes in premium gift packaging with USB cable included",
      "Warm cozy glow, zero heat, completely safe for all ages",
    ],
    faqs: [
      {
        question: "Can I reshape the branches?",
        answer:
          "Yes — all branches are made of flexible gold wire and can be bent and reshaped freely. Every arrangement looks unique and beautiful.",
      },
      {
        question: "How is it powered?",
        answer:
          "Dual power — USB cable (included) or AA batteries, giving you full flexibility to place it anywhere, even without a nearby socket.",
      },
      {
        question: "Does it get hot?",
        answer:
          "No — energy-efficient warm LEDs produce zero heat, making it completely safe to touch and leave on overnight.",
      },
      {
        question: "What is the height of the tree?",
        answer:
          "Approximately 45-50cm tall, making it a perfect tabletop statement piece without being overwhelming.",
      },
      {
        question: "Is it good as a gift?",
        answer:
          "Absolutely — it comes in premium gift-ready packaging with a USB cable included. Perfect for birthdays, anniversaries, Valentine's Day, and housewarming gifts.",
      },
      {
        question: "How many LEDs does it have?",
        answer:
          "108 warm white LED pearl lights spread across all branches for a full, lush glowing effect.",
      },
    ],
  },
};
