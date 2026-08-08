import React, {useCallback, useState} from 'react';
import {Tabs, View, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getCompletedAssignments, getOngoingAssignments} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

const TABS = [{title: 'Ongoing', key: 'ongoing'}, {title: 'Completed', key: 'completed'}];

export default function AssignmentsScreen() {
  const [tab, setTab] = useState(0);
  const loader = useCallback(() => (tab === 0 ? getOngoingAssignments() : getCompletedAssignments()), [tab]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Assignments" subtitle="Assignments for the selected child." />
      <Tabs tabs={TABS} page={tab} onChange={(_i, index) => setTab(index)} swipeable={false} noRenderContent><View /></Tabs>
      <WhiteSpace size="lg" />
      {loading ? <LoadingBlock /> : data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.title || item.assignment_title || 'Assignment'}
          status={tab === 0 ? 'Ongoing' : 'Completed'}
          icon="file-text"
          meta={[item.subject, item.submission_date || item.due_date]}
          body={item.description}
        />
      )) : <EmptyBlock title="No assignments" message="Assignments will appear here." icon="file-text" />}
    </Screen>
  );
}
