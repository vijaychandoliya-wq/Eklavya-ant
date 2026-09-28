import React, {useCallback, useMemo, useState} from 'react';
import {WhiteSpace} from '@ant-design/react-native';
import {getAttendance} from '../api';
import {cleanDate, formatDate, useAsyncData} from '../hooks';
import {
  DateField,
  EmptyBlock,
  FieldList,
  LoadingBlock,
  PageTitle,
  RecordCard,
  Screen,
  SectionTitle,
  StatCard,
} from '../components/ui';

function rowDateKey(row: any): string {
  return cleanDate(row.date || row.attendance_date || row.created_at || '').slice(0, 10);
}

export default function AttendanceScreen() {
  const [filterDate, setFilterDate] = useState(new Date());
  const loader = useCallback(() => getAttendance(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData(loader, {
    percentage: '—',
    rows: [],
  });

  const filtered = useMemo(() => {
    const key = formatDate(filterDate);
    const matched = (data.rows || []).filter((row: any) => {
      const value = rowDateKey(row);
      return !value || value === key || value.includes(key);
    });
    // If nothing matches the selected day, show all rows rather than an empty trap.
    return matched.length ? matched : data.rows || [];
  }, [data.rows, filterDate]);

  const showingFiltered = filtered.length !== (data.rows || []).length;

  if (loading) {
    return <LoadingBlock />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Attendance" subtitle="Attendance record for the selected child." />
      <StatCard icon="check-square" label="Attendance" value={String(data.percentage)} />
      <WhiteSpace size="md" />
      <FieldList>
        <DateField
          label="Filter by date"
          value={filterDate}
          onChange={setFilterDate}
          maxDate={new Date()}
        />
      </FieldList>
      <SectionTitle
        title={showingFiltered ? `Records for ${formatDate(filterDate)}` : 'All records'}
      />
      {filtered.length ? (
        filtered.map((row: any, index: number) => (
          <RecordCard
            key={index}
            title={row.date || 'Attendance'}
            status={row.session}
            icon="check-square"
            meta={[row.reason, row.remarks]}
          />
        ))
      ) : (
        <EmptyBlock
          title="No attendance rows"
          message="Attendance details will appear here."
          icon="check-square"
        />
      )}
    </Screen>
  );
}
