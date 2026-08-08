import React, {useCallback} from 'react';
import {AnyRecord, getMagazine} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function MagazineScreen() {
  const loader = useCallback(() => getMagazine(1), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Magazine" subtitle="School magazine and bulletins." />
      {data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.title || item.name || 'Magazine item'}
          icon="read"
          meta={[item.publish_date || item.created_at]}
          body={item.description || item.content}
        />
      )) : <EmptyBlock title="No magazine items" message="Published magazines will appear here." icon="read" />}
    </Screen>
  );
}
