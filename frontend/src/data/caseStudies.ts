import { CaseStudy } from '@/types';

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'real-estate-lead-generation-hyderabad',
    clientName: 'Prestige Estates Hyderabad',
    industry: 'Real Estate',
    location: 'Hyderabad, Telangana',
    category: 'Paid Ads',
    tag: 'Lead Generation',
    title: '342% ROI: Real Estate Lead Campaign in 90 Days',
    challenge: 'High cost per lead, low lead quality, poor follow-up process, no source tracking, and weak landing pages that failed to convert traffic into enquiries.',
    solution: 'Separate campaigns per buyer category, high-conversion landing pages, audience retargeting sequences, automated lead assignment to sales team, lead quality tagging system, weekly creative A/B testing, and full conversion tracking setup.',
    duration: '90 Days',
    platforms: ['Google Ads', 'Meta Ads', 'Landing Pages', 'CRM Integration'],
    metrics: [
      { label: 'Leads Generated', value: '1,247' },
      { label: 'Cost Per Lead', value: '₹380' },
      { label: 'Site Visits', value: '84,000+' },
      { label: 'Qualified Leads', value: '312' },
      { label: 'Booking Conversions', value: '47' },
      { label: 'Campaign ROI', value: '342%' },
    ],
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop&auto=format',
    testimonial: 'Amplivo transformed our digital lead pipeline. The quality of leads improved dramatically and our sales team is closing more deals with less effort.',
    objective: 'Generate qualified real estate leads for luxury 3BHK and 4BHK apartments, reduce the cost per lead (CPL) by 40%, and integrate a automated CRM lead assignment system for the sales team within 90 days.',
    budgetRange: '₹5,00,000 - ₹8,00,000',
    creatives: [
      { title: 'Prestige Heights Luxury Living Showcase', type: 'Meta Video Ad', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop' },
      { title: 'Limited Time Festive Discount Banner', type: 'Google Display Banner', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'Prestige Heights Luxury Villas Landing Page', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Performance Marketing', slug: 'performance-marketing' },
      { name: 'Website & Landing-Page Development', slug: 'website-development' }
    ]
  },
  {
    id: '2',
    slug: 'ecommerce-fashion-brand-meta-ads',
    clientName: 'FashionFirst Retail',
    industry: 'Fashion & E-Commerce',
    location: 'Mumbai, Maharashtra',
    category: 'Social Media',
    tag: 'E-Commerce',
    title: '5x ROAS: Fashion Brand Meta Ads Scale-Up',
    challenge: 'Stagnant online sales, high cart abandonment rate, no structured remarketing, and inconsistent brand visuals across social platforms.',
    solution: 'Comprehensive Meta advertising restructure with dynamic product ads, tiered audience targeting, creative refresh with lifestyle photography, and abandoned cart retargeting sequences.',
    duration: '60 Days',
    platforms: ['Meta Ads', 'Instagram', 'Facebook', 'WhatsApp Business'],
    metrics: [
      { label: 'ROAS Achieved', value: '5.2x' },
      { label: 'Revenue Growth', value: '+284%' },
      { label: 'Cost Per Purchase', value: '₹420' },
      { label: 'Cart Recovery Rate', value: '34%' },
      { label: 'New Customers', value: '2,800+' },
      { label: 'Social Followers', value: '+18K' },
    ],
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&auto=format',
    testimonial: 'Our online revenue tripled in two months. The team truly understands e-commerce and the creative quality was exceptional.',
    objective: 'Scale monthly online sales revenue by 3x, lower the customer acquisition cost (CAC) by 25%, and improve return on ad spend (ROAS) on Meta platforms.',
    budgetRange: '₹8,00,000 - ₹12,00,000',
    creatives: [
      { title: 'Summer Collection Showcase Carousel', type: 'Meta Carousel Ad', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop' },
      { title: 'Influencer Style Lookbook Reel', type: 'Instagram Reel', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'FashionFirst Summer Collection Hub', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Social Media Marketing', slug: 'social-media-marketing' },
      { name: 'Performance Marketing', slug: 'performance-marketing' }
    ]
  },
  {
    id: '3',
    slug: 'edtech-seo-organic-growth',
    clientName: 'EduPath Academy',
    industry: 'Education',
    location: 'Bengaluru, Karnataka',
    category: 'SEO',
    tag: 'SEO',
    title: 'Page 1 Rankings: EdTech Organic Growth Story',
    challenge: 'Near-zero organic presence, no keyword strategy, high dependency on paid ads for enrollment, and a technically broken website with crawl errors.',
    solution: 'Complete technical SEO audit and fixes, comprehensive keyword mapping across 400+ terms, on-page optimisation, 180+ quality backlinks acquired, and structured content blog strategy.',
    duration: '6 Months',
    platforms: ['Google Search', 'Bing', 'Google My Business'],
    metrics: [
      { label: 'Organic Traffic Growth', value: '+380%' },
      { label: 'Keywords on Page 1', value: '127' },
      { label: 'Backlinks Acquired', value: '180+' },
      { label: 'Enrollment Leads', value: '3.4x' },
      { label: 'Bounce Rate Reduction', value: '-42%' },
      { label: 'Domain Rating', value: '+28 pts' },
    ],
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop&auto=format',
    testimonial: 'We went from invisible to dominating our category in search. The SEO work by Amplivo has been transformational for our student acquisition.',
    objective: 'Achieve top page-1 search engine rankings for 100+ competitive academic keywords, increase organic student inquiries, and resolve all site technical crawl errors.',
    budgetRange: '₹3,00,000 - ₹5,00,000',
    creatives: [
      { title: 'Ultimate UPSC Preparation Guide', type: 'PDF Lead Magnet', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=300&fit=crop' },
      { title: 'Scholarship Informational Infographic', type: 'Blog Graphic', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'UPSC Crackers Batch Enrolment Page', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Search Engine Optimisation', slug: 'search-engine-optimisation' },
      { name: 'Content Marketing', slug: 'content-marketing' }
    ]
  },
  {
    id: '4',
    slug: 'd2c-startup-community-social',
    clientName: 'NutriBlend D2C',
    industry: 'Startups / FMCG',
    location: 'Pune, Maharashtra',
    category: 'Social Media',
    tag: 'Social Media',
    title: '100K Engaged Community Built in 6 Months',
    challenge: 'Zero social presence, no brand recognition, entering a competitive health-food market, and limited marketing budget.',
    solution: 'Full brand identity creation for social, influencer seeding with micro-creators, UGC campaigns, daily content strategy, community engagement systems, and a launch campaign with giveaway mechanics.',
    duration: '6 Months',
    platforms: ['Instagram', 'YouTube Shorts', 'LinkedIn', 'Influencers'],
    metrics: [
      { label: 'Followers Gained', value: '100K+' },
      { label: 'Avg Engagement Rate', value: '8.4%' },
      { label: 'UGC Posts Created', value: '1,200+' },
      { label: 'Influencer Collaborations', value: '45' },
      { label: 'Brand Searches', value: '+460%' },
      { label: 'D2C Revenue Growth', value: '+220%' },
    ],
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=500&fit=crop&auto=format',
    testimonial: 'Amplivo built our brand from scratch on social media. The community engagement they created is unlike anything we imagined possible in 6 months.',
    objective: 'Establish a robust brand presence on Instagram, grow the organic following to over 100k engaged users, and drive D2C sales via organic channels within 6 months.',
    budgetRange: '₹4,00,000 - ₹6,00,000',
    creatives: [
      { title: 'NutriBlend Shake Recipe Reel', type: 'Instagram Video Reel', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop' },
      { title: 'Monsoon Fitness Challenge Post', type: 'Instagram Feed Post', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'NutriBlend D2C Online Storefront', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Social Media Marketing', slug: 'social-media-marketing' },
      { name: 'Influencer Marketing', slug: 'influencer-marketing' }
    ]
  },
  {
    id: '5',
    slug: 'it-company-linkedin-b2b',
    clientName: 'TechNova Solutions',
    industry: 'Information Technology',
    location: 'Hyderabad, Telangana',
    category: 'Paid Ads',
    tag: 'B2B Marketing',
    title: 'LinkedIn B2B Demand Generation: 280% Pipeline Growth',
    challenge: 'Struggling to reach decision-makers, high sales cycle, relying on referrals only, no digital lead pipeline for enterprise clients.',
    solution: 'LinkedIn Thought Leadership content strategy for CXOs, LinkedIn Ads with ABM targeting, lead magnet landing pages, and a sales-ready nurture email sequence.',
    duration: '4 Months',
    platforms: ['LinkedIn Ads', 'LinkedIn Organic', 'Email Marketing', 'Google Ads'],
    metrics: [
      { label: 'Qualified Pipeline Growth', value: '+280%' },
      { label: 'Cost Per MQL', value: '₹3,200' },
      { label: 'LinkedIn Followers', value: '+12K' },
      { label: 'Email Open Rate', value: '41%' },
      { label: 'Demo Calls Booked', value: '84' },
      { label: 'Deal Win Rate', value: '+35%' },
    ],
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop&auto=format',
    testimonial: 'Our B2B pipeline has never been stronger. Amplivo\'s LinkedIn strategy directly contributed to closing 3 enterprise deals.',
    objective: 'Generate an active pipeline of enterprise-level B2B software buyers on LinkedIn, generate high-quality MQLs, and increase overall sales win-rates.',
    budgetRange: '₹6,00,000 - ₹10,00,000',
    creatives: [
      { title: 'Enterprise Digital Transformation whitepaper', type: 'LinkedIn Document Ad', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop' },
      { title: 'CXO Cloud Strategy Roundtable Banner', type: 'LinkedIn Event Post', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'TechNova CXO Guide Download Hub', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Performance Marketing', slug: 'performance-marketing' },
      { name: 'Content Marketing', slug: 'content-marketing' }
    ]
  },
  {
    id: '6',
    slug: 'healthcare-clinic-local-seo',
    clientName: 'HealthPlus Clinics',
    industry: 'Healthcare',
    location: 'Chennai, Tamil Nadu',
    category: 'SEO',
    tag: 'Local SEO',
    title: 'Local SEO Domination: 4x Clinic Walk-ins',
    challenge: 'Multi-location clinic with poor local search visibility, no Google Business Profile management, and losing patients to competitors in search results.',
    solution: 'Full Google Business Profile optimisation for 8 clinic locations, local SEO with geo-targeted content, review generation strategy, and local backlink acquisition.',
    duration: '5 Months',
    platforms: ['Google Search', 'Google Maps', 'Google Business Profile'],
    metrics: [
      { label: 'Walk-in Increase', value: '4x' },
      { label: 'Google Map Pack', value: 'All 8 Locations' },
      { label: 'Review Count', value: '+840 Reviews' },
      { label: 'Rating Improvement', value: '3.8 → 4.7★' },
      { label: 'Appointment Calls', value: '+310%' },
      { label: 'Local Search Visibility', value: '+520%' },
    ],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&auto=format',
    testimonial: 'All our clinics are now appearing at the top of local searches. Patient footfall has increased significantly thanks to Amplivo.',
    objective: 'Maximize local search visibility for 8 clinics in Chennai, increase online doctor booking inquiries, and secure rank 1-3 in Google Maps local pack.',
    budgetRange: '₹2,50,000 - ₹4,00,000',
    creatives: [
      { title: 'Virtual Doctor Consultation Booking GMB Promo', type: 'Local GMB Post Banner', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop' },
      { title: 'Healthcare Guidelines for Monsoon Season', type: 'GMB Post Update Image', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=300&fit=crop' }
    ],
    landingPages: [
      { title: 'HealthPlus Multi-Clinic Location Finder', url: '#' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop'
    ],
    relatedServices: [
      { name: 'Search Engine Optimisation', slug: 'search-engine-optimisation' },
      { name: 'Marketing Automation', slug: 'marketing-automation' }
    ]
  },
];
