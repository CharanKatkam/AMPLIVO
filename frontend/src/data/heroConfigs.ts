import type { HeroConfig } from '@/types/hero';

const UNSPLASH = 'https://images.unsplash.com';

export const servicesHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1551434678-e076c223a692?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'none',
  },
  content: {
    badge: 'All Services',
    title: 'Integrated Digital Marketing Services',
    subtitle:
      'From visibility to conversion, every service is designed to create compounding growth and measurable ROI for your business.',
  },
  accent: 'default',
};

export const industriesHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1486406146926-c627a92ad1ab?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'cards',
  },
  content: {
    badge: 'Industries',
    title: 'Industries We Serve',
    subtitle:
      'We bring deep domain expertise to craft digital strategies that solve the unique challenges of your industry.',
  },
  accent: 'cyan',
};

export const portfolioHero: HeroConfig = {
  background: {
    type: 'ken-burns',
    images: [
      '/images/portfolio/project-1.jpeg',
      '/images/portfolio/project-3.jpeg',
      '/images/portfolio/project-5.jpeg',
      '/images/portfolio/project-7.jpeg',
    ],
    decoration: 'none',
  },
  content: {
    badge: 'Our Portfolio',
    title: 'Work We Are Proud Of',
    subtitle:
      'Browse our campaigns across social media, SEO, paid advertising, branding, web development, and influencer marketing.',
  },
  accent: 'pink',
};

export const caseStudiesHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1551288049-bebda4e38f71?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'charts',
  },
  content: {
    badge: 'Case Studies',
    title: 'Results That Speak for Themselves',
    subtitle:
      'Real campaigns. Real brands. Real results. Explore how we help businesses achieve measurable growth across India and beyond.',
  },
  accent: 'default',
};

export const insightsHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1460925895917-afdab827c52f?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'charts',
  },
  content: {
    badge: 'Insights Blog',
    title: 'Marketing Insights & Growth Strategies',
    subtitle:
      'Expert perspectives on digital marketing, SEO, performance advertising, and brand building for ambitious businesses.',
  },
  accent: 'default',
};

export const aboutHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1522071820081-009f0129c71c?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'none',
  },
  content: {
    badge: 'About Amplivo',
    title: 'We Are a Digital Growth Agency That Delivers Results',
    subtitle:
      'Amplivo combines creativity, technology, and marketing analytics to help businesses amplify their digital presence and accelerate measurable growth.',
  },
  accent: 'default',
};

export const careersHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1519389950473-47ba0277781c?w=1920&h=800&fit=crop&auto=format`,
    decoration: 'none',
  },
  content: {
    badge: 'Careers at Amplivo',
    title: 'Do the Best Work of Your Life',
    titleClass: 'text-4xl lg:text-6xl',
    subtitle:
      'We are always looking for curious, driven, and creative individuals to join our mission of amplifying brand growth.',
    cta: { label: 'View Open Roles', href: '#open-roles' },
  },
  accent: 'pink',
};

export const contactHero: HeroConfig = {
  background: {
    type: 'poster',
    src: `${UNSPLASH}/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop&auto=format&q=80`,
    decoration: 'network',
  },
  content: {
    badge: 'Get In Touch',
    title: "Let's Build Your Growth Strategy",
    subtitle:
      'Book a free 30-minute digital audit. Walk away with a clear, customised marketing roadmap for your business.',
  },
  accent: 'default',
};
