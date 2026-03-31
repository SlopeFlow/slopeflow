import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { getMultipleQuotes, DEFAULT_WATCHLIST } from '../api/stocks';

export default function WatchlistScreen() {
  const [tickers, setTickers]   = useState(DEFAULT_WATCHLIST);
  const [quotes, setQuotes]     = useState([]);
  const [newTicker, setNewTicker] = useState('');
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const data = await getMultipleQuotes(tickers);
      setQuotes(data);
    } catch (e) {
      console.error('Watchlist load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tickers]);

  const addTicker = () => {
    const t = newTicker.toUpperCase().trim();
    if (!t) return;
    if (tickers.includes(t)) {
      Alert.alert('Already watching', `${t} is already in your watchlist.`);
      return;
    }
    setTickers([...tickers, t]);
    setNewTicker('');
  };

  const removeTicker = (t) => setTickers(tickers.filter(x => x !== t));

  const renderItem = ({ item }) => {
    const isUp = item.change24h >= 0;
    const changeColor = isUp ? colors.green : colors.red;
    const arrow = isUp ? '▲' : '▼';
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.ticker}>{item.ticker}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {arrow} {Math.abs(item.change24h).toFixed(2)}%
          </Text>
          {item.dividendYield !== 'N/A' && (
            <Text style={styles.yield}>💰 {item.dividendYield} yield</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => removeTicker(item.ticker)} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>STACK YOUR RUN</Text>
      <Text style={styles.sub}>Dividend Watchlist</Text>

      <FlatList
        data={quotes}
        keyExtractor={item => item.ticker}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        style={styles.list}
      />

      {/* Add ticker */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newTicker}
          onChangeText={setNewTicker}
          placeholder="Add ticker..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          onSubmitEditing={addTicker}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTicker}>
          <Text style={styles.addBtnText}>+ ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  heading:   { ...fonts.label, color: colors.accent, marginBottom: 2 },
  sub:       { ...fonts.subhead, marginBottom: spacing.lg },
  list:      { flex: 1 },
  row:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  rowLeft:   { flex: 1 },
  rowRight:  { alignItems: 'flex-end', marginRight: spacing.md },
  ticker:    { ...fonts.subhead, fontSize: 17 },
  name:      { ...fonts.body, fontSize: 13, marginTop: 2 },
  price:     { ...fonts.subhead, fontSize: 16 },
  change:    { fontSize: 13, fontWeight: '700', marginTop: 2 },
  yield:     { fontSize: 12, color: colors.gold, marginTop: 3 },
  removeBtn: { padding: spacing.sm },
  removeText:{ color: colors.textMuted, fontSize: 16 },
  sep:       { height: spacing.sm },
  addRow:    { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  input:     { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15 },
  addBtn:    { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  addBtnText:{ color: colors.bg, fontWeight: '800', fontSize: 13 },
});
