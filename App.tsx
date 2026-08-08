import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Badge, Button, Drawer, Flex, List, Provider, Text, View} from '@ant-design/react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import enUS from '@ant-design/react-native/lib/locale-provider/en_US';
import {
  AnyRecord,
  ApiError,
  clearSession,
  ensureSelectedChild,
  getParentProfile,
  getSchoolNotices,
  getSelectedChild,
  hasSession,
  logout,
} from './src/api';
import {initials} from './src/hooks';
import {AntIcon, ButtonLabel, LoadingBlock} from './src/components/ui';
import {
  BOTTOM_TABS,
  DRAWER_MENU,
  Route,
  ScreenKey,
  ScreenParams,
  isBottomTab,
  screenTitle,
} from './src/navigation';
import {antdTheme, colors, font, spacing} from './src/theme';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LeaveScreen from './src/screens/LeaveScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import TrackLocationScreen from './src/screens/TrackLocationScreen';
import SchoolScreen from './src/screens/SchoolScreen';
import NoticesScreen from './src/screens/NoticesScreen';
import EventsScreen from './src/screens/EventsScreen';
import ClassEventsScreen from './src/screens/ClassEventsScreen';
import MagazineScreen from './src/screens/MagazineScreen';
import HomeworkScreen from './src/screens/HomeworkScreen';
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import ExamsScreen from './src/screens/ExamsScreen';
import ExamMarksScreen from './src/screens/ExamMarksScreen';
import TimetableScreen from './src/screens/TimetableScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import DisciplineScreen from './src/screens/DisciplineScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import StaffScreen from './src/screens/StaffScreen';
import LessonPlansScreen from './src/screens/LessonPlansScreen';
import FeesScreen from './src/screens/FeesScreen';
import OnlineClassScreen from './src/screens/OnlineClassScreen';

function DrawerSidebar({
  profile,
  child,
  active,
  navigate,
  signOut,
}: {
  profile: AnyRecord | null;
  child: AnyRecord | null;
  active: ScreenKey;
  navigate: (screen: ScreenKey) => void;
  signOut: () => void;
}) {
  return (
    <SafeAreaView style={styles.drawerSafe} edges={['top', 'bottom']}>
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerInitials}>{initials(profile?.name || 'Parent')}</Text>
        </View>
        <Text style={styles.drawerName}>{profile?.name || 'Eklavya Parent'}</Text>
        <Text style={styles.drawerRole}>{child?.name ? `Child: ${child.name}` : 'Parent'}</Text>
      </View>
      <List style={styles.drawerList}>
        {DRAWER_MENU.map(item => {
          const isActive = active === item.key;
          return (
            <List.Item
              key={item.key}
              onPress={() => navigate(item.key)}
              thumb={<AntIcon name={item.icon} color={isActive ? colors.primary : colors.weak} size={20} />}
              arrow={isActive ? 'horizontal' : undefined}
              styles={{Line: isActive ? styles.activeMenuLine : undefined}}>
              <Text style={isActive ? styles.activeMenuText : styles.menuText}>{item.title}</Text>
            </List.Item>
          );
        })}
      </List>
      <View style={styles.drawerFooter}>
        <Button type="warning" onPress={signOut}>
          <ButtonLabel icon="logout" tone="danger">
            Sign out
          </ButtonLabel>
        </Button>
        <Text style={styles.versionText}>Eklavya · Ant Design Mobile</Text>
      </View>
    </SafeAreaView>
  );
}

function TopHeader({
  title,
  canGoBack,
  noticeCount,
  profile,
  onMenu,
  onBack,
  onNotices,
  onProfile,
}: {
  title: string;
  canGoBack: boolean;
  noticeCount: number;
  profile: AnyRecord | null;
  onMenu: () => void;
  onBack: () => void;
  onNotices: () => void;
  onProfile: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Flex align="center" justify="between">
        <TouchableOpacity style={styles.iconHit} onPress={canGoBack ? onBack : onMenu}>
          <AntIcon name={canGoBack ? 'left' : 'menu'} color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {title}
        </Text>
        <Flex align="center">
          <TouchableOpacity style={styles.iconHit} onPress={onNotices}>
            <Badge text={noticeCount > 0 ? noticeCount : undefined} overflowCount={9}>
              <View>
                <AntIcon name="bell" color={colors.text} size={22} />
              </View>
            </Badge>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAvatar} onPress={onProfile} activeOpacity={0.8}>
            <Text style={styles.headerAvatarText}>{initials(profile?.name || 'P')}</Text>
          </TouchableOpacity>
        </Flex>
      </Flex>
    </View>
  );
}

/**
 * Compact bottom tabs only.
 * Ant Design RN TabBar wraps a flex:1 white content pane — using it as a sibling
 * of the real screen splits the viewport in half (blank white space).
 */
function BottomNav({
  active,
  onPress,
}: {
  active: ScreenKey;
  onPress: (key: ScreenKey) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {BOTTOM_TABS.map(tab => {
        const selected = active === tab.key;
        const tint = selected ? colors.primary : colors.weak;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.bottomNavItem}
            onPress={() => onPress(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{selected}}>
            <AntIcon name={tab.icon} color={tint} size={22} />
            <Text style={[styles.bottomNavLabel, selected && styles.bottomNavLabelActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ParentApp({onSignedOut}: {onSignedOut: () => void}) {
  const [route, setRoute] = useState<Route>({key: 'dashboard'});
  const [history, setHistory] = useState<Route[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<AnyRecord | null>(null);
  const [child, setChild] = useState<AnyRecord | null>(null);
  const [noticeCount, setNoticeCount] = useState(0);

  const loadSession = useCallback(async () => {
    try {
      const [parent, selected, notices] = await Promise.all([
        getParentProfile(),
        ensureSelectedChild(),
        getSchoolNotices().catch(() => []),
      ]);
      setProfile(parent);
      setChild(selected);
      setNoticeCount(Array.isArray(notices) ? notices.length : 0);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        await clearSession();
        onSignedOut();
      }
    }
  }, [onSignedOut]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const navigate = useCallback(
    (key: ScreenKey, params?: ScreenParams) => {
      // Tab roots reset the stack; every other destination is a drill-down.
      if (isBottomTab(key)) {
        setHistory([]);
      } else {
        setHistory(current => [...current, route]);
      }
      setRoute({key, params});
      setDrawerOpen(false);
    },
    [route],
  );

  const goBack = useCallback(() => {
    setHistory(current => {
      if (!current.length) {
        return current;
      }
      setRoute(current[current.length - 1]);
      return current.slice(0, -1);
    });
  }, []);

  const signOut = async () => {
    setDrawerOpen(false);
    try {
      await logout();
    } catch {
      await clearSession();
    }
    onSignedOut();
  };

  const content = useMemo(() => {
    switch (route.key) {
      case 'profile':
        return <ProfileScreen profile={profile} navigate={navigate} />;
      case 'leave':
        return <LeaveScreen />;
      case 'changePassword':
        return <ChangePasswordScreen onDone={goBack} />;
      case 'trackLocation':
        return <TrackLocationScreen />;
      case 'school':
        return <SchoolScreen />;
      case 'notices':
        return <NoticesScreen />;
      case 'events':
        return <EventsScreen />;
      case 'classEvents':
        return <ClassEventsScreen />;
      case 'magazine':
        return <MagazineScreen />;
      case 'homework':
        return <HomeworkScreen />;
      case 'assignments':
        return <AssignmentsScreen />;
      case 'exams':
        return <ExamsScreen navigate={navigate} />;
      case 'examMarks':
        return <ExamMarksScreen params={route.params} />;
      case 'timetable':
        return <TimetableScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'discipline':
        return <DisciplineScreen />;
      case 'feedback':
        return <FeedbackScreen />;
      case 'messages':
        return <MessagesScreen />;
      case 'staff':
        return <StaffScreen />;
      case 'lessonPlans':
        return <LessonPlansScreen />;
      case 'fees':
        return <FeesScreen />;
      case 'onlineClass':
        return <OnlineClassScreen />;
      default:
        return (
          <DashboardScreen
            navigate={navigate}
            profile={profile}
            onChildChanged={async () => {
              setChild(await getSelectedChild());
            }}
          />
        );
    }
  }, [route, profile, navigate, goBack]);

  const canGoBack = history.length > 0;
  const showBottomTabs = isBottomTab(route.key);

  return (
    <SafeAreaView style={styles.appSafe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <Drawer
        sidebar={
          <DrawerSidebar
            profile={profile}
            child={child}
            active={route.key}
            navigate={navigate}
            signOut={signOut}
          />
        }
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        drawerWidth={310}
        drawerBackgroundColor={colors.surface}>
        <View style={styles.appShell}>
          <TopHeader
            title={screenTitle(route.key)}
            canGoBack={canGoBack}
            noticeCount={noticeCount}
            profile={profile}
            onMenu={() => setDrawerOpen(true)}
            onBack={goBack}
            onNotices={() => navigate('notices')}
            onProfile={() => navigate('profile')}
          />
          <View style={styles.flex}>{content}</View>
          {showBottomTabs ? <BottomNav active={route.key} onPress={navigate} /> : null}
        </View>
      </Drawer>
    </SafeAreaView>
  );
}

function Root() {
  const [booting, setBooting] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    hasSession()
      .then(setAuthenticated)
      .finally(() => setBooting(false));
  }, []);

  if (booting) {
    return (
      <SafeAreaView style={styles.appSafe}>
        <LoadingBlock />
      </SafeAreaView>
    );
  }

  return authenticated ? (
    <ParentApp onSignedOut={() => setAuthenticated(false)} />
  ) : (
    <LoginScreen onSuccess={() => setAuthenticated(true)} />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Provider theme={antdTheme} locale={enUS}>
          <Root />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  appSafe: {flex: 1, backgroundColor: colors.surface},
  appShell: {flex: 1, backgroundColor: colors.background},
  topBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topBarTitle: {
    fontSize: font.xxl,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  iconHit: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  headerAvatarText: {color: '#fff', fontSize: font.ms, fontWeight: '700'},
  drawerSafe: {flex: 1, backgroundColor: colors.surface},
  drawerHeader: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: spacing.xl - 4,
    backgroundColor: '#f0f5ff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#adc6ff',
  },
  drawerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  drawerInitials: {fontSize: 24, fontWeight: '700', color: '#fff'},
  drawerName: {fontSize: font.huge, fontWeight: '700', color: colors.text, marginTop: 12},
  drawerRole: {fontSize: font.main, color: colors.textSecondary, marginTop: 3},
  drawerList: {marginTop: 10},
  activeMenuLine: {backgroundColor: colors.wathet},
  activeMenuText: {fontSize: font.l, fontWeight: '600', color: colors.primary},
  menuText: {fontSize: font.l, color: colors.text},
  drawerFooter: {
    marginTop: 'auto',
    padding: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  versionText: {fontSize: font.s, color: colors.weak, textAlign: 'center', marginTop: 12},
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingBottom: 4,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
  },
  bottomNavLabel: {
    marginTop: 2,
    fontSize: font.s,
    color: colors.weak,
  },
  bottomNavLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
