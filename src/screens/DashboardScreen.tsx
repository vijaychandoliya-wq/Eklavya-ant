import React, {useCallback, useState} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Flex, Picker, Tag, Text, View} from '@ant-design/react-native';
import {
  AnyRecord,
  ensureSelectedChild,
  getChildren,
  getSchool,
  getSchoolNotices,
  setSelectedChild,
} from '../api';
import {cleanDate, pickerData, useAsyncData} from '../hooks';
import {
  AntIcon,
  CardContent,
  EmptyBlock,
  IconBadge,
  LoadingBlock,
  RecordCard,
  Screen,
  SectionTitle,
} from '../components/ui';
import {ScreenKey} from '../navigation';
import {colors, font, radius, spacing} from '../theme';

const SHORTCUTS: {
  key: ScreenKey;
  label: string;
  icon: any;
  color: string;
  background: string;
}[] = [
  {key: 'attendance', label: 'Attendance', icon: 'calendar', color: '#1677ff', background: '#e6f4ff'},
  {key: 'homework', label: 'Homework', icon: 'book', color: '#00b578', background: '#e8f8f0'},
  {key: 'assignments', label: 'Assignments', icon: 'file-text', color: '#ff8f1f', background: '#fff4e6'},
  {key: 'exams', label: 'Exams', icon: 'solution', color: '#722ed1', background: '#f4e8ff'},
  {key: 'fees', label: 'Fees', icon: 'account-book', color: '#faad14', background: '#fffbe6'},
  {key: 'leave', label: 'Leave', icon: 'form', color: '#eb2f96', background: '#fff0f6'},
];

type Data = {
  school: AnyRecord;
  notices: AnyRecord[];
  children: AnyRecord[];
  child: AnyRecord | null;
};

export default function DashboardScreen({
  navigate,
  profile,
  onChildChanged,
}: {
  navigate: (screen: ScreenKey) => void;
  profile: AnyRecord | null;
  onChildChanged: () => void;
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const loader = useCallback(async (): Promise<Data> => {
    const [school, notices, children, child] = await Promise.all([
      getSchool(),
      getSchoolNotices(),
      getChildren(),
      ensureSelectedChild(),
    ]);
    return {school, notices, children, child};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError, reload} = useAsyncData(loader, {
    school: {},
    notices: [],
    children: [],
    child: null,
  });

  if (loading) {
    return <LoadingBlock />;
  }

  const firstName = String(profile?.name || 'Parent').split(' ')[0];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <Flex justify="between" align="center" style={styles.greetingRow}>
        <View style={styles.flex}>
          <Text style={styles.hello}>Hello, {firstName}!</Text>
          <Text style={styles.schoolName}>{data.school.schoolName || 'Gurukull School'}</Text>
        </View>
        <View style={styles.schoolMark}>
          <AntIcon name="bank" color={colors.primary} size={28} />
        </View>
      </Flex>

      <Card style={styles.block}>
        <CardContent>
          <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
            <Tag small style={styles.childTag}>
              Selected child
            </Tag>
            <Flex justify="between" align="center" style={styles.childRow}>
              <View style={styles.flex}>
                <Text style={styles.childName}>{data.child?.name || 'Select child'}</Text>
                <Text style={styles.childMeta}>
                  {data.children.length} linked {data.children.length === 1 ? 'child' : 'children'}
                </Text>
              </View>
              <AntIcon name="down" color={colors.weak} size={16} />
            </Flex>
          </TouchableOpacity>
        </CardContent>
      </Card>

      <SectionTitle title="Quick actions" extra="View all" onExtraPress={() => navigate('timetable')} />
      <View style={styles.grid}>
        {SHORTCUTS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.gridItem}
            onPress={() => navigate(item.key)}
            activeOpacity={0.7}>
            <View style={[styles.gridIcon, {backgroundColor: item.background}]}>
              <AntIcon name={item.icon} color={item.color} size={22} />
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('notices')}>
        <Card style={styles.block}>
          <CardContent>
            <Flex align="center">
              <IconBadge icon="bell" color="#fff" background={colors.primary} />
              <View style={styles.flex}>
                <Text style={styles.noticeCount}>{data.notices.length}</Text>
                <Text style={styles.noticeLabel}>School notices</Text>
              </View>
              <AntIcon name="right" color={colors.weak} size={16} />
            </Flex>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <SectionTitle title="Recent notices" extra="View all" onExtraPress={() => navigate('notices')} />
      {data.notices.length ? (
        data.notices.slice(0, 4).map((notice, index) => (
          <RecordCard
            key={notice.id || index}
            title={notice.title || 'Notice'}
            status={notice.type || 'School'}
            icon="sound"
            meta={[cleanDate(notice.publish_date)]}
            onPress={() => navigate('notices')}
          />
        ))
      ) : (
        <EmptyBlock title="No notices" message="School announcements will appear here." icon="bell" />
      )}

      <Picker
        visible={pickerVisible}
        data={pickerData(data.children, 'name', 'student_id')}
        cols={1}
        value={data.child?.student_id ? [String(data.child.student_id)] : []}
        onClose={() => setPickerVisible(false)}
        onOk={async value => {
          const selected = data.children.find(item => String(item.student_id) === String(value?.[0]));
          if (selected) {
            await setSelectedChild(selected);
            onChildChanged();
            reload();
          }
          setPickerVisible(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  greetingRow: {marginBottom: spacing.m},
  hello: {fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.text},
  schoolName: {fontSize: font.m, color: colors.textSecondary, marginTop: 2},
  schoolMark: {
    width: 48,
    height: 48,
    borderRadius: radius.l,
    backgroundColor: colors.wathet,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  block: {marginBottom: spacing.m, borderRadius: radius.l, overflow: 'hidden'},
  childTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.wathet,
    borderColor: colors.wathet,
    marginBottom: 8,
  },
  childRow: {marginTop: 2},
  childName: {fontSize: font.xxl, fontWeight: '700', color: colors.text},
  childMeta: {fontSize: font.main, color: colors.textSecondary, marginTop: 2},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  gridItem: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {fontSize: font.s, color: colors.text, textAlign: 'center', fontWeight: '500'},
  noticeCount: {fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 26},
  noticeLabel: {fontSize: font.main, color: colors.textSecondary, marginTop: 2},
});
