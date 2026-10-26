import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Provider} from '@ant-design/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MENU, screenTitle} from '../src/navigation';
import {ThemeProvider} from '../src/theme';

jest.mock('../src/api');

import * as api from '../src/api';
import DashboardScreen from '../src/screens/DashboardScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import LeaveScreen from '../src/screens/LeaveScreen';
import TrackLocationScreen from '../src/screens/TrackLocationScreen';
import SchoolScreen from '../src/screens/SchoolScreen';
import NoticesScreen from '../src/screens/NoticesScreen';
import EventsScreen from '../src/screens/EventsScreen';
import ClassEventsScreen from '../src/screens/ClassEventsScreen';
import MagazineScreen from '../src/screens/MagazineScreen';
import HomeworkScreen from '../src/screens/HomeworkScreen';
import AssignmentsScreen from '../src/screens/AssignmentsScreen';
import ExamsScreen from '../src/screens/ExamsScreen';
import ExamMarksScreen from '../src/screens/ExamMarksScreen';
import TimetableScreen from '../src/screens/TimetableScreen';
import AttendanceScreen from '../src/screens/AttendanceScreen';
import DisciplineScreen from '../src/screens/DisciplineScreen';
import FeedbackScreen from '../src/screens/FeedbackScreen';
import MessagesScreen from '../src/screens/MessagesScreen';
import ChatRoomScreen from '../src/screens/ChatRoomScreen';
import StaffScreen from '../src/screens/StaffScreen';
import LessonPlansScreen from '../src/screens/LessonPlansScreen';
import FeesScreen from '../src/screens/FeesScreen';
import OnlineClassScreen from '../src/screens/OnlineClassScreen';
import ChangePasswordScreen from '../src/screens/ChangePasswordScreen';

const mocked = api as jest.Mocked<typeof api>;

function resolveEveryApiCall() {
  Object.values(mocked).forEach(value => {
    if (typeof value === 'function' && 'mockResolvedValue' in value) {
      (value as jest.Mock).mockResolvedValue([]);
    }
  });
  mocked.getChatContacts.mockResolvedValue({contacts: [], currentUser: {}});
  mocked.getSchool.mockResolvedValue({});
  mocked.getSelectedChild.mockResolvedValue(null);
  mocked.ensureSelectedChild.mockResolvedValue({});
  mocked.getParentProfile.mockResolvedValue({});
  mocked.getFeedbackCategories.mockResolvedValue([]);
  mocked.getLeaveReasons.mockResolvedValue([]);
}

function resolvePopulatedApiCall() {
  resolveEveryApiCall();
  const row = {
    id: 1,
    student_id: 1,
    name: 'Sample child',
    title: 'Sample item',
    subject: 'English',
    subject_name: 'English',
    class_name: 'Class 1 · A',
    date: '2026-10-12',
    status: 'Published',
    description: 'Sample test response',
    message: 'Sample message',
    amount: 100,
  };
  Object.values(mocked).forEach(value => {
    if (typeof value === 'function' && 'mockResolvedValue' in value) {
      (value as jest.Mock).mockResolvedValue([row]);
    }
  });
  mocked.getSchool.mockResolvedValue({schoolName: 'Sample school', address: 'Tamil Nadu'});
  mocked.getParentProfile.mockResolvedValue({id: 1, name: 'Sample parent', email: 'parent@example.test'});
  mocked.getChildren.mockResolvedValue([row]);
  mocked.getSelectedChild.mockResolvedValue(row);
  mocked.ensureSelectedChild.mockResolvedValue(row);
  mocked.getChildDetails.mockResolvedValue({fullName: row.name, className: row.class_name});
  mocked.getAttendance.mockResolvedValue({percentage: '100%', rows: [row]});
  mocked.getTimetable.mockResolvedValue({Monday: [row]});
  mocked.getTripStatus.mockResolvedValue({active: true, status: 'Active'});
  mocked.getTransportLocations.mockResolvedValue([row]);
  mocked.getChatContacts.mockResolvedValue({contacts: [row], currentUser: {id: 1}});
  mocked.getChatRooms.mockResolvedValue([row]);
  mocked.getChatMessages.mockResolvedValue({messages: [row], room: {name: 'Sample chat'}});
  mocked.getFeedbackCategories.mockResolvedValue([{id: 1, name: 'General'}]);
  mocked.getLeaveReasons.mockResolvedValue([{id: 1, title: 'Personal'}]);
}

beforeEach(() => {
  resolveEveryApiCall();
});

function renderScreen(element: React.ReactElement) {
  return ReactTestRenderer.create(
    <ThemeProvider>
      <Provider>
        <SafeAreaProvider>{element}</SafeAreaProvider>
      </Provider>
    </ThemeProvider>,
  );
}

test('parent menu includes core screens', () => {
  const keys = MENU.map(item => item.key);
  expect(keys).toEqual(
    expect.arrayContaining([
      'dashboard',
      'homework',
      'assignments',
      'attendance',
      'fees',
      'leave',
      'onlineClass',
      'trackLocation',
    ]),
  );
  expect(screenTitle('dashboard')).toBe('Home');
});

test('renders without crashing when importing LoginScreen', async () => {
  const LoginScreen = require('../src/screens/LoginScreen').default;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(React.createElement(LoginScreen, {onSuccess: () => undefined}));
    await Promise.resolve();
  });
  await ReactTestRenderer.act(async () => {
    renderer!.unmount();
  });
});

test('every parent route has a loadable screen module', () => {
  const screenFiles = [
    'AssignmentsScreen',
    'AttendanceScreen',
    'ChangePasswordScreen',
    'ChatRoomScreen',
    'ClassEventsScreen',
    'DashboardScreen',
    'DisciplineScreen',
    'EventsScreen',
    'ExamMarksScreen',
    'ExamsScreen',
    'FeedbackScreen',
    'FeesScreen',
    'HomeworkScreen',
    'LeaveScreen',
    'LessonPlansScreen',
    'LoginScreen',
    'MagazineScreen',
    'MessagesScreen',
    'NoticesScreen',
    'OnlineClassScreen',
    'ProfileScreen',
    'SchoolScreen',
    'StaffScreen',
    'TimetableScreen',
    'TrackLocationScreen',
  ];
  screenFiles.forEach(name => {
    expect(require(`../src/screens/${name}`).default).toBeDefined();
  });
});

test('every parent screen renders its empty state without crashing', async () => {
  resolveEveryApiCall();
  const navigate = jest.fn();
  const screens: Array<[string, React.ReactElement]> = [
    ['Dashboard', <DashboardScreen navigate={navigate} profile={null} onChildChanged={jest.fn()} />],
    ['Profile', <ProfileScreen profile={null} navigate={navigate} />],
    ['Leave', <LeaveScreen />],
    ['TrackLocation', <TrackLocationScreen />],
    ['School', <SchoolScreen />],
    ['Notices', <NoticesScreen />],
    ['Events', <EventsScreen />],
    ['ClassEvents', <ClassEventsScreen />],
    ['Magazine', <MagazineScreen />],
    ['Homework', <HomeworkScreen />],
    ['Assignments', <AssignmentsScreen />],
    ['Exams', <ExamsScreen navigate={navigate} />],
    ['ExamMarks', <ExamMarksScreen params={{}} />],
    ['Timetable', <TimetableScreen />],
    ['Attendance', <AttendanceScreen />],
    ['Discipline', <DisciplineScreen />],
    ['Feedback', <FeedbackScreen />],
    ['Messages', <MessagesScreen navigate={navigate} />],
    ['ChatRoom', <ChatRoomScreen params={{}} />],
    ['Staff', <StaffScreen />],
    ['LessonPlans', <LessonPlansScreen />],
    ['Fees', <FeesScreen />],
    ['OnlineClass', <OnlineClassScreen />],
    ['ChangePassword', <ChangePasswordScreen onDone={jest.fn()} />],
  ];
  for (const [name, element] of screens) {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = renderScreen(element);
      await Promise.resolve();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
    expect(name).toBeTruthy();
  }
});

test('every parent screen renders a populated response without crashing', async () => {
  resolvePopulatedApiCall();
  const navigate = jest.fn();
  const screens: React.ReactElement[] = [
    <DashboardScreen navigate={navigate} profile={{name: 'Sample parent'}} onChildChanged={jest.fn()} />,
    <ProfileScreen profile={{name: 'Sample parent'}} navigate={navigate} />,
    <LeaveScreen />,
    <TrackLocationScreen />,
    <SchoolScreen />,
    <NoticesScreen />,
    <EventsScreen />,
    <ClassEventsScreen />,
    <MagazineScreen />,
    <HomeworkScreen />,
    <AssignmentsScreen />,
    <ExamsScreen navigate={navigate} />,
    <ExamMarksScreen params={{examId: 1}} />,
    <TimetableScreen />,
    <AttendanceScreen />,
    <DisciplineScreen />,
    <FeedbackScreen />,
    <MessagesScreen navigate={navigate} />,
    <ChatRoomScreen params={{roomId: 1}} />,
    <StaffScreen />,
    <LessonPlansScreen />,
    <FeesScreen />,
    <OnlineClassScreen />,
    <ChangePasswordScreen onDone={jest.fn()} />,
  ];
  for (const element of screens) {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = renderScreen(element);
      await Promise.resolve();
      await Promise.resolve();
    });
    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
  }
});
