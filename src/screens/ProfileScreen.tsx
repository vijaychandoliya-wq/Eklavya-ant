import React, {useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Card, Text, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getChildDetails, getSelectedChild} from '../api';
import {useAsyncData} from '../hooks';
import {
  AntIcon,
  ButtonLabel,
  CardContent,
  LoadingBlock,
  Screen,
  SegmentedTabs,
  cardHeaderStyles,
} from '../components/ui';
import {ScreenKey} from '../navigation';
import {
  colorsDark,
  font,
  radius,
  spacing,
  useAppTheme,
  type AppColors,
  type ThemeMode,
} from '../theme';

type Palette = AppColors | typeof colorsDark;

const THEME_OPTIONS: {key: ThemeMode; label: string}[] = [
  {key: 'light', label: 'Light'},
  {key: 'dark', label: 'Dark'},
  {key: 'system', label: 'System'},
];

function makeStyles(c: Palette) {
  return StyleSheet.create({
    card: {borderRadius: radius.l, overflow: 'hidden'},
    line: {fontSize: font.xxl, fontWeight: '700', color: c.text},
    meta: {fontSize: font.main, color: c.textSecondary, marginTop: 4},
    themeHint: {
      fontSize: font.main,
      color: c.textSecondary,
      marginBottom: spacing.m,
      lineHeight: 18,
    },
    themeSegment: {marginBottom: 0},
  });
}

export default function ProfileScreen({
  profile,
  navigate,
}: {
  profile: AnyRecord | null;
  navigate: (screen: ScreenKey) => void;
}) {
  const {colors, mode, setMode} = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const loader = useCallback(async () => {
    const child = await getSelectedChild();
    const details = await getChildDetails(child?.student_id);
    return {child, details};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData(loader, {
    child: null,
    details: {},
  });
  if (loading) {
    return <LoadingBlock />;
  }
  const details = data.details || {};
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Parent"
          thumb={<AntIcon name="user" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.line}>{profile?.name || 'Parent'}</Text>
          <Text style={styles.meta}>{profile?.email || ''}</Text>
        </CardContent>
      </Card>
      <WhiteSpace size="md" />
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Selected child"
          thumb={<AntIcon name="user" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.line}>{details.fullName || data.child?.name || 'Child'}</Text>
          <Text style={styles.meta}>
            {details.gender} · DOB {details.dateOfBirth || '—'}
          </Text>
          <Text style={styles.meta}>
            {details.className || details.standard || details.schoolName || ''}
          </Text>
        </CardContent>
      </Card>
      <WhiteSpace size="md" />
      <Card style={styles.card}>
        <Card.Header
          styles={cardHeaderStyles}
          title="Appearance"
          thumb={<AntIcon name="bulb" color={colors.primary} />}
        />
        <CardContent>
          <Text style={styles.themeHint}>
            Choose light, dark, or follow the device setting. Preference is saved on this phone.
          </Text>
          <SegmentedTabs
            items={THEME_OPTIONS}
            value={mode}
            onChange={key => setMode(key as ThemeMode)}
            style={styles.themeSegment}
          />
        </CardContent>
      </Card>
      <WhiteSpace size="lg" />
      <Button type="primary" onPress={() => navigate('changePassword')}>
        <ButtonLabel icon="lock" tone="onPrimary">
          Change password
        </ButtonLabel>
      </Button>
    </Screen>
  );
}
