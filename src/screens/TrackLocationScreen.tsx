import React, {useCallback} from 'react';
import {WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getTransportLocations, getTripStatus} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, StatCard} from '../components/ui';

export default function TrackLocationScreen() {
  const loader = useCallback(async () => {
    const [status, locations] = await Promise.all([getTripStatus(), getTransportLocations()]);
    return {status, locations};
  }, []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData(loader, {status: {}, locations: [] as AnyRecord[]});
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Track location" subtitle="Live school transport status." />
      <StatCard
        icon="compass"
        label="Trip status"
        value={String(data.status.active ? 'Active' : data.status.status || 'Inactive')}
      />
      <WhiteSpace size="lg" />
      {data.locations.length ? data.locations.map((item: AnyRecord, index: number) => (
        <RecordCard key={index} title={item.name || `Point ${index + 1}`} icon="compass" meta={[item.latitude, item.longitude, item.updated_at]} />
      )) : <EmptyBlock title="No live location" message="Transport tracking will appear when a trip is active." icon="compass" />}
    </Screen>
  );
}
