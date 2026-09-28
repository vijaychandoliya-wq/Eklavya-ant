import React, {useCallback, useState} from 'react';
import {AnyRecord, getPaidFees, getUnpaidFees} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen, SegmentedTabs} from '../components/ui';

const TABS = [
  {key: 'unpaid', label: 'Unpaid'},
  {key: 'paid', label: 'Paid'},
];

export default function FeesScreen() {
  const [tab, setTab] = useState('unpaid');
  const loader = useCallback(() => (tab === 'unpaid' ? getUnpaidFees() : getPaidFees()), [tab]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Fees" subtitle="Fee payments for the selected child." />
      <SegmentedTabs items={TABS} value={tab} onChange={setTab} />
      {loading ? (
        <LoadingBlock />
      ) : data.length ? (
        data.map((item, index) => (
          <RecordCard
            key={item.id || index}
            title={item.name || item.fee_name || 'Fee'}
            status={tab === 'unpaid' ? 'Unpaid' : 'Paid'}
            icon="account-book"
            meta={[item.term, item.amount != null ? `₹${item.amount}` : null, item.dueDate || item.paid_on]}
          />
        ))
      ) : (
        <EmptyBlock
          title="No fees"
          message={tab === 'unpaid' ? 'No unpaid fees.' : 'No paid fees yet.'}
          icon="account-book"
        />
      )}
    </Screen>
  );
}
