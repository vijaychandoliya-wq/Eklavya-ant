import React, {useCallback} from 'react';
import {AnyRecord, getLessonPlans} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

export default function LessonPlansScreen() {
  const loader = useCallback(() => getLessonPlans(), []);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Lesson plans" subtitle="Lesson plans for the selected child." />
      {data.length ? data.map((item, index) => (
        <RecordCard key={item.id || index} title={item.title || item.subject || 'Lesson plan'} icon="profile" meta={[item.date, item.subject]} body={item.description} />
      )) : <EmptyBlock title="No lesson plans" message="Lesson plans will appear here." icon="profile" />}
    </Screen>
  );
}
