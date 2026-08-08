import React, {useCallback} from 'react';
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
  cardHeaderStyles,
} from '../components/ui';
import {ScreenKey} from '../navigation';
import {colors, font, radius} from '../theme';

export default function ProfileScreen({
  profile,
  navigate,
}: {
  profile: AnyRecord | null;
  navigate: (screen: ScreenKey) => void;
}) {
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
        <Card.Header styles={cardHeaderStyles} title="Parent" thumb={<AntIcon name="user" />} />
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
          thumb={<AntIcon name="user" />}
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
      <WhiteSpace size="lg" />
      <Button type="primary" onPress={() => navigate('changePassword')}>
        <ButtonLabel icon="lock" tone="onPrimary">
          Change password
        </ButtonLabel>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {borderRadius: radius.l, overflow: 'hidden'},
  line: {fontSize: font.xxl, fontWeight: '700', color: colors.text},
  meta: {fontSize: font.main, color: colors.textSecondary, marginTop: 4},
});
