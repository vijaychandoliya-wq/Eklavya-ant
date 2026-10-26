import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSessionToken,setSessionToken,clearSessionToken} from './secureSession';

declare const process: any;

// Shared multi-tenant Cloudflare Edge Backend URL. The selected school code
// is sent with every request and is resolved by the Worker.
export const PRODUCTION_BASE_URL = 'https://gurukul-worker-api.gurukull.workers.dev';

const BASE_URL =
  (typeof process !== 'undefined' && process?.env?.API_URL) ||
  PRODUCTION_BASE_URL;

const MEDIA_ORIGIN =
  (typeof process !== 'undefined' && process?.env?.MEDIA_URL) ||
  PRODUCTION_BASE_URL;

const DEVICE_KEY = 'eklavya.parent.device';
const CHILD_KEY = 'eklavya.parent.child';
const PARENT_KEY = 'eklavya.parent.profile';
const SCHOOL_CODE_KEY = 'eklavya.parent.school_code';
const BASE_URL_KEY = 'eklavya.parent.base_url';

let baseUrlCache: string = PRODUCTION_BASE_URL;

export async function getBaseUrl(): Promise<string> {
  const stored = ((await AsyncStorage.getItem(BASE_URL_KEY)) || '').replace(/\/$/, '');
  baseUrlCache = stored || BASE_URL;
  return baseUrlCache;
}

export async function setBaseUrl(url: string) {
  baseUrlCache = url.trim().replace(/\/$/, '') || PRODUCTION_BASE_URL;
  await AsyncStorage.setItem(BASE_URL_KEY, baseUrlCache);
}


export async function setSchoolCode(code: string) {
  const normalized = code.trim().toUpperCase();
  await AsyncStorage.setItem(SCHOOL_CODE_KEY, normalized);
  // A school code is not necessarily a hostname. Keep all mobile traffic on
  // the shared API and let the Worker resolve the tenant from the header.
  await setBaseUrl(PRODUCTION_BASE_URL);
}

export async function getSchoolCode(): Promise<string> {
  return (await AsyncStorage.getItem(SCHOOL_CODE_KEY)) || '';
}


export type AnyRecord = Record<string, any>;

/** Turn relative upload paths into absolute media URLs for Image. */
export function resolveMediaUrl(value?: string | null): string | null {
  if (value == null) {
    return null;
  }
  const raw = String(value).trim();
  if (!raw || raw === 'null' || raw === 'undefined') {
    return null;
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
    return raw;
  }
  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }
  const origin = baseUrlCache || MEDIA_ORIGIN;
  if (raw.startsWith('/')) {
    return `${origin}${raw}`;
  }
  return `${origin}/${raw}`;
}

/** First usable avatar URL from common API field names. */
export function pickAvatar(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const url = resolveMediaUrl(candidate);
    if (url) {
      return url;
    }
  }
  return null;
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;

  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function encode(values: Record<string, string | number | undefined>) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

/** Subscribe to forced sign-out (expired / revoked token). Returns unsubscribe. */
export function onSessionExpired(listener: AuthListener) {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

const PUBLIC_PATHS = ['/api/parent/login', '/parent/login', '/logout/devices', '/password/reset', '/password/store'];

async function notifySessionExpired() {
  await clearSessionToken();
  await AsyncStorage.removeItem(CHILD_KEY);
  await AsyncStorage.removeItem(PARENT_KEY);
  authListeners.forEach(listener => {
    try {
      listener();
    } catch {
      // Listeners must not break API error propagation.
    }
  });
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getSessionToken();
  const schoolCode = (await AsyncStorage.getItem(SCHOOL_CODE_KEY)) || '';
  const baseUrl = await getBaseUrl();

  const response = await fetch(`${baseUrl}${path}`, {

    ...options,
    headers: {
      Accept: 'application/json',
      'x-school-code': schoolCode,
      ...(options.body ? {'Content-Type': 'application/x-www-form-urlencoded'} : {}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError('The server returned an unreadable response.', response.status);
  }

  if (!response.ok || payload.success === false) {
    const firstFieldError = payload.errors ? Object.values(payload.errors).flat()[0] : undefined;
    const error = new ApiError(
      String(firstFieldError || payload.message || 'Request failed. Please try again.'),
      response.status,
      payload.errors,
    );
    // Stale tokens survive reload via cached child profile; clear them so boot
    // cannot keep a zombie "authenticated" UI that only shows Unauthenticated.
    if (response.status === 401 && token && !PUBLIC_PATHS.includes(path)) {
      await notifySessionExpired();
    }
    throw error;
  }
  return payload;
}

const listOf = (payload: any): any[] => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) {
    return value;
  }
  if (value && Array.isArray(value.teachers)) {
    return value.teachers;
  }
  return [];
};

const dataOf = (payload: any): AnyRecord => payload?.data || {};

// ---------------------------------------------------------------- session ---

export async function login(identifier: string, password: string) {
  let deviceId = await AsyncStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = `eklavya-ant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  }
  const payload = await request('/api/parent/login', {
    method: 'POST',
    body: encode({
      email: identifier.trim(),
      password,
      device_name: 'Eklavya Parent',
      device_id: deviceId,
    }),
  });
  if (!payload.token) {
    throw new ApiError(payload.message || 'Login did not return an access token.', 500);
  }
  await setSessionToken(payload.token);
  await AsyncStorage.setItem(
    PARENT_KEY,
    JSON.stringify({
      id: payload.parent_id,
      name: payload.user_name,
      email: payload.user_email,
    }),
  );
  return payload;
}

export async function logout() {
  try {
    await request('/v2/logout', {method: 'POST', body: ''});
  } finally {
    await clearSessionToken();
    await AsyncStorage.removeItem(CHILD_KEY);
    await AsyncStorage.removeItem(PARENT_KEY);
  }
}

export async function logoutAllDevices(identifier: string) {
  return request('/logout/devices', {method: 'POST', body: encode({email: identifier.trim()})});
}

export const hasSession = async () => Boolean(await getSessionToken());

export async function getLocalePreference():Promise<AnyRecord>{
  const payload=await request('/api/portal/locale-preference');
  return payload?.data || {};
}

export async function saveLocalePreference(localeTag:string,version:number):Promise<AnyRecord>{
  const payload=await request('/api/portal/locale-preference',{
    method:'PUT',body:JSON.stringify({mode:'explicit',localeTag,version}),headers:{'Content-Type':'application/json','Idempotency-Key':`locale_${Date.now()}_${Math.random().toString(36).slice(2,10)}`},
  });
  return payload?.data || {};
}
export const clearSession = async () => {
  await clearSessionToken();
  await AsyncStorage.removeItem(CHILD_KEY);
  await AsyncStorage.removeItem(PARENT_KEY);
};

export async function getParentProfile(): Promise<AnyRecord> {
  const raw = await AsyncStorage.getItem(PARENT_KEY);
  return raw ? JSON.parse(raw) : {};
}

export const changePassword = (values: {
  oldpassword: string;
  newpassword: string;
  confirmpassword: string;
}) => request('/v2/password/change', {method: 'POST', body: encode(values)});

// --------------------------------------------------------------- children ---

export async function getChildren(): Promise<AnyRecord[]> {
  return listOf(await request('/v2/my-children'));
}

export async function getSelectedChild(): Promise<AnyRecord | null> {
  const raw = await AsyncStorage.getItem(CHILD_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setSelectedChild(child: AnyRecord) {
  await AsyncStorage.setItem(CHILD_KEY, JSON.stringify(child));
}

/**
 * Resolve the active child. Pass `{validate: true}` on app boot so a cached
 * child cannot skip the network check that proves the Sanctum token still works.
 */
export async function ensureSelectedChild(options?: {validate?: boolean}): Promise<AnyRecord> {
  const existing = await getSelectedChild();
  if (existing?.student_id && !options?.validate) {
    return existing;
  }
  const children = await getChildren();
  if (!children.length) {
    throw new ApiError('No children are linked to this parent account.', 404);
  }
  const matched =
    existing?.student_id != null
      ? children.find(child => String(child.student_id) === String(existing.student_id))
      : undefined;
  const selected = matched || children[0];
  await setSelectedChild(selected);
  return selected;
}

async function childId() {
  const child = await ensureSelectedChild();
  return String(child.student_id);
}

export const getChildDetails = async (studentId?: string | number) =>
  dataOf(await request(`/v2/my-children/${studentId || (await childId())}/details`));

// ----------------------------------------------------------------- school ---

export const getSchool = async () => dataOf(await request('/v2/school/details'));
export const getAddons = async () => dataOf(await request('/v2/addons'));
export const getSchoolNotices = async () => listOf(await request('/v2/my-school/notices'));
export const getClassNotices = async (studentId?: string | number) =>
  listOf(await request(`/v2/notices/${studentId || (await childId())}`));
export const getMagazine = async (page = 1) =>
  listOf(await request(`/v2/my-school/magazine?page=${page}`));
export const getUpcomingEvents = async () => listOf(await request('/v2/my-events/upcoming'));
export const getClassEvents = async (studentId?: string | number) =>
  listOf(await request(`/v2/my-events/${studentId || (await childId())}/class`));
/** Admin SendMail / emergency messages — API fields are subject, message, sentAt. */
export const getMessages = async () =>
  listOf(await request('/v2/messages')).map(item => ({
    ...item,
    title: item.title || item.subject || item.sender || 'Message',
    body: item.message || item.body || item.content || '',
    date: item.sentAt || item.created_at || item.date || item.fired_at || '',
    sender: item.sender || item.from || 'School',
  }));
export const getNotifications = async (studentId?: string | number) =>
  listOf(await request(`/v2/notifications/${studentId || (await childId())}`));

// ------------------------------------------------------------------- chat ---

function normalizeChatContact(item: AnyRecord): AnyRecord {
  return {
    ...item,
    id: item.id ?? item.value,
    name: item.name || item.label || 'Contact',
    role: item.role || '',
    avatar: pickAvatar(
      item.avatar,
      item.photo,
      item.image,
      item.profile_photo,
      item.profile_image,
      item.profileImage,
    ),
  };
}

function normalizeChatRoom(item: AnyRecord): AnyRecord {
  return {
    ...item,
    name: item.name || 'Chat',
    avatar: pickAvatar(
      item.avatar,
      item.photo,
      item.image,
      item.profile_photo,
      item.profile_image,
      item.otherUserAvatar,
    ),
  };
}

function normalizeChatMessage(item: AnyRecord): AnyRecord {
  return {
    ...item,
    senderName: item.senderName || item.sender_name || 'User',
    avatar: pickAvatar(
      item.senderAvatar,
      item.sender_avatar,
      item.avatar,
      item.photo,
      item.profile_photo,
    ),
  };
}

export async function getChatContacts(): Promise<{contacts: AnyRecord[]; currentUser: AnyRecord}> {
  const payload = await request('/v2/chat/contacts');
  const data = dataOf(payload);
  const currentUser = data.currentUser || {};
  return {
    contacts: (Array.isArray(data.contacts) ? data.contacts : []).map(normalizeChatContact),
    currentUser: {
      ...currentUser,
      avatar: pickAvatar(
        currentUser.avatar,
        currentUser.photo,
        currentUser.image,
        currentUser.profile_photo,
        currentUser.profile_image,
      ),
    },
  };
}

export const getChatRooms = async () =>
  listOf(await request('/v2/chat/rooms')).map(normalizeChatRoom);

export async function getChatMessages(roomId: string | number): Promise<{
  messages: AnyRecord[];
  room: AnyRecord;
}> {
  const payload = await request(`/v2/chat/messages/${roomId}`);
  const room = payload.room || {};
  const messages = listOf(payload).map(normalizeChatMessage);
  const peerAvatar =
    pickAvatar(room.avatar, room.photo, room.image, room.profile_photo) ||
    messages.find(item => !item.isMe && item.avatar)?.avatar ||
    null;
  return {
    messages,
    room: {
      ...room,
      name: room.name || 'Chat',
      avatar: peerAvatar,
    },
  };
}

export const sendChatMessage = async (chatRoomId: string | number, messageText: string) =>
  request('/v2/chat/messages', {
    method: 'POST',
    body: encode({chatRoomId, messageText}),
  });

export async function createChatRoom(values: {
  type: 'direct' | 'group';
  recipientId?: string | number;
  name?: string;
  participantIds?: Array<string | number>;
}) {
  const payload = await request('/v2/chat/rooms', {
    method: 'POST',
    body: encode({
      type: values.type,
      recipientId: values.recipientId,
      name: values.name,
      ...(values.participantIds?.length
        ? Object.fromEntries(values.participantIds.map((id, i) => [`participantIds[${i}]`, id]))
        : {}),
    }),
  });
  return dataOf(payload);
}

// -------------------------------------------------------------- academics ---

export const getPendingHomework = async (studentId?: string | number) =>
  listOf(await request(`/v2/homeworks/pending/${studentId || (await childId())}`));
export const getFinishedHomework = async (studentId?: string | number) =>
  listOf(await request(`/v2/homeworks/finished/${studentId || (await childId())}`));
export const getOngoingAssignments = async (studentId?: string | number) =>
  listOf(await request(`/v2/assignments/${studentId || (await childId())}`));
export const getCompletedAssignments = async (studentId?: string | number) =>
  listOf(await request(`/v2/assignments/completed/${studentId || (await childId())}`));
export const getAttendance = async (studentId?: string | number) => {
  const payload = await request(`/v2/attendance/${studentId || (await childId())}`);
  return {
    percentage: payload.attendancePercentage || payload.data?.attendancePercentage || '—',
    rows: listOf(payload),
  };
};
export const getDisciplines = async (studentId?: string | number) =>
  listOf(await request(`/v2/disciplines/${studentId || (await childId())}`));
export const getTeachers = async (studentId?: string | number) =>
  listOf(await request(`/v2/teachers/${studentId || (await childId())}`));
export const getLessonPlans = async (studentId?: string | number) =>
  listOf(await request(`/v2/lessonplan/${studentId || (await childId())}`));
export const getLessonPlanAttachment = async (lessonId: string | number) =>
  dataOf(await request(`/v2/lessonplan/print/${lessonId}`));
export const getTimetable = async (studentId?: string | number) =>
  dataOf(await request(`/v2/timetable/${studentId || (await childId())}`));
export const getUpcomingExams = async (studentId?: string | number) =>
  listOf(await request(`/v2/exams/upcoming/${studentId || (await childId())}`));
export const getPastExams = async (studentId?: string | number) =>
  listOf(await request(`/v2/exams/past/${studentId || (await childId())}`));
export const getExamMarks = async (examId: string | number, studentId?: string | number) =>
  dataOf(await request(`/v2/marks/${studentId || (await childId())}/${examId}`));
export const getPaidFees = async (studentId?: string | number) =>
  listOf(await request(`/v2/fees/paid/${studentId || (await childId())}`));
export const getUnpaidFees = async (studentId?: string | number) =>
  listOf(await request(`/v2/fees/unpaid/${studentId || (await childId())}`));

// ------------------------------------------------------------------- leave ---

export const getLeaveReasons = async () => listOf(await request('/v2/leave/list'));
export const getLeaves = async (studentId?: string | number) =>
  listOf(await request(`/v2/leaves/${studentId || (await childId())}`));
export const applyLeave = async (values: {
  from_date: string;
  to_date: string;
  reason_id: string | number;
  remarks: string;
  student_id?: string | number;
}) => {
  const id = values.student_id || (await childId());
  return request(`/v2/leave/add/${id}`, {
    method: 'POST',
    body: encode({
      from_date: values.from_date,
      to_date: values.to_date,
      reason_id: values.reason_id,
      remarks: values.remarks,
    }),
  });
};
export const deleteLeave = async (leaveId: string | number) =>
  request(`/v2/leave/delete/${leaveId}`);

// --------------------------------------------------------------- feedback ---

export const getFeedbacks = async () => listOf(await request('/v2/feedbacks'));
export const getFeedbackCategories = async () => listOf(await request('/v2/feedback/category/list'));
export const sendFeedback = async (values: {
  message: string;
  category: string | number;
  student_id?: string | number;
}) => {
  const id = values.student_id || (await childId());
  return request(`/v2/feedback/send/${id}`, {
    method: 'POST',
    body: encode({message: values.message, category: values.category}),
  });
};

// ------------------------------------------------------------- transport ---

export const getTripStatus = async () => dataOf(await request('/v2/transport/tripactivestatus'));
export const getTransportLocations = async (studentId?: string | number) =>
  listOf(await request(`/v2/transport/locationlist/${studentId || (await childId())}`));

// ----------------------------------------------------------- online class ---

export const getOnlineClasses = async (studentId?: string | number) =>
  listOf(await request(`/v2/video-conference/${studentId || (await childId())}`));
export const joinOnlineClass = async (slug: string, studentId?: string | number) =>
  dataOf(await request(`/v2/video-conference/${slug}/${studentId || (await childId())}`));
