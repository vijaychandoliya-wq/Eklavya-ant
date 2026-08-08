import React, {useCallback, useState} from 'react';
import {Tabs, View, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getPastExams, getUpcomingExams} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';
import {ScreenKey, ScreenParams} from '../navigation';

const TABS = [{title: 'Upcoming', key: 'upcoming'}, {title: 'Past', key: 'past'}];

export default function ExamsScreen({navigate}: {navigate: (screen: ScreenKey, params?: ScreenParams) => void}) {
  const [tab, setTab] = useState(0);
  const loader = useCallback(() => (tab === 0 ? getUpcomingExams() : getPastExams()), [tab]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Exams" subtitle="Upcoming and past exams for the selected child." />
      <Tabs tabs={TABS} page={tab} onChange={(_i, index) => setTab(index)} swipeable={false} noRenderContent><View /></Tabs>
      <WhiteSpace size="lg" />
      {loading ? <LoadingBlock /> : data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.name || item.exam_name || 'Exam'}
          status={tab === 0 ? 'Upcoming' : 'Past'}
          icon="solution"
          meta={[item.start_date || item.date]}
          onPress={tab === 1 ? () => navigate('examMarks', {examId: item.id || item.exam_id}) : undefined}
        />
      )) : <EmptyBlock title="No exams" message="Exams will appear here." icon="solution" />}
    </Screen>
  );
}
