import React, {useCallback} from 'react';
import {WhiteSpace} from '@ant-design/react-native';
import {getAttendance} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, StatCard} from '../components/ui';

export default function AttendanceScreen() {
  const loader = useCallback(() => getAttendance(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData(loader, {percentage: '—', rows: []});
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Attendance" subtitle="Attendance record for the selected child." />
      <StatCard icon="check-square" label="Attendance" value={String(data.percentage)} />
      <WhiteSpace size="lg" />
      {data.rows.length ? data.rows.map((row: any, index: number) => (
        <RecordCard
          key={index}
          title={row.date || 'Attendance'}
          status={row.session}
          icon="check-square"
          meta={[row.reason, row.remarks]}
        />
      )) : <EmptyBlock title="No attendance rows" message="Attendance details will appear here." icon="check-square" />}
    </Screen>
  );
}
