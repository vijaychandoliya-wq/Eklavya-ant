import React, {useCallback} from 'react';
import {Image, StyleSheet} from 'react-native';
import {Card, Text, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getSchool} from '../api';
import {useAsyncData} from '../hooks';
import {CardContent, LoadingBlock, PageTitle, Screen} from '../components/ui';
import {colors, font, radius} from '../theme';

export default function SchoolScreen() {
  const loader = useCallback(() => getSchool(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord>(loader, {});
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="School info" subtitle="Details about your school." />
      <Card style={styles.card}>
        <CardContent>
          {data.schoolLogo ? <Image source={{uri: data.schoolLogo}} style={styles.logo} /> : null}
          <Text style={styles.name}>{data.schoolName || 'School'}</Text>
          <WhiteSpace />
          {[
            ['Address', data.address || data.schoolAddress],
            ['Phone', data.phone || data.schoolPhone],
            ['Email', data.email || data.schoolEmail],
            ['Website', data.website],
          ].filter(([, value]) => value).map(([label, value]) => (
            <Text key={String(label)} style={styles.row}><Text style={styles.label}>{label}: </Text>{String(value)}</Text>
          ))}
        </CardContent>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {borderRadius: radius.l, overflow: 'hidden'},
  logo: {width: 72, height: 72, borderRadius: 12, marginBottom: 12},
  name: {fontSize: font.huge, fontWeight: '700', color: colors.text},
  row: {fontSize: font.main, color: colors.textSecondary, marginTop: 8, lineHeight: 20},
  label: {fontWeight: '600', color: colors.text},
});
