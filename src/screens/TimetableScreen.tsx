import React, {useCallback} from 'react';
import {View} from '@ant-design/react-native';
import {AnyRecord, getTimetable} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SectionTitle} from '../components/ui';

export default function TimetableScreen() {
  const loader = useCallback(async () => getTimetable(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord>(loader, {});
  if (loading) {
    return <LoadingBlock />;
  }

  const days = Object.keys(data || {}).filter(key => Array.isArray(data[key]));
  const hasRows = days.some(day => (data[day] || []).length);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Timetable" subtitle="Weekly class schedule." />
      {!hasRows ? (
        <EmptyBlock title="No timetable" message="The timetable will appear once published." icon="calendar" />
      ) : (
        days.map(day => (
          <View key={day}>
            <SectionTitle title={day} />
            {(data[day] || []).map((period: AnyRecord, index: number) => (
              <RecordCard
                key={`${day}-${index}`}
                title={period.subject || period.subject_name || `Period ${index + 1}`}
                status={period.teacher || period.teacher_name}
                icon="calendar"
                meta={[period.start_time, period.end_time, period.room]}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}
