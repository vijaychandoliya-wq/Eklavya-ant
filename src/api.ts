import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://app.gurukull.in/api';
const TOKEN_KEY = 'eklavya.parent.token';
const DEVICE_KEY = 'eklavya.parent.device';
const CHILD_KEY = 'eklavya.parent.child';
const PARENT_KEY = 'eklavya.parent.profile';

export type AnyRecord = Record<string, any>;

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

async function request(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
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
    throw new ApiError(
      String(firstFieldError || payload.message || 'Request failed. Please try again.'),
      response.status,
      payload.errors,
    );
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

export async function login(mobile: string, password: string) {
  let deviceId = await AsyncStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = `eklavya-ant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  }
  const payload = await request('/parent/login', {
    method: 'POST',
    body: encode({
      email: mobile.trim(),
      password,
      device_name: 'Eklavya Parent',
      device_id: deviceId,
    }),
  });
  if (!payload.token) {
    throw new ApiError(payload.message || 'Login did not return an access token.', 500);
  }
  await AsyncStorage.setItem(TOKEN_KEY, payload.token);
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
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(CHILD_KEY);
    await AsyncStorage.removeItem(PARENT_KEY);
  }
}

export async function logoutAllDevices(mobile: string) {
  return request('/logout/devices', {method: 'POST', body: encode({email: mobile.trim()})});
}

export const hasSession = async () => Boolean(await AsyncStorage.getItem(TOKEN_KEY));
export const clearSession = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
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

export async function ensureSelectedChild(): Promise<AnyRecord> {
  const existing = await getSelectedChild();
  if (existing?.student_id) {
    return existing;
  }
  const children = await getChildren();
  if (!children.length) {
    throw new ApiError('No children are linked to this parent account.', 404);
  }
  await setSelectedChild(children[0]);
  return children[0];
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
export const getMessages = async () => listOf(await request('/v2/messages'));
export const getNotifications = async (studentId?: string | number) =>
  listOf(await request(`/v2/notifications/${studentId || (await childId())}`));

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
