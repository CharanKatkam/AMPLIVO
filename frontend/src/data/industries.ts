import { Industry } from '@/types';

export const industries: Industry[] = [
  {
    id: '1',
    slug: 'real-estate',
    name: 'Real Estate',
    icon: 'Building2',
    color: '#4C1D95',
    description: 'Lead generation, project launches & property marketing campaigns.',
    fullDesc: 'The real estate market moves fast. We help developers and agencies generate high-quality leads, build brand trust, and launch new projects with maximum impact.',
    challenges: [
      'High cost per lead and poor lead quality.',
      'Fierce competition in local property markets.',
      'Need for immersive property showcases.'
    ],
    solutions: [
      { title: 'Performance Marketing', desc: 'Google Ads & Meta Ads targeted at high-intent property buyers and investors.' },
      { title: 'Lead Generation & Automation', desc: 'Custom landing pages and automated email/WhatsApp sequences for site visits.' },
      { title: 'Video Marketing', desc: 'High-quality property walkthroughs, drone footage, and project promotional videos.' },
      { title: 'Social Media', desc: 'Engaging content highlighting property features, neighborhood guides, and testimonials.' }
    ]
  },
  {
    id: '2',
    slug: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#7C3AED',
    description: 'Student enrollment campaigns, brand building & digital outreach.',
    fullDesc: 'From universities to ed-tech startups, we build digital marketing ecosystems that drive student enrollments, enhance institutional reputation, and engage alumni.',
    challenges: [
      'Seasonal enrollment pressure.',
      'Building trust with parents and students.',
      'Differentiating from competing institutions.'
    ],
    solutions: [
      { title: 'Search Engine Optimization', desc: 'Local and technical SEO to rank for specific degree and course queries.' },
      { title: 'Content Marketing', desc: 'Informative blogs, alumni case studies, and campus life articles.' },
      { title: 'Performance Marketing', desc: 'Targeted enrollment campaigns on Google Ads and social media during admission seasons.' },
      { title: 'Website Development', desc: 'Conversion-optimised student portals and landing pages for specific courses.' }
    ]
  },
  {
    id: '3',
    slug: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: '#EC4899',
    description: 'Patient acquisition, health awareness & clinic branding campaigns.',
    fullDesc: 'Trust is the currency of healthcare. We help hospitals, clinics, and health-tech platforms acquire new patients while maintaining strict compliance and empathy.',
    challenges: [
      'Strict advertising regulations and compliance.',
      'Building patient trust and online reputation.',
      'Local discovery for urgent and elective care.'
    ],
    solutions: [
      { title: 'Local SEO & Reputation', desc: 'Optimising Google Business Profiles and managing patient reviews.' },
      { title: 'Content & Video Marketing', desc: 'Doctor interviews, health awareness videos, and educational blogs.' },
      { title: 'Performance Marketing', desc: 'High-intent search campaigns for specific treatments and specialties.' },
      { title: 'Marketing Automation', desc: 'Automated appointment reminders and follow-up email sequences.' }
    ]
  },
  {
    id: '4',
    slug: 'information-technology',
    name: 'Information Technology',
    icon: 'Cpu',
    color: '#06B6D4',
    description: 'B2B lead generation, SaaS marketing & technology brand positioning.',
    fullDesc: 'We help IT firms, SaaS companies, and tech startups articulate complex solutions, generate enterprise leads, and establish thought leadership in a crowded market.',
    challenges: [
      'Long and complex B2B sales cycles.',
      'Explaining highly technical products simply.',
      'Generating qualified enterprise (B2B) leads.'
    ],
    solutions: [
      { title: 'LinkedIn Ads & B2B Lead Gen', desc: 'Hyper-targeted campaigns aimed at CTOs and decision-makers.' },
      { title: 'Content Marketing', desc: 'Whitepapers, technical case studies, and industry reports.' },
      { title: 'Website Development', desc: 'Fast, responsive SaaS websites with clear product value propositions.' },
      { title: 'Branding & Design', desc: 'Modern tech-focused brand identity, presentation decks, and UI/UX consulting.' }
    ]
  },
  {
    id: '5',
    slug: 'e-commerce',
    name: 'E-Commerce',
    icon: 'ShoppingBag',
    color: '#10B981',
    description: 'Performance ads, conversion optimisation & retention marketing.',
    fullDesc: 'We scale direct-to-consumer (D2C) brands through aggressive performance marketing, conversion rate optimisation, and retention strategies that maximize customer lifetime value.',
    challenges: [
      'High cart abandonment rates.',
      'Rising customer acquisition costs (CAC).',
      'Fierce marketplace competition.'
    ],
    solutions: [
      { title: 'Performance Marketing', desc: 'Google Shopping, Meta Catalog ads, and dynamic remarketing.' },
      { title: 'Influencer Marketing', desc: 'Collaborating with micro and macro influencers for product reviews and unboxings.' },
      { title: 'Marketing Automation', desc: 'Abandoned cart email sequences and personalized SMS marketing.' },
      { title: 'Social Media & Creative', desc: 'High-converting product creatives, Reels, and engaging aesthetic feeds.' }
    ]
  },
  {
    id: '6',
    slug: 'fashion-lifestyle',
    name: 'Fashion & Lifestyle',
    icon: 'Shirt',
    color: '#F59E0B',
    description: 'Influencer campaigns, visual branding & social commerce strategies.',
    fullDesc: 'In fashion, aesthetics are everything. We combine striking visual design with data-driven social commerce strategies to turn scrollers into shoppers.',
    challenges: [
      'Creating consistent, high-quality visual content.',
      'Standing out in a highly saturated visual market.',
      'Tracking influencer campaign ROI.'
    ],
    solutions: [
      { title: 'Influencer Marketing', desc: 'End-to-end influencer management from selection to deliverable tracking.' },
      { title: 'Social Media Marketing', desc: 'Aesthetic grid planning, trending Reels, and community building.' },
      { title: 'Branding & Creative Design', desc: 'Lookbooks, packaging concepts, and cohesive brand guidelines.' },
      { title: 'Performance Marketing', desc: 'Instagram and TikTok shopping ads focused on ROAS.' }
    ]
  },
  {
    id: '7',
    slug: 'hospitality',
    name: 'Hospitality',
    icon: 'Hotel',
    color: '#EF4444',
    description: 'Booking campaigns, reputation management & travel marketing.',
    fullDesc: 'We help hotels, resorts, and travel agencies increase direct bookings, manage online reputation, and showcase their unique experiences through stunning digital content.',
    challenges: [
      'Over-reliance on OTAs (Online Travel Agencies).',
      'Managing seasonal demand fluctuations.',
      'Showcasing the experiential value of the property.'
    ],
    solutions: [
      { title: 'Website & Landing Pages', desc: 'Custom booking engines and beautiful, immersive property websites.' },
      { title: 'Video & Content Marketing', desc: 'Cinematic property tours, local experience guides, and drone footage.' },
      { title: 'Performance Marketing', desc: 'Direct-booking ad campaigns on Google and social media.' },
      { title: 'Social Media Marketing', desc: 'Engaging travel content, user-generated content curation, and influencer stays.' }
    ]
  },
  {
    id: '8',
    slug: 'restaurants-food',
    name: 'Restaurants & Food',
    icon: 'UtensilsCrossed',
    color: '#F97316',
    description: 'Local SEO, food delivery campaigns & brand visibility strategies.',
    fullDesc: 'From fine dining to cloud kitchens, we drive footfall and online orders through mouth-watering content, local search dominance, and targeted promotions.',
    challenges: [
      'Driving consistent local foot traffic.',
      'High commissions from food delivery aggregators.',
      'Creating daily, appealing visual content.'
    ],
    solutions: [
      { title: 'Local SEO', desc: 'Google Business optimization to capture "near me" dining searches.' },
      { title: 'Social Media & Creative', desc: 'High-quality food photography, menu design, and engaging Instagram stories.' },
      { title: 'Performance Marketing', desc: 'Geo-targeted ads for special events, weekend brunches, and local delivery.' },
      { title: 'Influencer Marketing', desc: 'Collaborating with local food bloggers and reviewers for tasting events.' }
    ]
  },
  {
    id: '9',
    slug: 'automotive',
    name: 'Automotive',
    icon: 'Car',
    color: '#3B82F6',
    description: 'Showroom traffic, test drive leads & vehicle launch campaigns.',
    fullDesc: 'We help dealerships and automotive brands drive qualified showroom traffic, increase test drive bookings, and successfully launch new vehicles in the digital space.',
    challenges: [
      'Transitioning from traditional to digital ad spend.',
      'Generating high-intent test drive leads.',
      'Differentiating dealership services in a local market.'
    ],
    solutions: [
      { title: 'Lead Generation', desc: 'Frictionless Facebook and Google lead forms for test drives and service bookings.' },
      { title: 'Video Marketing', desc: 'High-octane car reviews, feature highlights, and promotional launch videos.' },
      { title: 'Local SEO', desc: 'Optimising for local dealership searches and managing service center reviews.' },
      { title: 'Marketing Automation', desc: 'Automated SMS and email follow-ups for test drive inquiries.' }
    ]
  },
  {
    id: '10',
    slug: 'finance-fintech',
    name: 'Finance & Fintech',
    icon: 'TrendingUp',
    color: '#8B5CF6',
    description: 'Trust-building content, compliance marketing & lead nurturing.',
    fullDesc: 'We help banks, wealth managers, and fintech startups navigate strict regulations while building trust and acquiring customers through data-driven digital strategies.',
    challenges: [
      'Navigating strict advertising compliance and regulations.',
      'Building consumer trust in financial products.',
      'High cost of acquisition in the finance sector.'
    ],
    solutions: [
      { title: 'Content Marketing & SEO', desc: 'Authoritative financial blogs, investment guides, and strong organic rankings.' },
      { title: 'Performance Marketing', desc: 'Highly targeted campaigns for app installs, account openings, or wealth management leads.' },
      { title: 'Website Development', desc: 'Secure, fast, and user-friendly fintech interfaces and landing pages.' },
      { title: 'Branding', desc: 'Trust-centric brand identity, corporate presentations, and clear value propositions.' }
    ]
  },
  {
    id: '11',
    slug: 'startups',
    name: 'Startups',
    icon: 'Rocket',
    color: '#06B6D4',
    description: 'Growth hacking, brand identity, investor pitch content & viral campaigns.',
    fullDesc: 'Startups need to move fast. We provide agile, full-stack digital marketing from initial brand identity and website launch to scalable user acquisition and growth hacking.',
    challenges: [
      'Limited budgets requiring high ROI.',
      'Establishing a brand identity from scratch.',
      'Rapidly scaling user acquisition.'
    ],
    solutions: [
      { title: 'Branding & Creative Design', desc: 'Logo design, brand guidelines, and high-impact investor pitch decks.' },
      { title: 'Website Development', desc: 'MVP websites and high-converting landing pages built on Next.js/React.' },
      { title: 'Performance & Growth Marketing', desc: 'Iterative, data-driven ad campaigns focused on minimum CPA.' },
      { title: 'Video Marketing', desc: 'Engaging explainer videos and product demos for early adopters.' }
    ]
  },
  {
    id: '12',
    slug: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    color: '#6B7280',
    description: 'B2B marketing, trade show digital campaigns & industrial branding.',
    fullDesc: 'We help manufacturers and industrial companies digitize their sales processes, generate global B2B inquiries, and modernize their brand presence.',
    challenges: [
      'Outdated digital presence and websites.',
      'Reaching niche B2B buyers and distributors globally.',
      'Long procurement and sales cycles.'
    ],
    solutions: [
      { title: 'B2B Search Engine Optimization', desc: 'Ranking globally for niche industrial and manufacturing keywords.' },
      { title: 'Website Development', desc: 'Modern corporate websites with detailed, easy-to-navigate product catalogs.' },
      { title: 'LinkedIn Ads & Performance', desc: 'Targeting procurement managers and B2B distributors.' },
      { title: 'Video Marketing', desc: 'Corporate films, factory tours, and manufacturing process videos.' }
    ]
  },
  {
    id: '13',
    slug: 'entertainment',
    name: 'Entertainment',
    icon: 'Music',
    color: '#EC4899',
    description: 'Event marketing, artist branding, ticket sales & fan engagement.',
    fullDesc: 'We partner with artists, event organizers, and production houses to build massive digital hype, drive ticket sales, and cultivate highly engaged fan communities.',
    challenges: [
      'Creating viral, shareable moments.',
      'Selling out events in short timeframes.',
      'Maintaining fan engagement between releases.'
    ],
    solutions: [
      { title: 'Social Media Marketing', desc: 'TikTok/Reels strategies, community management, and trend participation.' },
      { title: 'Performance Marketing', desc: 'High-urgency ticket sale campaigns and retargeting across Meta and Google.' },
      { title: 'Influencer Marketing', desc: 'Collaborations with culture creators to amplify event reach.' },
      { title: 'Branding & Video', desc: 'Event branding, promotional trailers, and post-event recap videos.' }
    ]
  },
  {
    id: '14',
    slug: 'personal-brands',
    name: 'Personal Brands',
    icon: 'UserCircle',
    color: '#F59E0B',
    description: 'LinkedIn authority building, content strategy & speaking opportunities.',
    fullDesc: 'We help founders, authors, and industry experts monetize their expertise, build massive online authority, and secure speaking engagements through strategic content.',
    challenges: [
      'Consistency in content creation.',
      'Monetizing an existing audience.',
      'Standing out as a unique thought leader.'
    ],
    solutions: [
      { title: 'Content Marketing', desc: 'Ghostwriting for LinkedIn/Twitter, newsletter creation, and thought leadership articles.' },
      { title: 'Social Media & Video', desc: 'Short-form video editing (Reels/Shorts) and podcast production.' },
      { title: 'Website Development', desc: 'Personal portfolio websites, speaker kits, and digital product landing pages.' },
      { title: 'Marketing Automation', desc: 'Email sequences to nurture followers into course buyers or consulting clients.' }
    ]
  },
  {
    id: '15',
    slug: 'professional-services',
    name: 'Professional Services',
    icon: 'Briefcase',
    color: '#4C1D95',
    description: 'Trust marketing, thought leadership & high-value client acquisition.',
    fullDesc: 'Law firms, consultancies, and agencies rely on reputation. We help professional services firms acquire high-value clients through search dominance and thought leadership.',
    challenges: [
      'Generating high-ticket, qualified leads.',
      'Demonstrating expertise before the first consultation.',
      'Fierce local search competition.'
    ],
    solutions: [
      { title: 'SEO & Local Search', desc: 'Dominating search results for specific legal, consulting, or professional queries.' },
      { title: 'Lead Generation', desc: 'Whitepaper downloads and consultation booking funnels.' },
      { title: 'Content Marketing', desc: 'In-depth case studies, industry reports, and authoritative blog posts.' },
      { title: 'Branding', desc: 'Premium corporate identity and professional presentation design.' }
    ]
  },
  {
    id: '16',
    slug: 'consumer-products',
    name: 'Consumer Products',
    icon: 'Package',
    color: '#10B981',
    description: 'FMCG campaigns, product launches & retail channel marketing.',
    fullDesc: 'We help FMCG and consumer product brands dominate the digital shelf, launch new products with a bang, and drive both online and offline retail sales.',
    challenges: [
      'Low profit margins requiring mass scale.',
      'Connecting offline retail sales to digital efforts.',
      'Building brand loyalty in highly substitutable markets.'
    ],
    solutions: [
      { title: 'Influencer & Video Marketing', desc: 'Mass-reach influencer campaigns and viral product demonstration videos.' },
      { title: 'Social Media Marketing', desc: 'Engaging, colorful brand feeds, contests, and community interaction.' },
      { title: 'Performance Marketing', desc: 'Omnichannel campaigns driving to both D2C websites and marketplace platforms.' },
      { title: 'Branding & Creative', desc: 'Eye-catching packaging concepts and digital advertising creatives.' }
    ]
  }
];
