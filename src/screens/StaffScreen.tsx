import React, {useCallback} from 'react';
import {AnyRecord, getTeachers} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function StaffScreen() {
  const loader = useCallback(() => getTeachers(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Staff info" subtitle="Teachers linked to the selected child." />
      {data.length ? data.map((item, index) => (
        <RecordCard
          key={item.teacher_id || item.id || index}
          title={item.teacherFullname || item.name || 'Teacher'}
          status={item.subject || item.designation}
          icon="team"
          meta={[item.email, item.mobile_no]}
        />
      )) : <EmptyBlock title="No staff listed" message="Teachers will appear here." icon="team" />}
    </Screen>
  );
}
