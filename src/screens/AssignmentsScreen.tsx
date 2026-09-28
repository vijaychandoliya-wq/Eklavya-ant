import React, {useCallback, useState} from 'react';
import {AnyRecord, getCompletedAssignments, getOngoingAssignments} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SegmentedTabs} from '../components/ui';

const TABS = [
  {key: 'ongoing', label: 'Ongoing'},
  {key: 'completed', label: 'Completed'},
];

export default function AssignmentsScreen() {
  const [tab, setTab] = useState('ongoing');
  const loader = useCallback(
    () => (tab === 'ongoing' ? getOngoingAssignments() : getCompletedAssignments()),
    [tab],
  );
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Assignments" subtitle="Assignments for the selected child." />
      <SegmentedTabs items={TABS} value={tab} onChange={setTab} />
      {loading ? (
        <LoadingBlock />
      ) : data.length ? (
        data.map((item, index) => (
          <RecordCard
            key={item.id || index}
            title={item.title || item.assignment_title || 'Assignment'}
            status={tab === 'ongoing' ? 'Ongoing' : 'Completed'}
            icon="file-text"
            meta={[item.subject, item.submission_date || item.due_date]}
            body={item.description}
          />
        ))
      ) : (
        <EmptyBlock title="No assignments" message="Assignments will appear here." icon="file-text" />
      )}
    </Screen>
  );
}
