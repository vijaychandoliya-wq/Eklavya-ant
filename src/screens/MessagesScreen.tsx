import React, {useCallback} from 'react';
import {AnyRecord, getMessages} from '../api';
import {cleanDate, useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, RecordCard, Screen} from '../components/ui';

export default function MessagesScreen() {
  const loader = useCallback(() => getMessages(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);

  if (loading) {
    return <LoadingBlock />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      {data.length ? (
        data.map((item, index) => (
          <RecordCard
            key={item.id || index}
            title={item.title || item.subject || item.sender || 'Message'}
            status={item.status || item.type}
            icon="message"
            meta={[cleanDate(item.created_at || item.date), item.sender]}
            body={item.message || item.body || item.content}
          />
        ))
      ) : (
        <EmptyBlock title="No messages" message="School messages will appear here." icon="message" />
      )}
    </Screen>
  );
}
