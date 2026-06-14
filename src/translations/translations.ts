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
    yearResults: string;
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
      yearResults: '{year} Results',
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
      achievements: 'ผลงาน',
      news: 'ข่าวสาร',
      contact: 'ติดต่อเรา',
      courses: 'หลักสูตร',
      admin: 'แอดมิน',
      terms: 'ข้อกำหนด',
      privacy: 'นโยบายความเป็นส่วนตัว',
      backToHome: 'กลับหน้าแรก',
      pageNotFound: 'ไม่พบหน้านี้',
      pageNotFoundDesc: 'ไม่พบหน้าที่คุณกำลังค้นหา',
      loading: 'กำลังโหลด…',
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
      openCommunityDesc: ' Connect กับรุ่นพี่และศิษย์เก่าที่บินอยู่กับสายการบินที่มาแบ่งปันประสบการณ์จริงและให้คำปรึกษาด้านอาชีพ',
      tailoredExpertise: 'เชี่ยวชาญเฉพาะทางในไทย',
      tailoredExpertiseDesc: 'ด้วยประสบการณ์การสอนมานานหลายปี และผลงานนักเรียนที่สอบติดไปจำนวนมาก ที่ Sully Academy สามารถชี้แนะนักเรียนแต่ละคนได้ตรงจุด',
      successStoriesEyebrow: 'เรื่องราวความสำเร็จ',
      successStoriesTitle: 'ผลงานของเรา',
      examPerformance: 'ผลการสอบ',
      yearResults: 'ผลงานปี {year}',
      successMetrics: 'สถิติประจำปี',
      noDataRecorded: 'ยังไม่มีข้อมูลสำหรับปีนี้',
      latestUpdatesEyebrow: 'อัปเดตล่าสุด',
      latestUpdatesTitle: 'ข่าวและประกาศ',
      readMore: 'อ่านต่อ',
      noNewsUpdates: 'ยังไม่มีข่าวใหม่ในขณะนี้ กลับมาดูอีกครั้งเร็วๆ นี้นะ',
      getInTouchEyebrow: 'ติดต่อเรา',
      getInTouchTitle: 'พร้อมเริ่มต้นเส้นทางการบินแล้วหรือยัง?',
      getInTouchDesc: 'มีคำถามเรื่องหลักสูตรหรือการสมัครเรียน ทีมงานครู พร้อมให้คำปรึกษาผ่าน Line Official',
      addLine: 'ติดต่อทาง Line @sully2017',
    },
    footer: {
      copyright: 'สงวนลิขสิทธิ์',
    },
  },
};
