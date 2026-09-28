import React, {useCallback, useState} from 'react';
import {AnyRecord, getFinishedHomework, getPendingHomework} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SegmentedTabs} from '../components/ui';

const TABS = [
  {key: 'pending', label: 'Pending'},
  {key: 'finished', label: 'Finished'},
];

export default function HomeworkScreen() {
  const [tab, setTab] = useState('pending');
  const loader = useCallback(
    () => (tab === 'pending' ? getPendingHomework() : getFinishedHomework()),
    [tab],
  );
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Homework" subtitle="Work assigned to the selected child." />
      <SegmentedTabs items={TABS} value={tab} onChange={setTab} />
      {loading ? (
        <LoadingBlock />
      ) : data.length ? (
        data.map((item, index) => (
          <RecordCard
            key={item.id || index}
            title={item.title || item.subject || 'Homework'}
            status={tab === 'pending' ? 'Pending' : 'Finished'}
            icon="book"
            meta={[item.subject, item.submission_date || item.due_date]}
            body={item.description}
          />
        ))
      ) : (
        <EmptyBlock
          title="No homework"
          message={tab === 'pending' ? 'No pending homework.' : 'No finished homework yet.'}
          icon="book"
        />
      )}
    </Screen>
  );
}
