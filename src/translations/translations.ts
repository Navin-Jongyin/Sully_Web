export type Language = 'en' | 'th';

export interface Translations {
  common: {
    home: string;
    about: string;
    achievements: string;
    news: string;
    contact: string;
    courses: string;
    onlineCourses: string;
    shop: string;
    onlineTest: string;
    account: string;
    login: string;
    dashboard: string;
    admin: string;
    terms: string;
    privacy: string;
    backToHome: string;
    pageNotFound: string;
    pageNotFoundDesc: string;
    loading: string;
    ok: string;
    cancel: string;
    noticeTitle: string;
    confirmTitle: string;
  };
  home: {
    eyebrow: string;
    heroTitle: string;
    heroDescription: string;
    bookInterview: string;
    aptitudePractice: string;
    contactUs: string;
    studentsPassed: string;
    estSince: string;
    studentVoiceEyebrow: string;
    studentVoiceTitle: string;
    studentVoiceDesc: string;
    noMessages: string;
    whyChooseUsEyebrow: string;
    whyChooseUsTitle: string;
    supportiveLearning: string;
    supportiveLearningDesc: string;
    openCommunity: string;
    openCommunityDesc: string;
    tailoredExpertise: string;
    tailoredExpertiseDesc: string;
    successStoriesEyebrow: string;
    successStoriesTitle: string;
    examPerformance: string;
    yearResults: string;
    successMetrics: string;
    noDataRecorded: string;
    airlinePartnersEyebrow: string;
    airlinePartnersTitle: string;
    airlinePartnersDesc: string;
    latestUpdatesEyebrow: string;
    latestUpdatesTitle: string;
    readMore: string;
    noNewsUpdates: string;
    getInTouchEyebrow: string;
    getInTouchTitle: string;
    getInTouchDesc: string;
    addLine: string;
    aptitudeEyebrow: string;
    aptitudeTitle: string;
    aptitudeDesc: string;
    aptitudeOpen: string;
    aptitudeRateTitle: string;
    aptitudeCommentPlaceholder: string;
    aptitudeSubmit: string;
    aptitudeUpdate: string;
    aptitudeSignIn: string;
    aptitudeNoReviews: string;
    aptitudeReviews: string;
  };
  footer: {
    copyright: string;
  };
  coursesPage: {
    eyebrow: string;
    title: string;
    description: string;
    catStudentPilot: string;
    catQualifiedPilot: string;
    catAtc: string;
    catOthers: string;
    noCoursesInCategory: string;
    programOverview: string;
    detailsComingSoon: string;
    totalTuitionFee: string;
    enrollNow: string;
    closeModal: string;
  };
  onlineTest: {
    eyebrow: string;
    title: string;
    description: string;
    loginTitle: string;
    loginDescription: string;
    signInWithGoogle: string;
    signingIn: string;
    signOut: string;
    signingOut: string;
    checkingSession: string;
    comingSoon: string;
    welcomeBack: string;
    dashboardSubtitle: string;
    comingSoonBadge: string;
    startButton: string;
    testCompleted: string;
    testAlreadyTaken: string;
    startingTest: string;
    allCategories: string;
    catStudentPilotTitle: string;
    catStudentPilotDesc: string;
    catQualifiedPilotTitle: string;
    catQualifiedPilotDesc: string;
    catAtcTitle: string;
    catAtcDesc: string;
    noTestsInCategory: string;
    startFailed: string;
    testCategoriesAria: string;
  };
  authForm: {
    email: string;
    password: string;
    signIn: string;
    createAccount: string;
    pleaseWait: string;
    noAccount: string;
    hasAccount: string;
    or: string;
    loginDescription: string;
    welcomeEyebrow: string;
    welcomeTitle: string;
    welcomeDesc: string;
    invalidEmail: string;
    userDisabled: string;
    invalidCredentials: string;
    emailInUse: string;
    weakPassword: string;
    tooManyRequests: string;
    popupClosed: string;
    networkError: string;
    genericError: string;
  };
  dashboard: {
    studentPortal: string;
    eyebrow: string;
    welcome: string;
    overview: string;
    myCourses: string;
    orders: string;
    profile: string;
    backToSite: string;
    statCourses: string;
    statOrders: string;
    statShop: string;
    browseCoursesHint: string;
    browseShopHint: string;
    continueLearning: string;
    viewAll: string;
    fromShop: string;
    profileNote: string;
    studentInfo: string;
    studentInfoEmpty: string;
    studentInfoLoading: string;
    personalInfo: string;
    educationInfo: string;
    workInfo: string;
    healthInfo: string;
    editInfo: string;
    navAria: string;
    studentFallback: string;
  };
  commerce: {
    shopEyebrow: string;
    shopTitle: string;
    shopDesc: string;
    onlineCoursesEyebrow: string;
    onlineCoursesTitle: string;
    onlineCoursesDesc: string;
    loginToBuy: string;
    loginToViewAssigned: string;
    goToAccount: string;
    buyNow: string;
    processing: string;
    outOfStock: string;
    noMerchandise: string;
    noOnlineCourses: string;
    purchaseError: string;
    owned: string;
    assigned: string;
    assignedOnly: string;
    yourCourses: string;
    otherCourses: string;
    previousLesson: string;
    nextLesson: string;
    markComplete: string;
    percentComplete: string;
    noLessonsYet: string;
    lessons: string;
    watch: string;
    accountEyebrow: string;
    accountTitle: string;
    accountLoginTitle: string;
    accountLoginDesc: string;
    myCourses: string;
    noOwnedCourses: string;
    browseCourses: string;
    orderHistory: string;
    noOrders: string;
    courseNotFound: string;
    backToCourses: string;
    accessLocked: string;
    accessLockedDesc: string;
    muxPlaceholder: string;
    muxHint: string;
    videoPending: string;
    checkoutDetailsTitle: string;
    checkoutDetailsDesc: string;
    backToShop: string;
    shippingAddressTitle: string;
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
    invoiceTitle: string;
    needsInvoice: string;
    invoiceName: string;
    taxId: string;
    companyName: string;
    branch: string;
    continueToPayment: string;
    orderSummary: string;
    quantity: string;
    cartTotal: string;
    checkoutSummaryHint: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      home: 'Home',
      about: 'About',
      achievements: 'Achievements',
      news: 'News',
      contact: 'Contact',
      courses: 'Courses',
      onlineCourses: 'Online Courses',
      shop: 'Shop',
      onlineTest: 'Online Test',
      account: 'Account',
      login: 'Login',
      dashboard: 'Dashboard',
      admin: 'Admin',
      terms: 'Terms',
      privacy: 'Privacy',
      backToHome: 'Back to Home',
      pageNotFound: 'Page not found',
      pageNotFoundDesc: 'The page you\'re looking for doesn\'t exist.',
      loading: 'Loading…',
      ok: 'OK',
      cancel: 'Cancel',
      noticeTitle: 'Notice',
      confirmTitle: 'Confirm',
    },
    home: {
      eyebrow: 'Student Pilot',
      heroTitle: 'Your Journey to the Flight Deck Starts Here.',
      heroDescription: 'Sully Academy provides elite ground school preparation for student pilots and aviation professionals in Thailand. Master the knowledge, pass the exams, and launch your career.',
      bookInterview: 'Book Interview',
      aptitudePractice: 'Aptitude Practices',
      contactUs: 'Contact Us',
      studentsPassed: 'Students Passed',
      estSince: 'Est. Since',
      studentVoiceEyebrow: 'Student Voice',
      studentVoiceTitle: 'Message from our Students',
      studentVoiceDesc: 'Hear from the pilots who have trained with us and achieved their aviation dreams.',
      noMessages: 'No messages yet.',
      whyChooseUsEyebrow: 'Why Choose Us',
      whyChooseUsTitle: 'Built for Student Pilots',
      supportiveLearning: 'Supportive Learning Environment',
      supportiveLearningDesc: 'Friendly fellow candidates who are always ready to help you with any questions you may have.',
      openCommunity: 'Open Community',
      openCommunityDesc: 'Direct access to a network of seniors and alumni currently flying in major airlines, providing real-world insights and career mentorship.',
      tailoredExpertise: 'Tailored Local Expertise',
      tailoredExpertiseDesc: 'Master the specific knowledge and standards required for Thai airline screenings (TG, VZ, FD) and CAAT regulations with our localized curriculum.',
      successStoriesEyebrow: 'Success Stories',
      successStoriesTitle: 'Our Track Record',
      examPerformance: 'Exam Performance',
      yearResults: '{year} Results',
      successMetrics: 'Success metrics for',
      noDataRecorded: 'No data recorded for this year yet.',
      airlinePartnersEyebrow: 'Placement',
      airlinePartnersTitle: 'Airlines where our students join',
      airlinePartnersDesc: 'Sully Academy alumni fly with Thailand\'s leading carriers after screening and training.',
      latestUpdatesEyebrow: 'Latest Updates',
      latestUpdatesTitle: 'News & Announcements',
      readMore: 'Read More',
      noNewsUpdates: 'No news updates at the moment. Check back soon!',
      getInTouchEyebrow: 'Get In Touch',
      getInTouchTitle: 'Ready to Start Your Journey?',
      getInTouchDesc: 'Have questions about our courses or the admission process? Our experienced instructors are ready to help guide you on the Line Official account.',
      addLine: 'Add Line Official @sully2017',
      aptitudeEyebrow: 'Aptitude practice',
      aptitudeTitle: 'Practice airline aptitude tests',
      aptitudeDesc: 'Prepare for airline screening with timed practice on Sully Test, then tell other students how it went.',
      aptitudeOpen: 'Open Sully Test',
      aptitudeRateTitle: 'Rate Sully Test',
      aptitudeCommentPlaceholder: 'How did the practice tests help you?',
      aptitudeSubmit: 'Post review',
      aptitudeUpdate: 'Update review',
      aptitudeSignIn: 'Sign in to leave a rating',
      aptitudeNoReviews: 'No reviews yet. Be the first to rate it.',
      aptitudeReviews: 'Reviews',
    },
    footer: {
      copyright: 'All rights reserved.',
    },
    coursesPage: {
      eyebrow: 'Curriculum',
      title: 'Our Courses',
      description: 'At Sully Academy we offer different courses across aviation fields to meet your goals.',
      catStudentPilot: 'Student Pilot',
      catQualifiedPilot: 'Qualified Pilot',
      catAtc: 'ATC',
      catOthers: 'Others',
      noCoursesInCategory: 'No courses available in this category yet. Check back soon!',
      programOverview: 'Program Overview',
      detailsComingSoon: 'Program details coming soon.',
      totalTuitionFee: 'Total Tuition Fee',
      enrollNow: 'Enroll Now',
      closeModal: 'Close modal',
    },
    onlineTest: {
      eyebrow: 'Practice',
      title: 'Online Test',
      description: 'Prepare for airline aptitude and knowledge exams with our online practice tests.',
      loginTitle: 'Sign in to continue',
      loginDescription: 'Use your Google account to access online tests.',
      signInWithGoogle: 'Sign in with Google',
      signingIn: 'Signing in…',
      signOut: 'Sign out',
      signingOut: 'Signing out…',
      checkingSession: 'Checking session…',
      comingSoon: 'Practice tests will appear here soon. You are signed in and ready to go.',
      welcomeBack: 'Welcome back, {name}',
      dashboardSubtitle: 'Choose a practice test to sharpen your skills for airline screening.',
      comingSoonBadge: 'Coming soon',
      startButton: 'Start',
      testCompleted: 'Completed',
      testAlreadyTaken: 'You have already taken this test.',
      startingTest: 'Starting…',
      allCategories: 'All',
      catStudentPilotTitle: 'Student Pilot',
      catStudentPilotDesc: 'Ground school knowledge, aptitude drills, and screening prep for aspiring pilots.',
      catQualifiedPilotTitle: 'Qualified Pilot',
      catQualifiedPilotDesc: 'Type rating, airline screening, and career advancement tests for licensed pilots.',
      catAtcTitle: 'ATC',
      catAtcDesc: 'Air traffic control aptitude, English, and procedural knowledge practice tests.',
      noTestsInCategory: 'No tests available in this category yet.',
      startFailed: 'Could not start the test. Please try again.',
      testCategoriesAria: 'Test categories',
    },
    authForm: {
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in',
      createAccount: 'Create account',
      pleaseWait: 'Please wait…',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      or: 'or',
      loginDescription: 'Sign in with any email and password, or continue with Google.',
      welcomeEyebrow: 'Student pilots',
      welcomeTitle: 'Your journey to the flight deck starts here.',
      welcomeDesc: 'Access your courses, shop, and account in one place.',
      invalidEmail: 'Please enter a valid email address.',
      userDisabled: 'This account has been disabled.',
      invalidCredentials: 'Incorrect email or password.',
      emailInUse: 'An account with this email already exists. Try signing in.',
      weakPassword: 'Password must be at least 6 characters.',
      tooManyRequests: 'Too many attempts. Please try again later.',
      popupClosed: 'Sign-in was cancelled. Please try again.',
      networkError: 'Network error. Check your connection and try again.',
      genericError: 'Sign in failed. Please try again.',
    },
    dashboard: {
      studentPortal: 'Student portal',
      eyebrow: 'Dashboard',
      welcome: 'Welcome back, {name}',
      overview: 'Overview',
      myCourses: 'My courses',
      orders: 'Orders',
      profile: 'Profile',
      backToSite: 'Main site',
      statCourses: 'Courses owned',
      statOrders: 'Paid orders',
      statShop: 'Shop items',
      browseCoursesHint: 'Browse and unlock video lessons',
      browseShopHint: 'Official Sully Academy merch',
      continueLearning: 'Continue learning',
      viewAll: 'View all',
      fromShop: 'From the shop',
      profileNote: 'Your account is linked to this email for courses and purchases.',
      studentInfo: 'Student information',
      studentInfoEmpty: 'You have not submitted your student information yet.',
      studentInfoLoading: 'Loading your information…',
      personalInfo: 'Personal',
      educationInfo: 'Education',
      workInfo: 'Work',
      healthInfo: 'Health',
      editInfo: 'Edit info',
      navAria: 'Dashboard',
      studentFallback: 'Student',
    },
    commerce: {
      shopEyebrow: 'Merch',
      shopTitle: 'Shop',
      shopDesc: 'Official Sully Academy merchandise. Sign in to purchase.',
      onlineCoursesEyebrow: 'Learn online',
      onlineCoursesTitle: 'Online Courses',
      onlineCoursesDesc: 'Courses are opened from the admin Assign tab. Sign in to watch the courses assigned to you.',
      loginToBuy: 'Sign in to purchase courses and merchandise.',
      loginToViewAssigned: 'Sign in to watch the online courses assigned to your account.',
      goToAccount: 'Sign in',
      buyNow: 'Buy now',
      processing: 'Processing…',
      outOfStock: 'Out of stock',
      noMerchandise: 'No merchandise listed yet.',
      noOnlineCourses: 'No online courses published yet.',
      purchaseError: 'Could not start checkout. Payment service may not be configured yet.',
      owned: 'Owned',
      assigned: 'Assigned',
      assignedOnly: 'Assigned by admin',
      yourCourses: 'Your courses',
      otherCourses: 'Other courses',
      previousLesson: 'Previous',
      nextLesson: 'Next',
      markComplete: 'Mark complete',
      percentComplete: '{percent}% complete',
      noLessonsYet: 'No lessons have been published yet.',
      lessons: 'lessons',
      watch: 'Watch',
      accountEyebrow: 'My account',
      accountTitle: 'Account',
      accountLoginTitle: 'Sign in to your account',
      accountLoginDesc: 'Sign in with any email to manage purchases, courses, and orders.',
      myCourses: 'My courses',
      noOwnedCourses: 'No online courses have been assigned to this account yet.',
      browseCourses: 'Browse online courses',
      orderHistory: 'Order history',
      noOrders: 'No orders yet. Purchases will appear here after Stripe checkout is live.',
      courseNotFound: 'Course not found.',
      backToCourses: 'Back to courses',
      accessLocked: 'Course locked',
      accessLockedDesc: 'This course is available after an admin assigns it to your account.',
      muxPlaceholder: 'Mux player placeholder — replace with Mux Player when the API service is ready.',
      muxHint: 'See docs/MUX.md for integration steps.',
      videoPending: 'Video not uploaded yet (Mux playback ID is still a placeholder).',
      checkoutDetailsTitle: 'Checkout details',
      checkoutDetailsDesc: 'Add a shipping address before payment. Add invoice details if you need a tax invoice.',
      backToShop: 'Back to shop',
      shippingAddressTitle: 'Shipping address',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      addressLine1: 'Address line 1',
      addressLine2: 'Address line 2',
      district: 'District',
      province: 'Province',
      postalCode: 'Postal code',
      country: 'Country',
      invoiceTitle: 'Tax invoice',
      needsInvoice: 'I need a tax invoice',
      invoiceName: 'Invoice name',
      taxId: 'Tax ID',
      companyName: 'Company name',
      branch: 'Branch',
      continueToPayment: 'Continue to payment',
      orderSummary: 'Order summary',
      quantity: 'Qty',
      cartTotal: 'Total',
      checkoutSummaryHint: 'Prices are confirmed on the server before Stripe checkout opens.',
    },
  },
  th: {
    common: {
      home: 'หน้าแรก',
      about: 'เกี่ยวกับเรา',
      achievements: 'ผลงาน',
      news: 'ข่าวสาร',
      contact: 'ติดต่อเรา',
      courses: 'หลักสูตร',
      onlineCourses: 'คอร์สออนไลน์',
      shop: 'ร้านค้า',
      onlineTest: 'แบบทดสอบออนไลน์',
      account: 'บัญชี',
      login: 'เข้าสู่ระบบ',
      dashboard: 'แดชบอร์ด',
      admin: 'แอดมิน',
      terms: 'ข้อกำหนด',
      privacy: 'นโยบายความเป็นส่วนตัว',
      backToHome: 'กลับหน้าแรก',
      pageNotFound: 'ไม่พบหน้านี้',
      pageNotFoundDesc: 'ไม่พบหน้าที่คุณกำลังค้นหา',
      loading: 'กำลังโหลด…',
      ok: 'ตกลง',
      cancel: 'ยกเลิก',
      noticeTitle: 'แจ้งเตือน',
      confirmTitle: 'ยืนยัน',
    },
    home: {
      eyebrow: 'ศิษย์การบิน',
      heroTitle: 'เส้นทางสู่ห้องนักบิน เริ่มต้นที่ Sully Academy',
      heroDescription: 'Sully Academy เตรียมความพร้อมเพื่อเข้าสู่อาชีพการบิน ระดับมืออาชีพสำหรับนักเรียน นักบินและผู้ประกอบวิชาชีพด้านการบินในประเทศไทย ตั้งรากฐานความรู้เพื่อผ่านการสอบและก้าวสู่อาชีพในฝัน',
      bookInterview: 'จองนัดสัมภาษณ์',
      aptitudePractice: 'ฝึกทดสอบความถนัด',
      contactUs: 'ติดต่อเรา',
      studentsPassed: 'ผู้ผ่านการคัดเลือก',
      estSince: 'เริ่มสอนมาตั้งแต่ปี',
      studentVoiceEyebrow: 'เสียงจากศิษย์เก่า',
      studentVoiceTitle: 'จากผู้เรียนของเรา',
      studentVoiceDesc: 'รับฟังจากนักบินที่เรียนกับเราและประสบความสำเร็จในการสอบ',
      noMessages: 'ยังไม่มีข้อความ',
      whyChooseUsEyebrow: 'ทำไมต้องเรา',
      whyChooseUsTitle: 'ออกแบบมาเพื่อนักเรียนโดยเฉพาะในทุกๆอาชีพ',
      supportiveLearning: 'บรรยากาศเรียนรู้ที่เป็นกันเอง',
      supportiveLearningDesc: 'ทีมครูผู้สอน พร้อมช่วยตอบทุกคำถามที่คุณสงสัย',
      openCommunity: 'สังคมในโรงเรียน',
      openCommunityDesc: 'เชื่อมต่อกับรุ่นพี่และศิษย์เก่าที่บินอยู่กับสายการบิน ที่มาแบ่งปันประสบการณ์จริงและให้คำปรึกษาด้านอาชีพ',
      tailoredExpertise: 'เชี่ยวชาญเฉพาะทางในไทย',
      tailoredExpertiseDesc: 'ด้วยประสบการณ์การสอนมานานหลายปี และผลงานนักเรียนที่สอบติดไปจำนวนมาก ที่ Sully Academy สามารถชี้แนะนักเรียนแต่ละคนได้ตรงจุด',
      successStoriesEyebrow: 'เรื่องราวความสำเร็จ',
      successStoriesTitle: 'ผลงานของเรา',
      examPerformance: 'ผลการสอบ',
      yearResults: 'ผลงานปี {year}',
      successMetrics: 'สถิติประจำปี',
      noDataRecorded: 'ยังไม่มีข้อมูลสำหรับปีนี้',
      airlinePartnersEyebrow: 'เส้นทางอาชีพ',
      airlinePartnersTitle: 'สายการบินที่ศิษย์ของเราไปทำงาน',
      airlinePartnersDesc: 'ศิษย์เก่า Sully Academy ผ่านการคัดเลือกและบินกับสายการบินชั้นนำของไทย',
      latestUpdatesEyebrow: 'อัปเดตล่าสุด',
      latestUpdatesTitle: 'ข่าวและประกาศ',
      readMore: 'อ่านต่อ',
      noNewsUpdates: 'ยังไม่มีข่าวใหม่ในขณะนี้ กลับมาดูอีกครั้งเร็วๆ นี้นะ',
      getInTouchEyebrow: 'ติดต่อเรา',
      getInTouchTitle: 'พร้อมเริ่มต้นเส้นทางการบินแล้วหรือยัง?',
      getInTouchDesc: 'มีคำถามเรื่องหลักสูตรหรือการสมัครเรียน ทีมงานครู พร้อมให้คำปรึกษาผ่าน Line Official',
      addLine: 'ติดต่อทาง Line @sully2017',
      aptitudeEyebrow: 'ฝึกทดสอบความถนัด',
      aptitudeTitle: 'ฝึกทำข้อสอบความถนัดสายการบิน',
      aptitudeDesc: 'เตรียมตัวสอบคัดเลือกด้วยแบบทดสอบจับเวลาบน Sully Test แล้วบอกเพื่อนๆ ว่าเป็นอย่างไร',
      aptitudeOpen: 'เปิด Sully Test',
      aptitudeRateTitle: 'ให้คะแนน Sully Test',
      aptitudeCommentPlaceholder: 'แบบทดสอบช่วยคุณได้อย่างไร',
      aptitudeSubmit: 'ส่งรีวิว',
      aptitudeUpdate: 'อัปเดตรีวิว',
      aptitudeSignIn: 'เข้าสู่ระบบเพื่อให้คะแนน',
      aptitudeNoReviews: 'ยังไม่มีรีวิว เป็นคนแรกที่ให้คะแนน',
      aptitudeReviews: 'รีวิว',
    },
    footer: {
      copyright: 'สงวนลิขสิทธิ์',
    },
    coursesPage: {
      eyebrow: 'หลักสูตร',
      title: 'คอร์สของเรา',
      description: 'ที่ Sully Academy เรามีคอร์สหลากหลายสาขาด้านการบิน เพื่อตอบโจทย์เป้าหมายของคุณ',
      catStudentPilot: 'Student Pilot',
      catQualifiedPilot: 'Qualified Pilot',
      catAtc: 'ATC',
      catOthers: 'อื่นๆ',
      noCoursesInCategory: 'ยังไม่มีคอร์สในหมวดนี้ กลับมาดูอีกครั้งเร็วๆ นี้นะ',
      programOverview: 'ภาพรวมหลักสูตร',
      detailsComingSoon: 'รายละเอียดหลักสูตรจะมีให้เร็วๆ นี้',
      totalTuitionFee: 'ค่าเล่าเรียนทั้งหมด',
      enrollNow: 'สมัครเรียน',
      closeModal: 'ปิดหน้าต่าง',
    },
    onlineTest: {
      eyebrow: 'ฝึกฝน',
      title: 'แบบทดสอบออนไลน์',
      description: 'เตรียมความพร้อมสำหรับการสอบความถนัดและความรู้ด้านการบิน ด้วยแบบทดสอบออนไลน์ของเรา',
      loginTitle: 'เข้าสู่ระบบเพื่อดำเนินการต่อ',
      loginDescription: 'ใช้บัญชี Google ของคุณเพื่อเข้าถึงแบบทดสอบออนไลน์',
      signInWithGoogle: 'เข้าสู่ระบบด้วย Google',
      signingIn: 'กำลังเข้าสู่ระบบ…',
      signOut: 'ออกจากระบบ',
      signingOut: 'กำลังออกจากระบบ…',
      checkingSession: 'กำลังตรวจสอบสถานะ…',
      comingSoon: 'แบบทดสอบจะแสดงที่นี่เร็วๆ นี้ คุณเข้าสู่ระบบเรียบร้อยแล้ว',
      welcomeBack: 'ยินดีต้อนรับ, {name}',
      dashboardSubtitle: 'เลือกแบบทดสอบเพื่อฝึกฝนทักษะสำหรับการสอบคัดเลือกสายการบิน',
      comingSoonBadge: 'เร็วๆ นี้',
      startButton: 'เริ่ม',
      testCompleted: 'ทำแล้ว',
      testAlreadyTaken: 'คุณทำแบบทดสอบนี้ไปแล้ว',
      startingTest: 'กำลังเริ่ม…',
      allCategories: 'ทั้งหมด',
      catStudentPilotTitle: 'Student Pilot',
      catStudentPilotDesc: 'ความรู้ภาคพื้น แบบทดสอบความถนัด และการเตรียมสอบคัดเลือกสำหรับผู้ที่อยากเป็นนักบิน',
      catQualifiedPilotTitle: 'Qualified Pilot',
      catQualifiedPilotDesc: 'แบบทดสอบ Type Rating การคัดเลือกสายการบิน และการพัฒนาอาชีพสำหรับนักบินที่มีใบอนุญาตแล้ว',
      catAtcTitle: 'ATC',
      catAtcDesc: 'แบบทดสอบความถนัด ภาษาอังกฤษ และความรู้ด้านขั้นตอนการควบคุมการจราจรทางอากาศ',
      noTestsInCategory: 'ยังไม่มีแบบทดสอบในหมวดนี้',
      startFailed: 'ไม่สามารถเริ่มแบบทดสอบได้ กรุณาลองใหม่',
      testCategoriesAria: 'หมวดแบบทดสอบ',
    },
    authForm: {
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      signIn: 'เข้าสู่ระบบ',
      createAccount: 'สร้างบัญชี',
      pleaseWait: 'กรุณารอสักครู่…',
      noAccount: 'ยังไม่มีบัญชี?',
      hasAccount: 'มีบัญชีอยู่แล้ว?',
      or: 'หรือ',
      loginDescription: 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน หรือใช้ Google',
      welcomeEyebrow: 'สำหรับศิษย์การบิน',
      welcomeTitle: 'เส้นทางสู่ห้องนักบิน เริ่มต้นที่นี่',
      welcomeDesc: 'เข้าถึงคอร์ส ร้านค้า และบัญชีของคุณในที่เดียว',
      invalidEmail: 'กรุณากรอกอีเมลให้ถูกต้อง',
      userDisabled: 'บัญชีนี้ถูกระงับการใช้งาน',
      invalidCredentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      emailInUse: 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน',
      weakPassword: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      tooManyRequests: 'พยายามหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง',
      popupClosed: 'ยกเลิกการเข้าสู่ระบบแล้ว กรุณาลองใหม่',
      networkError: 'เกิดข้อผิดพลาดเครือข่าย ตรวจสอบการเชื่อมต่อแล้วลองใหม่',
      genericError: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่',
    },
    dashboard: {
      studentPortal: 'พอร์ทัลนักเรียน',
      eyebrow: 'แดชบอร์ด',
      welcome: 'ยินดีต้อนรับ, {name}',
      overview: 'ภาพรวม',
      myCourses: 'คอร์สของฉัน',
      orders: 'คำสั่งซื้อ',
      profile: 'โปรไฟล์',
      backToSite: 'หน้าเว็บหลัก',
      statCourses: 'คอร์สที่มี',
      statOrders: 'คำสั่งซื้อที่ชำระแล้ว',
      statShop: 'สินค้าในร้าน',
      browseCoursesHint: 'เลือกและปลดล็อกวิดีโอบทเรียน',
      browseShopHint: 'สินค้าอย่างเป็นทางการของ Sully Academy',
      continueLearning: 'เรียนต่อ',
      viewAll: 'ดูทั้งหมด',
      fromShop: 'จากร้านค้า',
      profileNote: 'บัญชีของคุณเชื่อมกับอีเมลนี้สำหรับคอร์สและการสั่งซื้อ',
      studentInfo: 'ข้อมูลผู้สมัคร',
      studentInfoEmpty: 'ยังไม่มีข้อมูลผู้สมัคร',
      studentInfoLoading: 'กำลังโหลดข้อมูล…',
      personalInfo: 'ข้อมูลส่วนตัว',
      educationInfo: 'การศึกษา',
      workInfo: 'การทำงาน',
      healthInfo: 'สุขภาพ',
      editInfo: 'แก้ไขข้อมูล',
      navAria: 'แดชบอร์ด',
      studentFallback: 'นักเรียน',
    },
    commerce: {
      shopEyebrow: 'สินค้า',
      shopTitle: 'ร้านค้า',
      shopDesc: 'สินค้าอย่างเป็นทางการของ Sully Academy เข้าสู่ระบบเพื่อสั่งซื้อ',
      onlineCoursesEyebrow: 'เรียนออนไลน์',
      onlineCoursesTitle: 'คอร์สออนไลน์',
      onlineCoursesDesc: 'คอร์สจะเปิดจากแท็บมอบหมายในแอดมิน เข้าสู่ระบบเพื่อดูคอร์สที่ได้รับมอบหมาย',
      loginToBuy: 'เข้าสู่ระบบเพื่อซื้อคอร์สและสินค้า',
      loginToViewAssigned: 'เข้าสู่ระบบเพื่อดูคอร์สออนไลน์ที่มอบหมายให้บัญชีนี้',
      goToAccount: 'เข้าสู่ระบบ',
      buyNow: 'ซื้อเลย',
      processing: 'กำลังดำเนินการ…',
      outOfStock: 'สินค้าหมด',
      noMerchandise: 'ยังไม่มีสินค้า',
      noOnlineCourses: 'ยังไม่มีคอร์สออนไลน์',
      purchaseError: 'ไม่สามารถเริ่มชำระเงินได้ อาจยังไม่ได้ตั้งค่าบริการชำระเงิน',
      owned: 'ซื้อแล้ว',
      assigned: 'ได้รับมอบหมาย',
      assignedOnly: 'มอบหมายโดยแอดมิน',
      yourCourses: 'คอร์สของคุณ',
      otherCourses: 'คอร์สอื่น',
      previousLesson: 'ก่อนหน้า',
      nextLesson: 'ถัดไป',
      markComplete: 'ทำเครื่องหมายว่าเรียนจบ',
      percentComplete: 'เรียนแล้ว {percent}%',
      noLessonsYet: 'ยังไม่มีบทเรียนที่เผยแพร่',
      lessons: 'บทเรียน',
      watch: 'ดู',
      accountEyebrow: 'บัญชีของฉัน',
      accountTitle: 'บัญชี',
      accountLoginTitle: 'เข้าสู่ระบบบัญชีของคุณ',
      accountLoginDesc: 'เข้าสู่ระบบด้วยอีเมลเพื่อจัดการการซื้อ คอร์ส และคำสั่งซื้อ',
      myCourses: 'คอร์สของฉัน',
      noOwnedCourses: 'ยังไม่มีคอร์สออนไลน์ที่มอบหมายให้บัญชีนี้',
      browseCourses: 'ดูคอร์สออนไลน์',
      orderHistory: 'ประวัติคำสั่งซื้อ',
      noOrders: 'ยังไม่มีคำสั่งซื้อ จะแสดงที่นี่เมื่อเชื่อมต่อ Stripe แล้ว',
      courseNotFound: 'ไม่พบคอร์ส',
      backToCourses: 'กลับไปคอร์ส',
      accessLocked: 'คอร์สถูกล็อก',
      accessLockedDesc: 'คอร์สนี้จะเปิดได้เมื่อแอดมินมอบหมายให้บัญชีของคุณ',
      muxPlaceholder: 'ตัวเล่น Mux ชั่วคราว — เปลี่ยนเป็น Mux Player เมื่อ API พร้อม',
      muxHint: 'ดู docs/MUX.md สำหรับขั้นตอนการเชื่อมต่อ',
      videoPending: 'ยังไม่อัปโหลดวิดีโอ (Mux Playback ID ยังเป็น placeholder)',
      checkoutDetailsTitle: 'ข้อมูลก่อนชำระเงิน',
      checkoutDetailsDesc: 'กรอกที่อยู่จัดส่งก่อนชำระเงิน และข้อมูลใบกำกับภาษีหากต้องการ',
      backToShop: 'กลับร้านค้า',
      shippingAddressTitle: 'ที่อยู่จัดส่ง',
      fullName: 'ชื่อ-นามสกุล',
      email: 'อีเมล',
      phone: 'เบอร์โทร',
      addressLine1: 'ที่อยู่บรรทัดที่ 1',
      addressLine2: 'ที่อยู่บรรทัดที่ 2',
      district: 'เขต/อำเภอ',
      province: 'จังหวัด',
      postalCode: 'รหัสไปรษณีย์',
      country: 'ประเทศ',
      invoiceTitle: 'ใบกำกับภาษี',
      needsInvoice: 'ต้องการใบกำกับภาษี',
      invoiceName: 'ชื่อในใบกำกับ',
      taxId: 'เลขผู้เสียภาษี',
      companyName: 'ชื่อบริษัท',
      branch: 'สาขา',
      continueToPayment: 'ไปชำระเงิน',
      orderSummary: 'สรุปคำสั่งซื้อ',
      quantity: 'จำนวน',
      cartTotal: 'รวม',
      checkoutSummaryHint: 'ราคาจะถูกยืนยันจากเซิร์ฟเวอร์ก่อนเปิดหน้าชำระเงิน Stripe',
    },
  },
};
