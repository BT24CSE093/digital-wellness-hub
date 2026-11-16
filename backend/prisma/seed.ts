import { PrismaClient, UserRole, PricingModel, Platform, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Seed Categories
  const categories = [
    { name: 'Website & App Blockers', slug: 'blockers', description: 'Tools that restrict access to distracting apps and websites.', icon: 'ShieldAlert' },
    { name: 'Mindful Note-Taking & Writing', slug: 'note-taking', description: 'Distraction-free markdown and knowledge management editors.', icon: 'FileText' },
    { name: 'Sleep & Blue Light Filters', slug: 'blue-light-sleep', description: 'Color temperature adjustments and screen dimmers for circadian rhythm support.', icon: 'Moon' },
    { name: 'Focus Timers & Deep Work', slug: 'focus-timers', description: 'Pomodoro intervals and ambient sound generators for academic flow states.', icon: 'Clock' },
    { name: 'Digital Minimalism Launchers', slug: 'minimalist-launchers', description: 'Dumbphone-style monochrome home screens for smartphones.', icon: 'Smartphone' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`[Seed] Seeded ${categories.length} core categories.`);

  // 2. Seed Default Admin User
  const adminEmail = 'admin@digitalwellnesshub.edu';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholderAdminHashForInitOnly',
      isActive: true,
    },
  });
  console.log(`[Seed] Seeded initial administrator: ${admin.email}`);

  // Fetch Category references
  const catMap: Record<string, string> = {};
  const allCats = await prisma.category.findMany();
  for (const c of allCats) {
    catMap[c.slug] = c.id;
  }

  // 3. Seed Realistic Resources across Pricing Models & Categories
  const seedResources = [
    {
      title: 'Cold Turkey Blocker',
      slug: 'cold-turkey-blocker',
      tagline: 'The toughest website and application blocker for desktop',
      description: 'A desktop application that allows strict, unbreakable website and application blocking to enforce deep study periods without workarounds. Features scheduled blocks, locked timers, and domain wildcards.',
      websiteUrl: 'https://getcoldturkey.com',
      pricingModel: PricingModel.FREEMIUM,
      platforms: ['WINDOWS', 'MACOS'],
      categoryId: catMap['blockers'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.8,
      ratingCount: 12,
    },
    {
      title: 'Freedom',
      slug: 'freedom-blocker',
      tagline: 'Block digital distractions across all your devices simultaneously',
      description: 'Synchronized cross-platform distraction blocker that shuts off social media, news, and games across mobile and desktop devices during planned academic blocks.',
      websiteUrl: 'https://freedom.to',
      pricingModel: PricingModel.PAID,
      platforms: ['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'LINUX', 'BROWSER'],
      categoryId: catMap['blockers'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.6,
      ratingCount: 28,
    },
    {
      title: 'f.lux',
      slug: 'flux-blue-light',
      tagline: 'Better lighting for computers to protect circadian sleep cycles',
      description: 'Software that warms up computer display colors at night to match room lighting, significantly cutting blue light exposure before bedtime for better sleep quality.',
      websiteUrl: 'https://justgetflux.com',
      pricingModel: PricingModel.FREE,
      platforms: ['WINDOWS', 'MACOS', 'LINUX', 'IOS', 'ANDROID'],
      categoryId: catMap['blue-light-sleep'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.9,
      ratingCount: 45,
    },
    {
      title: 'ActivityWatch',
      slug: 'activitywatch',
      tagline: 'Open-source, privacy-first automated time tracking',
      description: 'The open-source automated time tracker that logs active windows and browser tabs locally on your device without transmitting personal data to cloud servers.',
      websiteUrl: 'https://activitywatch.net',
      pricingModel: PricingModel.OPEN_SOURCE,
      platforms: ['WINDOWS', 'MACOS', 'LINUX', 'ANDROID'],
      categoryId: catMap['focus-timers'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.7,
      ratingCount: 19,
    },
    {
      title: 'Forest: Stay Focused',
      slug: 'forest-focus-app',
      tagline: 'Gamified Pomodoro timer that plants virtual trees while you study',
      description: 'Gamified focus timer encouraging students to put down their phones. Planting a virtual tree that grows during 25-minute study intervals; leaving the app withers the tree.',
      websiteUrl: 'https://www.forestapp.cc',
      pricingModel: PricingModel.FREEMIUM,
      platforms: ['IOS', 'ANDROID', 'BROWSER'],
      categoryId: catMap['focus-timers'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.7,
      ratingCount: 64,
    },
    {
      title: 'Obsidian',
      slug: 'obsidian-notes',
      tagline: 'A sharp, distraction-free second brain stored in local markdown',
      description: 'Extensible markdown knowledge base working entirely on local folders. Ideal for college lecture notes, research synthesis, and focused revision without web distraction.',
      websiteUrl: 'https://obsidian.md',
      pricingModel: PricingModel.FREEMIUM,
      platforms: ['WINDOWS', 'MACOS', 'LINUX', 'IOS', 'ANDROID'],
      categoryId: catMap['note-taking'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.9,
      ratingCount: 82,
    },
    {
      title: 'Olauncher Minimal AF',
      slug: 'olauncher-minimal',
      tagline: 'Extremely clean open-source text launcher for Android',
      description: 'Replaces noisy app icons and notification badges with a clean, monochrome text-based home screen to curb compulsive phone unlocks.',
      websiteUrl: 'https://github.com/tanujnotes/Olauncher',
      pricingModel: PricingModel.OPEN_SOURCE,
      platforms: ['ANDROID'],
      categoryId: catMap['minimalist-launchers'],
      isVerified: true,
      verifiedByUserId: admin.id,
      verifiedAt: new Date(),
      ratingAvg: 4.6,
      ratingCount: 15,
    },
    {
      title: 'Focus Keeper Community Edition',
      slug: 'focus-keeper-community',
      tagline: 'Simple standalone custom Pomodoro timer tool',
      description: 'A community-contributed lightweight timer utility currently pending staff verification and review.',
      websiteUrl: 'https://example.com/focus-keeper',
      pricingModel: PricingModel.FREE,
      platforms: ['BROWSER', 'WINDOWS'],
      categoryId: catMap['focus-timers'],
      isVerified: false,
      ratingAvg: 0.0,
      ratingCount: 0,
    },
  ];

  for (const res of seedResources) {
    if (!res.categoryId) continue;
    await prisma.resource.upsert({
      where: { slug: res.slug },
      update: {},
      create: res,
    });
  }
  console.log(`[Seed] Seeded ${seedResources.length} curated resources.`);

  // 4. Seed Multi-Platform Device Configuration & Educational Guides
  const seedGuides = [
    {
      title: 'How to Enable Scheduled Grayscale on iOS',
      slug: 'ios-scheduled-grayscale',
      platform: Platform.IOS,
      difficulty: Difficulty.BEGINNER,
      estimatedMinutes: 4,
      authorId: admin.id,
      isPublished: true,
      steps: [
        {
          stepNumber: 1,
          title: 'Navigate to Accessibility Settings',
          instruction: 'Open Settings on your iPhone, scroll down, and tap on "Accessibility".',
          tip: 'You can also search "Accessibility" in the Settings search bar at the top.',
        },
        {
          stepNumber: 2,
          title: 'Open Display & Text Size',
          instruction: 'Tap "Display & Text Size", then scroll down and select "Color Filters".',
        },
        {
          stepNumber: 3,
          title: 'Toggle Grayscale',
          instruction: 'Turn Color Filters ON and ensure "Grayscale" is selected as the active filter.',
          warning: 'Your screen will immediately become black and white. Don\'t panic, full color can be toggled at any time.',
        },
        {
          stepNumber: 4,
          title: 'Configure Triple-Click Shortcut',
          instruction: 'Return to Accessibility, scroll to the bottom, tap "Accessibility Shortcut", and check "Color Filters". You can now toggle grayscale instantly by triple-clicking the side power button.',
          tip: 'Turning your phone black-and-white eliminates the dopamine pull of bright red notification badges.',
        },
      ],
    },
    {
      title: 'Configuring Android Digital Wellbeing Focus Mode',
      slug: 'android-digital-wellbeing-focus-mode',
      platform: Platform.ANDROID,
      difficulty: Difficulty.BEGINNER,
      estimatedMinutes: 5,
      authorId: admin.id,
      isPublished: true,
      steps: [
        {
          stepNumber: 1,
          title: 'Open Digital Wellbeing & Parental Controls',
          instruction: 'Open the Android Settings app and select "Digital Wellbeing & parental controls".',
        },
        {
          stepNumber: 2,
          title: 'Locate Focus Mode',
          instruction: 'Scroll down to "Ways to disconnect" and tap on "Focus mode".',
        },
        {
          stepNumber: 3,
          title: 'Select Distracting Apps',
          instruction: 'Select all social media, instant messengers, and gaming apps you wish to pause during study hours.',
          tip: 'Keep communication apps like WhatsApp or Slack unpaused if required for group projects.',
        },
        {
          stepNumber: 4,
          title: 'Set a Daily Study Schedule',
          instruction: 'Tap "Set a schedule" and specify your core study block (e.g., Monday to Friday from 09:00 to 17:00).',
        },
        {
          stepNumber: 5,
          title: 'Add Quick Settings Tile',
          instruction: 'Swipe down twice from the top of your screen, edit quick tiles, and drag the "Focus mode" tile into view for instant 1-tap activation.',
        },
      ],
    },
    {
      title: 'Windows 11 Focus Sessions and Notification Silencing',
      slug: 'windows-11-focus-sessions',
      platform: Platform.WINDOWS,
      difficulty: Difficulty.BEGINNER,
      estimatedMinutes: 4,
      authorId: admin.id,
      isPublished: true,
      steps: [
        {
          stepNumber: 1,
          title: 'Launch Windows Clock',
          instruction: 'Press the Windows Key, type "Clock", and press Enter.',
        },
        {
          stepNumber: 2,
          title: 'Navigate to Focus Sessions',
          instruction: 'Select "Focus sessions" from the left navigation drawer.',
        },
        {
          stepNumber: 3,
          title: 'Configure Session Duration and Tasks',
          instruction: 'Set your target focus block (default is 45 minutes with a 5-minute break). Connect Microsoft To Do or Spotify if desired.',
          tip: 'Windows Focus automatically enables Do Not Disturb, muting toast notifications and badge counts on the taskbar.',
        },
        {
          stepNumber: 4,
          title: 'Hit Start Focus Session',
          instruction: 'Click "Start focus session". A minimized progress widget will sit on your desktop keeping you accountable.',
        },
      ],
    },
    {
      title: 'Configuring macOS Work Focus Filter & Screen Time Downtime',
      slug: 'macos-work-focus-downtime',
      platform: Platform.MACOS,
      difficulty: Difficulty.INTERMEDIATE,
      estimatedMinutes: 6,
      authorId: admin.id,
      isPublished: true,
      steps: [
        {
          stepNumber: 1,
          title: 'Open System Settings',
          instruction: 'Click the Apple menu (top left) and open "System Settings". Select "Focus".',
        },
        {
          stepNumber: 2,
          title: 'Create or Customize "Work" Focus',
          instruction: 'Click the Work focus preset. Under "Allowed Notifications", restrict calls and messages to emergency contacts only.',
        },
        {
          stepNumber: 3,
          title: 'Add Focus Filters for Safari and Mail',
          instruction: 'Scroll down to "Focus Filters", click "Add Filter", and select Safari to only show research tab groups.',
          tip: 'This hides personal shopping, social tabs, and personal email accounts while you study.',
        },
        {
          stepNumber: 4,
          title: 'Enable Screen Time Downtime',
          instruction: 'Go to System Settings -> Screen Time -> Downtime, and schedule downtime starting 1 hour before your intended sleep schedule.',
        },
      ],
    },
    {
      title: 'Distraction-Free Web Browsing via Content Blockers',
      slug: 'browser-distraction-free-workflow',
      platform: Platform.BROWSER,
      difficulty: Difficulty.BEGINNER,
      estimatedMinutes: 3,
      authorId: admin.id,
      isPublished: true,
      steps: [
        {
          stepNumber: 1,
          title: 'Install uBlock Origin',
          instruction: 'Visit your browser extension store (Chrome Web Store, Firefox Add-ons) and install "uBlock Origin".',
        },
        {
          stepNumber: 2,
          title: 'Enable Annoyance and Social Media Filters',
          instruction: 'Open uBlock Origin settings, go to "Filter lists", and expand "Annoyances". Check "EasyList Cookie" and "Fanboy\'s Annoyance".',
          tip: 'This blocks distracting cookie consent banners, push notification prompts, and newsletter popups.',
        },
        {
          stepNumber: 3,
          title: 'Use Element Zapper for Clean Reading',
          instruction: 'Click the uBlock Origin shield icon on any article and click the "lightning bolt" icon (Element Zapper) to permanently remove sticky sidebars and recommended video carousels.',
        },
      ],
    },
    {
      title: 'Advanced Hostfile & DNS Distraction Blocking for Linux',
      slug: 'linux-dns-hostfile-blocking-draft',
      platform: Platform.LINUX,
      difficulty: Difficulty.ADVANCED,
      estimatedMinutes: 10,
      authorId: admin.id,
      isPublished: false, // Unpublished draft to test draft filtering
      steps: [
        {
          stepNumber: 1,
          title: 'Edit /etc/hosts',
          instruction: 'Open terminal and run sudo nano /etc/hosts.',
        },
        {
          stepNumber: 2,
          title: 'Redirect Distracting Domains to Loopback',
          instruction: 'Add 127.0.0.1 twitter.com, reddit.com, youtube.com.',
        },
      ],
    },
  ];

  for (const guide of seedGuides) {
    await prisma.deviceGuide.upsert({
      where: { slug: guide.slug },
      update: {},
      create: guide,
    });
  }
  console.log(`[Seed] Seeded ${seedGuides.length} multi-platform guides.`);

  // 5. Seed Core Challenges (Phase 5)
  const seedChallenges = [
    {
      title: '7-Day Notification Detox',
      slug: 'notification-detox',
      description: JSON.stringify({
        overview: 'Reclaim your cognitive bandwidth by ruthlessly stripping away non-essential notification triggers.',
        activities: [
          { day: 1, title: 'Audit Distraction Triggers', instructions: 'Inspect your notification history and note the 3 apps that trigger the most mindless unlocks.' },
          { day: 2, title: 'Disable Lock Screen Banners', instructions: 'Turn off lock screen banners and badge counts for all social media and messaging channels.' },
          { day: 3, title: 'Silence Promotional Noise', instructions: 'Turn off push notifications from shopping, food delivery, and news apps completely.' },
          { day: 4, title: 'Establish Study Focus Filters', instructions: 'Set up an automated Do Not Disturb filter during your primary lecture and study blocks.' },
          { day: 5, title: 'Whitelist Essential Contacts', instructions: 'Configure emergency contact bypass so close family and urgent calls can still reach you.' },
          { day: 6, title: 'Half-Day Screen Silence Test', instructions: 'Experience a full afternoon with zero notification interruptions; check messages only on scheduled breaks.' },
          { day: 7, title: 'Reflection & Weekly Reclaim', instructions: 'Review your total phone pickups and reflect on your enhanced attention stamina.' },
        ],
      }),
      durationDays: 7,
      difficulty: Difficulty.BEGINNER,
      badgeIcon: 'BellOff',
      isPublished: true,
    },
    {
      title: '5-Day Deep Work Sprint',
      slug: 'deep-work-challenge',
      description: JSON.stringify({
        overview: 'Build stamina for uninterrupted academic focus through daily progressive Pomodoro sprints.',
        activities: [
          { day: 1, title: 'Single Sprint Baseline', instructions: 'Complete one 25-minute Pomodoro session on a single textbook chapter with zero tab switching.' },
          { day: 2, title: 'Write Intentions First', instructions: 'Write a specific digital intention before completing two 25-minute focus intervals.' },
          { day: 3, title: 'Physical Phone Separation', instructions: 'Place your phone in another room or inside a backpack while studying for 50 minutes.' },
          { day: 4, title: 'Peak Energy Focus Block', instructions: 'Schedule and execute a 75-minute study sprint during your peak cognitive morning hours.' },
          { day: 5, title: 'Distraction Log Triage', instructions: 'Review your logged distraction counts and celebrate entering reliable flow states.' },
        ],
      }),
      durationDays: 5,
      difficulty: Difficulty.INTERMEDIATE,
      badgeIcon: 'Flame',
      isPublished: true,
    },
    {
      title: '7-Day Digital Sunset Challenge',
      slug: 'digital-sunset-challenge',
      description: JSON.stringify({
        overview: 'Protect your circadian rhythm and sleep quality by powering down interactive screens before bed.',
        activities: [
          { day: 1, title: 'Set Bedtime Screen Boundary', instructions: 'Establish a target bedtime and turn off all monitors and phones 20 minutes before lights out.' },
          { day: 2, title: 'Bedroom Charging Ban', instructions: 'Plug your phone charger across the bedroom or outside the bedroom door entirely.' },
          { day: 3, title: 'Circadian Color Shift', instructions: 'Enable Night Shift or warm blue-light filters starting at 7:00 PM.' },
          { day: 4, title: 'Replace Doomscrolling with Reading', instructions: 'Read 15 pages of a physical book or listen to calming audio before sleep.' },
          { day: 5, title: 'No Laptops in Bed', instructions: 'Designate your bed as a screen-free sanctum strictly for sleep and rest.' },
          { day: 6, title: 'Full 30-Minute Sunset', instructions: 'Execute a full 30-minute screen-free wind-down with journaling and gentle stretching.' },
          { day: 7, title: 'Sleep Quality Assessment', instructions: 'Evaluate your sleep latency and morning freshness after a full week of digital sunsets.' },
        ],
      }),
      durationDays: 7,
      difficulty: Difficulty.BEGINNER,
      badgeIcon: 'Moon',
      isPublished: true,
    },
    {
      title: '7-Day Mindful Screen-Time Challenge',
      slug: 'mindful-screen-time',
      description: JSON.stringify({
        overview: 'Develop conscious awareness of your device usage metrics and build healthy daily screen-time budgets.',
        activities: [
          { day: 1, title: 'Establish Your Baseline', instructions: 'Check your built-in screen-time report and log your baseline total minutes.' },
          { day: 2, title: 'App Limit Configuration', instructions: 'Identify your top time-sink application and set an active 45-minute daily limit for it.' },
          { day: 3, title: 'Introduce Friction', instructions: 'Move your most compulsive app off the home screen and into a nested folder.' },
          { day: 4, title: 'Screen-Free Meals', instructions: 'Eat lunch and dinner without looking at any screen or playing videos in the background.' },
          { day: 5, title: 'Productive vs Distracting Log', instructions: 'Log today\'s breakdown in the Screen-Time Tracker and analyze your ratio.' },
          { day: 6, title: 'Stay Under Daily Goal', instructions: 'Maintain your total screen time under your target daily limit for the entire 24 hours.' },
          { day: 7, title: 'Reclaim Progress Celebration', instructions: 'Compare your Day 1 baseline against Day 7 and celebrate your reclaimed hours.' },
        ],
      }),
      durationDays: 7,
      difficulty: Difficulty.BEGINNER,
      badgeIcon: 'Smartphone',
      isPublished: true,
    },
    {
      title: 'Weekend Screen-Lite Challenge',
      slug: 'weekend-offline-challenge',
      description: JSON.stringify({
        overview: 'An intensive 3-day challenge designed to disconnect from academic screens and reconnect with physical presence.',
        activities: [
          { day: 1, title: 'Friday Night Shutdown', instructions: 'Complete your evening planner shutdown by 9:00 PM and close all university browser tabs.' },
          { day: 2, title: 'Saturday Outdoor Immersion', instructions: 'Cap total device screen time to under 60 minutes and spend the afternoon outdoors or with peers.' },
          { day: 3, title: 'Sunday Mindful Re-Entry', instructions: 'Plan the upcoming week\'s study blocks on paper or in the daily planner before checking social feeds.' },
        ],
      }),
      durationDays: 3,
      difficulty: Difficulty.ADVANCED,
      badgeIcon: 'Compass',
      isPublished: true,
    },
  ];

  for (const challenge of seedChallenges) {
    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: {},
      create: challenge,
    });
  }
  console.log(`[Seed] Seeded ${seedChallenges.length} wellness challenges.`);

  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
