import React, {useCallback} from 'react';
import {AnyRecord, getExamMarks} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';
import {ScreenParams} from '../navigation';

export default function ExamMarksScreen({params}: {params?: ScreenParams}) {
  const examId = params?.examId;
  const loader = useCallback(async () => {
    if (!examId) return [];
    const payload = await getExamMarks(examId);
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.marks)) return payload.marks;
    if (Array.isArray(payload?.data)) return payload.data;
    return payload ? [payload] : [];
  }, [examId]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  if (loading) return <LoadingBlock />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Exam marks" subtitle="Marks for the selected exam." />
      {data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.subject || item.name || 'Subject'}
          status={item.grade || item.result}
          icon="edit"
          meta={[item.marks != null ? `Marks: ${item.marks}` : null, item.max_marks != null ? `Max: ${item.max_marks}` : null]}
        />
      )) : <EmptyBlock title="No marks" message="Marks are not available for this exam yet." icon="edit" />}
    </Screen>
  );
}
