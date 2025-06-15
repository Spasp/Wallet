import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Transaction } from '../context/BalanceContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBalance } from '../hooks/useBalanceHook';
import { formatCurrency } from '../utils/formatCurrency';
import { useNetInfo } from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
const TransactionItem = ({ item }: { item: Transaction }) => {
  const isReceive = item.type === 'receive';
  const color = isReceive ? '#28a745' : '#dc3545';
  const iconName = isReceive ? 'arrow-up-circle' : 'arrow-down-circle';
  const sign = isReceive ? '+' : '-';

  return (
    <View style={styles.transactionItem}>
      <Icon
        name={iconName}
        size={30}
        color={color}
        style={styles.transactionIcon}
      />
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, { color }]}>
        {sign}
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );
};
const showToast = (
  type: string,
  text1: string,
  text2: string,
  autoHide: boolean,
) => {
  Toast.show({
    type,
    text1,
    text2,
    autoHide,
  });
};

const HomeScreen = () => {
  const { balance, transactions } = useBalance();
  const netInfo = useNetInfo();
  const prevIsConnected = useRef(netInfo.isConnected);
  useEffect(() => {
    const isConnected = netInfo.isConnected;

    if (
      prevIsConnected.current !== null &&
      prevIsConnected.current !== isConnected
    ) {
      if (isConnected === false) {
        showToast('error', 'Offline', 'You are currently offline', false);
      } else if (isConnected === true) {
        Toast.hide();
        setTimeout(
          () => showToast('success', 'Online', 'Back online!', true),
          300,
        );
      }

      prevIsConnected.current = isConnected;
    }
  }, [netInfo.isConnected]);

  return (
    <View style={[styles.container]}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
      </View>

      {/* Transactions List */}
      <Text style={styles.listHeader}>Recent Activity</Text>
      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent activity.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d3557',
    marginLeft: 25,
    marginTop: 30,
    marginBottom: 10,
  },
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;
