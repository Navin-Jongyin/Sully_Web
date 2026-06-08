export type Language = 'en' | 'th';

export interface Translations {
  common: {
    home: string;
    about: string;
    achievements: string;
    news: string;
    contact: string;
    courses: string;
    admin: string;
    terms: string;
    privacy: string;
    backToHome: string;
    pageNotFound: string;
    pageNotFoundDesc: string;
    loading: string;
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
    successMetrics: string;
    noDataRecorded: string;
    latestUpdatesEyebrow: string;
    latestUpdatesTitle: string;
    readMore: string;
    noNewsUpdates: string;
    getInTouchEyebrow: string;
    getInTouchTitle: string;
    getInTouchDesc: string;
    addLine: string;
  };
  footer: {
    copyright: string;
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
      admin: 'Admin',
      terms: 'Terms',
      privacy: 'Privacy',
      backToHome: 'Back to Home',
      pageNotFound: 'Page not found',
      pageNotFoundDesc: 'The page you\'re looking for doesn\'t exist.',
      loading: 'Loading…',
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
      successMetrics: 'Success metrics for',
      noDataRecorded: 'No data recorded for this year yet.',
      latestUpdatesEyebrow: 'Latest Updates',
      latestUpdatesTitle: 'News & Announcements',
      readMore: 'Read More',
      noNewsUpdates: 'No news updates at the moment. Check back soon!',
      getInTouchEyebrow: 'Get In Touch',
      getInTouchTitle: 'Ready to Start Your Journey?',
      getInTouchDesc: 'Have questions about our courses or the admission process? Our experienced instructors are ready to help guide you on the Line Official account.',
      addLine: 'Add Line Official @sully2017',
    },
    footer: {
      copyright: 'All rights reserved.',
    },
  },
  th: {
    common: {
      home: 'หน้าแรก',
      about: 'เกี่ยวกับเรา',
      achievements: 'ความสำเร็จ',
      news: 'ข่าวสาร',
      contact: 'ติดต่อเรา',
      courses: 'หลักสูตร',
      admin: 'ผู้ดูแล',
      terms: 'เงื่อนไข',
      privacy: 'ความเป็นส่วนตัว',
      backToHome: 'กลับสู่หน้าแรก',
      pageNotFound: 'ไม่พบหน้าเว็บ',
      pageNotFoundDesc: 'หน้าเว็บที่คุณกำลังมองหาไม่มีอยู่',
      loading: 'กำลังโหลด…',
    },
    home: {
      eyebrow: 'นักบินเริ่มต้น',
      heroTitle: 'เริ่มต้นการเดินทางสู่ห้องนักบินที่นี่',
      heroDescription: 'Sully Academy จัดเตรียมการฝึกอบรมพื้นฐานระดับสูงสำหรับนักบินเริ่มต้นและผู้เชี่ยวชาญด้านการบินในประเทศไทย ควบคุมความรู้ ผ่านการสอบ และเริ่มต้นอาชีพของคุณ',
      bookInterview: 'จองการสัมภาษณ์',
      aptitudePractice: 'ฝึกทักษะความถนัด',
      contactUs: 'ติดต่อเรา',
      studentsPassed: 'นักเรียนผ่านการสอบ',
      estSince: 'ก่อตั้งเมื่อ',
      studentVoiceEyebrow: 'เสียงจากนักเรียน',
      studentVoiceTitle: 'ข้อความจากนักเรียนของเรา',
      studentVoiceDesc: 'ฟังจากนักบินที่ผ่านการฝึกอบรมกับเราและบรรลุความฝันในการบิน',
      noMessages: 'ยังไม่มีข้อความ',
      whyChooseUsEyebrow: 'ทำไมต้องเรา',
      whyChooseUsTitle: 'สร้างขึ้นสำหรับนักบินเริ่มต้น',
      supportiveLearning: 'สภาพแวดล้อมการเรียนรู้ที่เอื้ออำนวย',
      supportiveLearningDesc: 'เพื่อนร่วมชั้นที่เป็นมิตรและพร้อมช่วยเหลือคุณเกี่ยวกับคำถามใดๆ ที่คุณอาจมี',
      openCommunity: 'ชุมชนที่เปิดกว้าง',
      openCommunityDesc: 'เข้าถึงเครือข่ายของรุ่นพี่และศิษย์เก่าที่กำลังบินในสายการบินหลัก ให้ความเข้าใจจากโลกแห่งความเป็นจริงและการแนะนำด้านอาชีพ',
      tailoredExpertise: 'ความเชี่ยวชาญท้องถิ่นที่ปรับแต่ง',
      tailoredExpertiseDesc: 'ควบคุมความรู้และมาตรฐานเฉพาะที่จำเป็นสำหรับการคัดเลือกนักบินสายการบินไทย (TG, VZ, FD) และข้อบังคับ CAAT ด้วยหลักสูตรท้องถิ่นของเรา',
      successStoriesEyebrow: 'เรื่องราวความสำเร็จ',
      successStoriesTitle: 'ผลงานของเรา',
      examPerformance: 'ผลการสอบ',
      successMetrics: 'ตัวชี้วัดความสำเร็จสำหรับ',
      noDataRecorded: 'ยังไม่มีข้อมูลบันทึกสำหรับปีนี้',
      latestUpdatesEyebrow: 'อัปเดตล่าสุด',
      latestUpdatesTitle: 'ข่าวและประกาศ',
      readMore: 'อ่านเพิ่มเติม',
      noNewsUpdates: 'ไม่มีข่าวอัปเดตในขณะนี้ ตรวจสอบกลับมาใหม่เร็วๆ นี้!',
      getInTouchEyebrow: 'ติดต่อเรา',
      getInTouchTitle: 'พร้อมเริ่มต้นการเดินทางของคุณหรือยัง?',
      getInTouchDesc: 'มีคำถามเกี่ยวกับหลักสูตรหรือกระบวนการรับสมัครหรือไม่? ผู้สอนที่มีประสบการณ์ของเราพร้อมช่วยแนะนำคุณผ่านบัญชี Line Official',
      addLine: 'เพิ่ม Line Official @sully2017',
    },
    footer: {
      copyright: 'สงวนลิขสิทธิ์',
    },
  },
};
