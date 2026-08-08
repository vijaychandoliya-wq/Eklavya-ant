import React, {useCallback} from 'react';
import {AnyRecord, getOnlineClasses} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function OnlineClassScreen() {
  const loader = useCallback(() => getOnlineClasses(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Online class" subtitle="Video conference rooms for the selected child." />
      {data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || item.slug || index}
          title={item.title || item.name || item.slug || 'Online class'}
          status={item.status || (item.available === false ? 'Unavailable' : 'Available')}
          icon="video-camera"
          meta={[item.start_time, item.teacher]}
          body={item.description}
        />
      )) : <EmptyBlock title="No online classes" message="Scheduled online classes will appear here." icon="video-camera" />}
    </Screen>
  );
}
