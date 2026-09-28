import React, {useCallback, useState} from 'react';
import {AnyRecord, getPastExams, getUpcomingExams} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SegmentedTabs} from '../components/ui';
import {ScreenKey, ScreenParams} from '../navigation';

const TABS = [
  {key: 'upcoming', label: 'Upcoming'},
  {key: 'past', label: 'Past'},
];

export default function ExamsScreen({
  navigate,
}: {
  navigate: (screen: ScreenKey, params?: ScreenParams) => void;
}) {
  const [tab, setTab] = useState('upcoming');
  const loader = useCallback(
    () => (tab === 'upcoming' ? getUpcomingExams() : getPastExams()),
    [tab],
  );
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Exams" subtitle="Upcoming and past exams for the selected child." />
      <SegmentedTabs items={TABS} value={tab} onChange={setTab} />
      {loading ? (
        <LoadingBlock />
      ) : data.length ? (
        data.map((item, index) => (
          <RecordCard
            key={item.id || index}
            title={item.name || item.exam_name || 'Exam'}
            status={tab === 'upcoming' ? 'Upcoming' : 'Past'}
            icon="solution"
            meta={[item.start_date || item.date]}
            onPress={
              tab === 'past'
                ? () => navigate('examMarks', {examId: item.id || item.exam_id})
                : undefined
            }
          />
        ))
      ) : (
        <EmptyBlock title="No exams" message="Exams will appear here." icon="solution" />
      )}
    </Screen>
  );
}
