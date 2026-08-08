import React, {useCallback} from 'react';
import {AnyRecord, getClassEvents} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function ClassEventsScreen() {
  const loader = useCallback(() => getClassEvents(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Class events" subtitle="Events for the selected child." />
      {data.length ? data.map((event, index) => (
        <RecordCard
          key={event.event_id || event.id || index}
          title={event.title || 'Class event'}
          status={event.select_type || 'class'}
          icon="calendar"
          meta={[event.start_date || event.date]}
          body={event.description}
        />
      )) : <EmptyBlock title="No class events" message="Class events will appear here." icon="calendar" />}
    </Screen>
  );
}
