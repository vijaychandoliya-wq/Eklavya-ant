import React, {useCallback, useState} from 'react';
import {AnyRecord, getClassNotices, getSchoolNotices} from '../api';
import {cleanDate, useAsyncData} from '../hooks';
import {
  EmptyBlock,
  LoadingBlock,
  PageTitle,
  RecordCard,
  Screen,
  SectionTitle,
  SegmentedTabs,
} from '../components/ui';

const TABS = [
  {key: 'school', label: 'School'},
  {key: 'class', label: 'Class'},
];

export default function NoticesScreen() {
  const [tab, setTab] = useState('school');
  const loader = useCallback(
    () => (tab === 'school' ? getSchoolNotices() : getClassNotices()),
    [tab],
  );
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Notice board" subtitle="School and class announcements." />
      <SegmentedTabs items={TABS} value={tab} onChange={setTab} />
      {loading ? (
        <LoadingBlock />
      ) : data.length ? (
        <>
          <SectionTitle title={`${data.length} notices`} />
          {data.map((notice, index) => (
            <RecordCard
              key={notice.id || index}
              title={notice.title || 'Notice'}
              status={notice.type}
              icon="notification"
              meta={[
                notice.class_name && notice.class_name !== '--' ? notice.class_name : 'Whole school',
                notice.publish_date ? `Published ${cleanDate(notice.publish_date)}` : null,
              ]}
              body={notice.description}
            />
          ))}
        </>
      ) : (
        <EmptyBlock title="No notices" message="New announcements will appear here." icon="bell" />
      )}
    </Screen>
  );
}
