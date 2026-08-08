import React, {useCallback} from 'react';
import {AnyRecord, getUpcomingEvents} from '../api';
import {cleanDate, useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, RecordCard, Screen} from '../components/ui';

export default function EventsScreen() {
  const loader = useCallback(() => getUpcomingEvents(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      {data.length ? data.map((event, index) => (
        <RecordCard
          key={event.event_id || event.id || index}
          title={event.title || 'Event'}
          status={event.select_type}
          icon="flag"
          meta={[event.start_date || event.date, event.location]}
          body={event.description}
        />
      )) : <EmptyBlock title="No events" message="Upcoming events will appear here." icon="flag" />}
    </Screen>
  );
}
