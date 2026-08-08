import React, {useCallback, useState} from 'react';
import {Tabs, View, WhiteSpace} from '@ant-design/react-native';
import {AnyRecord, getPaidFees, getUnpaidFees} from '../api';
import {useAsyncData} from '../hooks';
import {EmptyBlock, LoadingBlock, PageTitle, RecordCard, Screen} from '../components/ui';

const TABS = [{title: 'Unpaid', key: 'unpaid'}, {title: 'Paid', key: 'paid'}];

export default function FeesScreen() {
  const [tab, setTab] = useState(0);
  const loader = useCallback(() => (tab === 0 ? getUnpaidFees() : getPaidFees()), [tab]);
  const {data, loading, refreshing, error, refresh, clearError} = useAsyncData<AnyRecord[]>(loader, []);
  return (
    <Screen refreshing={refreshing} onRefresh={refresh} error={error} onDismissError={clearError}>
      <PageTitle title="Fees" subtitle="Fee payments for the selected child." />
      <Tabs tabs={TABS} page={tab} onChange={(_i, index) => setTab(index)} swipeable={false} noRenderContent><View /></Tabs>
      <WhiteSpace size="lg" />
      {loading ? <LoadingBlock /> : data.length ? data.map((item, index) => (
        <RecordCard
          key={item.id || index}
          title={item.name || item.fee_name || 'Fee'}
          status={tab === 0 ? 'Unpaid' : 'Paid'}
          icon="account-book"
          meta={[item.term, item.amount != null ? `₹${item.amount}` : null, item.dueDate || item.paid_on]}
        />
      )) : <EmptyBlock title="No fees" message={tab === 0 ? 'No unpaid fees.' : 'No paid fees yet.'} icon="account-book" />}
    </Screen>
  );
}
