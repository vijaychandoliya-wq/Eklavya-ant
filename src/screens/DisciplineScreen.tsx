import React, {useCallback} from 'react';
import {AnyRecord, getDisciplines} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function DisciplineScreen() {
  const loader = useCallback(() => getDisciplines(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Discipline" subtitle="Discipline records for the selected child." />
      {data.length ? data.map((item, index) => (
        <RecordCard key={item.id || index} title={item.title || item.type || 'Record'} status={item.status} icon="trophy" meta={[item.date]} body={item.remarks || item.description} />
      )) : <EmptyBlock title="No records" message="Discipline records will appear here." icon="trophy" />}
    </Screen>
  );
}
