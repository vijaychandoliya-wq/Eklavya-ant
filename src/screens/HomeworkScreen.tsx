import React, {useCallback, useState} from 'react';
import {Tabs, View, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getFinishedHomework, getPendingHomework} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

const TABS = [{title: 'Pending', key: 'pending'}, {title: 'Finished', key: 'finished'}];

export default function HomeworkScreen() {
  const [tab, setTab] = useState(0);
  const loader = useCallback(() => (tab === 0 ? getPendingHomework() : getFinishedHomework()), [tab]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Homework" subtitle="Work assigned to the selected child." />
      <Tabs tabs={TABS} page={tab} onChange={(_i, index) => setTab(index)} swipeable={false} noRenderContent><View /></Tabs>
      <WhiteSpace size="lg" />
      {loading ? <LoadingBlock /> : data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.title || item.subject || 'Homework'}
          status={tab === 0 ? 'Pending' : 'Finished'}
          icon="book"
          meta={[item.subject, item.submission_date || item.due_date]}
          body={item.description}
        />
      )) : <EmptyBlock title="No homework" message={tab === 0 ? 'No pending homework.' : 'No finished homework yet.'} icon="book" />}
    </Screen>
  );
}
