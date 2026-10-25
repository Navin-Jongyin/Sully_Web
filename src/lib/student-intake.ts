import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const STUDENT_INTAKE_FIELDS = [
  { key: 'nickname', th: 'ชื่อเล่น', en: 'Nickname' },
  { key: 'birthDate', th: 'วันเดือนปีเกิด', en: 'Date of birth', type: 'date' },
  { key: 'age', th: 'อายุ', en: 'Age', readOnly: true },
  { key: 'province', th: 'คนจังหวัดไร', en: 'Home province' },
  { key: 'faculty', th: 'จบคณะ', en: 'Faculty' },
  { key: 'major', th: 'สาขา', en: 'Major' },
  { key: 'gpa', th: 'เกรด', en: 'GPA' },
  { key: 'university', th: 'มหาวิทยาลัย', en: 'University' },
  { key: 'toeic', th: 'TOEIC', en: 'TOEIC' },
  { key: 'highSchoolTrack', th: 'ม.ปลายเรียนสายไร', en: 'High-school track' },
  { key: 'workplace', th: 'ทำงานที่ไหน', en: 'Workplace' },
  { key: 'workSchedule', th: 'วันเวลาทำงาน', en: 'Work days and hours' },
  { key: 'stayArea', th: 'พักแถวไหน', en: 'Where you stay' },
  { key: 'vision', th: 'สายตาสั้นยาวเท่าไร', en: 'Vision (near or far sighted)' },
  { key: 'lasikHistory', th: 'เคยทำเลสิค PRK ไหม ถ้าเคยก่อนทำเท่าไร', en: 'LASIK or PRK, and previous vision if yes' },
  { key: 'weight', th: 'น้ำหนัก', en: 'Weight' },
  { key: 'height', th: 'ส่วนสูง', en: 'Height' },
  { key: 'chronicConditions', th: 'โรคประจำตัว', en: 'Chronic conditions' },
  { key: 'allergies', th: 'แพ้อะไรไหม', en: 'Allergies' },
  { key: 'lastCheckup', th: 'ตรวจสุขภาพประจำปีเมื่อไหร่', en: 'Last annual health check' },
  { key: 'exercise', th: 'ออกกำลังกาย ฟิตเนส', en: 'Exercise or fitness' },
  { key: 'regularSupplements', th: 'มีการกินเวย์โปรตีน หรือว่ายาอะไรที่ทานเป็นประจำไหม', en: 'Whey protein or regular medication' },
  { key: 'healthProblems', th: 'ปัญหาสุขภาพ (ถ้ามี)', en: 'Health problems, if any' },
] as const;

export type StudentIntakeKey = (typeof STUDENT_INTAKE_FIELDS)[number]['key'];

export type StudentIntakeAnswers = Record<StudentIntakeKey, string>;

export interface StudentIntakeRecord extends StudentIntakeAnswers {
  uid: string;
  email?: string;
  completed: true;
  updatedAt?: Timestamp | null;
}

export const emptyStudentIntake = (): StudentIntakeAnswers =>
  Object.fromEntries(STUDENT_INTAKE_FIELDS.map((field) => [field.key, ''])) as StudentIntakeAnswers;

export function ageFromBirthDate(value: string): string {
  if (!value) return '';
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : '';
}

export function isStudentIntakeComplete(data: Partial<StudentIntakeRecord> | undefined): boolean {
  return data?.completed === true && STUDENT_INTAKE_FIELDS.every((field) => typeof data[field.key] === 'string');
}

export async function fetchStudentIntake(uid: string): Promise<StudentIntakeRecord | null> {
  const snapshot = await getDoc(doc(db, 'users', uid, 'studentIntake', 'profile'));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Partial<StudentIntakeRecord>;
  return isStudentIntakeComplete(data) ? (data as StudentIntakeRecord) : null;
}

export async function saveStudentIntake(
  uid: string,
  email: string,
  answers: StudentIntakeAnswers,
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'studentIntake', 'profile'), {
    ...answers,
    uid,
    email,
    completed: true,
    updatedAt: serverTimestamp(),
  });
}
