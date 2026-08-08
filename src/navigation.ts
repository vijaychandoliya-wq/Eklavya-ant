import {OutlineGlyphMapType} from '@ant-design/icons-react-native';

export type ScreenKey =
  | 'dashboard'
  | 'profile'
  | 'leave'
  | 'changePassword'
  | 'trackLocation'
  | 'school'
  | 'notices'
  | 'events'
  | 'classEvents'
  | 'magazine'
  | 'homework'
  | 'assignments'
  | 'exams'
  | 'examMarks'
  | 'timetable'
  | 'attendance'
  | 'discipline'
  | 'feedback'
  | 'messages'
  | 'staff'
  | 'lessonPlans'
  | 'fees'
  | 'onlineClass';

export type ScreenParams = Record<string, any>;
export type Route = {key: ScreenKey; params?: ScreenParams};

export type ScreenMeta = {
  key: ScreenKey;
  title: string;
  icon: OutlineGlyphMapType;
  nested?: boolean;
  group?: string;
};

/** Primary destinations shown in the bottom tab bar. */
export const BOTTOM_TABS: ScreenMeta[] = [
  {key: 'dashboard', title: 'Home', icon: 'home'},
  {key: 'events', title: 'Calendar', icon: 'calendar'},
  {key: 'messages', title: 'Messages', icon: 'message'},
  {key: 'profile', title: 'Profile', icon: 'user'},
];

const BOTTOM_KEYS = new Set(BOTTOM_TABS.map(tab => tab.key));

export const SCREENS: ScreenMeta[] = [
  {key: 'dashboard', title: 'Home', icon: 'home', group: 'Main'},
  {key: 'profile', title: 'Profile', icon: 'user', group: 'Profile'},
  {key: 'leave', title: 'Apply leave', icon: 'form', group: 'Profile'},
  {key: 'changePassword', title: 'Change password', icon: 'lock', group: 'Profile', nested: true},
  {key: 'trackLocation', title: 'Track location', icon: 'compass', group: 'Profile'},
  {key: 'school', title: 'School info', icon: 'bank', group: 'School'},
  {key: 'notices', title: 'Notice board', icon: 'notification', group: 'School'},
  {key: 'events', title: 'Calendar', icon: 'calendar', group: 'School'},
  {key: 'classEvents', title: 'Class events', icon: 'flag', group: 'Classes'},
  {key: 'magazine', title: 'Magazine', icon: 'read', group: 'School'},
  {key: 'homework', title: 'Homework', icon: 'book', group: 'Classes'},
  {key: 'assignments', title: 'Assignments', icon: 'file-text', group: 'Classes'},
  {key: 'exams', title: 'Exams', icon: 'solution', group: 'Classes'},
  {key: 'examMarks', title: 'Exam marks', icon: 'edit', nested: true},
  {key: 'timetable', title: 'Timetable', icon: 'schedule', group: 'Classes'},
  {key: 'attendance', title: 'Attendance', icon: 'check-square', group: 'Classes'},
  {key: 'discipline', title: 'Discipline', icon: 'trophy', group: 'Classes'},
  {key: 'messages', title: 'Messages', icon: 'message', group: 'Others'},
  {key: 'feedback', title: 'Feedback', icon: 'mail', group: 'Others'},
  {key: 'staff', title: 'Staff info', icon: 'team', group: 'Others'},
  {key: 'lessonPlans', title: 'Lesson plan', icon: 'profile', group: 'Others'},
  {key: 'fees', title: 'Fees', icon: 'account-book', group: 'Others'},
  {key: 'onlineClass', title: 'Online class', icon: 'video-camera', group: 'Others'},
];

/** Drawer lists secondary destinations only (not bottom-tab roots). */
export const DRAWER_MENU = SCREENS.filter(
  screen => !screen.nested && !BOTTOM_KEYS.has(screen.key),
);

/** @deprecated use DRAWER_MENU — kept for any leftover imports */
export const MENU = DRAWER_MENU;

export function screenTitle(key: ScreenKey) {
  return SCREENS.find(screen => screen.key === key)?.title || 'Eklavya';
}

export function isBottomTab(key: ScreenKey) {
  return BOTTOM_KEYS.has(key);
}
