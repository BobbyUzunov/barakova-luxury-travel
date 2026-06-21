import type { SiteContent } from "./content";

export const contentEn = {
  brand: {
    name: "Barakova Luxury Travel",
    subtitle: "by Bogdana Barakova",
  },
  navItems: [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Destinations", href: "#destinations" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  headerCta: "Send inquiry",
  hero: {
    label: "PERSONAL LUXURY TRAVEL CONSULTING",
    title: "Your dream escape, planned down to the finest detail",
    subtitle:
      "Personal travel consulting for clients who want a luxury experience without stress, noise, or endless searching.",
    primaryCta: "Request a Private Consultation",
    secondaryCta: "Explore destinations",
  },
  imageAlts: {
    hero: "Bogdana Barakova on a beach facing the sea",
    profileMain: "Portrait of Bogdana Barakova",
    profileSecondary: "Bogdana Barakova, luxury travel consultant",
  },
  servicesSection: {
    eyebrow: "Services",
    title: "How I can help",
  },
  services: [
    {
      title: "Luxury Vacations",
      description:
        "Selected hotels, resorts, and experiences for travelers who value comfort, style, and calm.",
    },
    {
      title: "Wedding and Romantic Trips",
      description:
        "Ideas for honeymoons, anniversaries, and intimate milestones shaped with attention to atmosphere and detail.",
    },
    {
      title: "Boutique Hotels",
      description:
        "Small, stylish, characterful stays that bring a sense of individuality, warmth, and class.",
    },
    {
      title: "Premium Family Vacations",
      description:
        "Family trips where comfort, safety, and thoughtful organization come first.",
    },
    {
      title: "Exotic Destinations",
      description:
        "Distant routes, beautiful beaches, culture, nature, and experiences beyond standard offers.",
    },
    {
      title: "Personal Itineraries",
      description:
        "Planning shaped around your rhythm, budget, interests, and preferred style of travel.",
    },
  ],
  steps: [
    "You share your dream destination",
    "We clarify style, budget, and preferences",
    "You receive selected proposals",
    "You choose the most suitable vacation with confidence",
  ],
  processSection: {
    eyebrow: "Process",
    title: "How the consultation works",
    description:
      "A calm, thoughtful and clear process where every detail is shaped around your preferences, budget and sense of comfort.",
  },
  destinationsSection: {
    eyebrow: "Destinations",
    title: "Luxury destinations around the world",
  },
  destinations: [
    {
      name: "Maldives",
      description:
        "Overwater villas, white sand, crystal-clear water, and a complete sense of escape from everyday life.",
      image: "/images/destinations/maldives.jpg",
    },
    {
      name: "Dubai",
      description:
        "Luxury hotels, modern architecture, gourmet experiences, and premium urban energy.",
      image: "/images/destinations/dubai.jpg",
    },
    {
      name: "Bali",
      description:
        "Boutique villas, tropical nature, spiritual atmosphere, and a balance of relaxation and discovery.",
      image: "/images/destinations/bali.jpg",
    },
    {
      name: "Seychelles",
      description:
        "Wild beaches, tranquility, romance, and one of the most beautiful moods in the Indian Ocean.",
      image: "/images/destinations/seychelles.jpg",
    },
    {
      name: "Greece",
      description:
        "Boutique islands, sea-inspired cuisine, sunsets, and an elegant Mediterranean atmosphere.",
      image: "/images/destinations/greece.jpg",
    },
    {
      name: "Italy",
      description:
        "Culture, romance, beautiful cuisine, lakes, coastlines, and unmistakable Italian style.",
      image: "/images/destinations/italy.jpg",
    },
    {
      name: "Thailand",
      description:
        "Tropical beaches, temples, spa experiences, islands, and rich local culture.",
      image: "/images/destinations/thailand.jpg",
    },
    {
      name: "French Riviera",
      description:
        "European elegance, yachts, sea views, boutique hotels, and classic luxury.",
      image: "/images/destinations/french-riviera.jpg",
    },
  ],
  trustSection: {
    eyebrow: "Trust",
    title: "Why clients choose Barakova Luxury Travel",
  },
  trustItems: [
    {
      title: "Personal Approach",
      description:
        "Every proposal is selected around your wishes, travel style, and personal idea of comfort.",
    },
    {
      title: "Selected Luxury Proposals",
      description:
        "You receive a thoughtful selection, not random mass-market offers.",
    },
    {
      title: "Time Saved",
      description:
        "You avoid hours of searching and comparing, and receive clear, meaningful, suitable options.",
    },
    {
      title: "Attention to Every Detail",
      description:
        "From the hotel and location to the experiences on site, everything is arranged with the complete feeling in mind.",
    },
  ],
  profileStats: [
    "Dozens of countries visited",
    "Hundreds of landmarks explored",
    "Personal approach",
    "Curated experiences",
  ],
  about: {
    eyebrow: "Profile",
    title: "Meet Bogdana Barakova",
    intro:
      "Behind Barakova Luxury Travel is personal experience, dozens of countries visited, and a passion for journeys that become real memories.",
    paragraphs: [
      "Hello, I am Bogdana Barakova — a traveler at heart and someone who believes every trip can become a special experience when planned with attention to detail.",
      "Over the years, I have visited dozens of countries and hundreds of remarkable places. I always look for the balance between style, comfort, quality, and authentic experience — not just a beautiful destination, but a journey that leaves a memory.",
      "I love discovering boutique hotels, hidden places, local traditions, and routes away from mass tourism. With Barakova Luxury Travel, I share my personal experience and help people plan their dream vacations better, more calmly, and more wisely.",
    ],
    mission:
      "My mission is to turn the dream destination into a well-planned and unforgettable experience.",
    tags: ["Luxury consulting", "Boutique selection", "Personal planning"],
  },
  finalCta: {
    eyebrow: "Contact",
    title: "Ready for your next unforgettable journey?",
    subtitle: "Let us create your next luxury experience.",
    button: "Send inquiry",
  },
  contact: {
    eyebrow: "Inquiry",
    title: "Request your private consultation",
    subtitle:
      "Share what you are looking for and receive carefully selected ideas for your next journey.",
    trustTitle: "Why send an inquiry?",
    trustItems: [
      "Personal approach",
      "Selected proposals",
      "Time saved",
      "Attention to every detail",
    ],
    fields: {
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      destination: "Desired destination",
      travelPeriod: "Travel period",
      travelers: "Number of travelers",
      budget: "Approximate budget",
      message: "Message",
      honeypot: "Website",
    },
    placeholders: {
      message: "Briefly tell us what you are looking for...",
    },
    requiredMark: "*",
    submit: "Request a Private Consultation",
    submitting: "Sending...",
    validation: {
      fullName: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a phone number.",
      submitError:
        "There was a problem sending your inquiry. Please try again.",
    },
    success: {
      title: "Thank you for your inquiry.",
      message: "We will contact you as soon as possible.",
      reset: "Send another inquiry",
    },
  },
} satisfies SiteContent;
