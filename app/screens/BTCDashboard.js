import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { colors, fonts, spacing, radius } from '../theme';
import { getBTCPrice, getBTCChart, getBTCStats } from '../api/crypto';
import { supabase } from '../api/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH  = SCREEN_WIDTH - spacing.md * 2;

const TIME_RANGES = ['15M', '1H', '4H', '1D', '1W', '1M', '1Y'];
// days value + optional interval for CoinGecko
const RANGE_MAP = {
  '15M': { days: 0.010417, interval: 'minutely' }, // ~15 min window
  '1H':  { days: 0.041667, interval: 'minutely' }, // ~1 hour
  '4H':  { days: 0.166667, interval: 'minutely' }, // ~4 hours
  '1D':  { days: 1,        interval: null },
  '1W':  { days: 7,        interval: null },
  '1M':  { days: 30,       interval: null },
  '1Y':  { days: 365,      interval: null },
};

// Downsample chart data so it renders fast and clean
function downsample(data, maxPoints = 80) {
  if (data.length <= maxPoints) return data;
  const step = Math.floor(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0);
}

export default function BTCDashboard() {
  const [price, setPrice]           = useState(null);
  const [stats, setStats]           = useState(null);
  const [range, setRange]           = useState('1D');
  const [chartData, setChartData]   = useState([]);
  const [chartColor, setChartColor] = useState(colors.green);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts]         = useState([]);
  const [newAlert, setNewAlert]     = useState('');

  const load = useCallback(async () => {
    try {
      const [priceData, statsData, raw] = await Promise.all([
        getBTCPrice(),
        getBTCStats(),
        getBTCChart(RANGE_MAP[range].days, RANGE_MAP[range].interval),
      ]);

      setPrice(priceData);
      setStats(statsData);

      // Load alerts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('price_alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('asset', 'BTC')
          .order('target_price', { ascending: true });
        setAlerts(data || []);
      }

      // Build gifted-charts format: { value, label? }
      const sampled = downsample(raw);
      const first   = sampled[0]?.price ?? 0;
      const last    = sampled[sampled.length - 1]?.price ?? 0;
      setChartColor(last >= first ? colors.green : colors.red);

      // Add sparse x-axis labels
      const labelEvery = Math.floor(sampled.length / 5);
      const formatted  = sampled.map((d, i) => {
        const date  = new Date(d.time);
        const label = ['15M','1H','4H'].includes(range)
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : range === '1D'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return {
          value: d.price,
          label: i % labelEvery === 0 ? label : '',
          labelTextStyle: { color: colors.textMuted, fontSize: 9 },
          dataPointColor: 'transparent',
        };
      });
      setChartData(formatted);
    } catch (e) {
      console.error('BTC load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const addAlert = async () => {
    const target = parseFloat(newAlert);
    if (!target || target <= 0) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('price_alerts').insert({
      user_id: user.id,
      asset: 'BTC',
      target_price: target,
    });
    
    setNewAlert('');
    load();
  };

  const removeAlert = async (id) => {
    await supabase.from('price_alerts').delete().eq('id', id);
    load();
  };

  const isUp        = (price?.change24h ?? 0) >= 0;
  const changeColor = isUp ? colors.green : colors.red;
  const arrow       = isUp ? '▲' : '▼';

  const chartMin = chartData.length
    ? Math.min(...chartData.map(d => d.value)) * 0.9975
    : undefined;
  const chartMax = chartData.length
    ? Math.max(...chartData.map(d => d.value)) * 1.0025
    : undefined;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.assetLabel}>BITCOIN</Text>
        <Text style={styles.tickerLabel}>BTC</Text>
      </View>

      {/* Price */}
      <Text style={styles.price}>
        ${price?.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Text>
      <Text style={[styles.change, { color: changeColor }]}>
        {arrow} {Math.abs(price?.change24h ?? 0).toFixed(2)}% (24h)
      </Text>

      {/* Range selector */}
      <View style={styles.rangeRow}>
        <Text style={styles.readTheLine}>READ THE LINE</Text>
        <View style={styles.rangeButtons}>
          {TIME_RANGES.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.rangeBtnText, range === r && { color: colors.bg }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live Chart */}
      {chartData.length > 0 && (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={CHART_WIDTH - spacing.md}
            height={180}
            color={chartColor}
            thickness={2}
            startFillColor={chartColor}
            endFillColor={colors.bg}
            startOpacity={0.25}
            endOpacity={0}
            areaChart
            curved
            hideDataPoints
            minValue={chartMin}
            maxValue={chartMax}
            noOfSections={4}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            rulesColor={colors.border}
            rulesType="solid"
            backgroundColor={colors.card}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: colors.accent,
              pointerStripWidth: 1,
              pointerColor: colors.accent,
              radius: 4,
              pointerLabelWidth: 120,
              pointerLabelHeight: 40,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items) => (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerText}>
                    ${items[0]?.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ),
            }}
          />
        </View>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="24H HIGH"   value={`$${stats?.high24h?.toLocaleString()}`} />
        <StatCard label="24H LOW"    value={`$${stats?.low24h?.toLocaleString()}`} />
        <StatCard label="MARKET CAP" value={`$${((price?.marketCap ?? 0) / 1e9).toFixed(0)}B`} />
      </View>

      {/* Halving context */}
      <View style={styles.contextCard}>
        <Text style={styles.contextLabel}>HALVING CONTEXT</Text>
        <Text style={styles.contextText}>{stats?.halvingContext}</Text>
        <Text style={styles.contextText}>
          Supply: {stats?.circulatingSupply?.toLocaleString()} / {stats?.maxSupply?.toLocaleString()} BTC
        </Text>
      </View>

      {/* Price Alerts */}
      <View style={styles.alertsCard}>
        <Text style={styles.alertsLabel}>PRICE ALERTS</Text>
        <Text style={styles.alertsSub}>Get notified when BTC hits your target</Text>
        
        {alerts.map(alert => {
          const current = price?.price || 0;
          const isAbove = alert.target_price > current;
          return (
            <View key={alert.id} style={styles.alertRow}>
              <Text style={styles.alertPrice}>
                {isAbove ? '▲' : '▼'} ${alert.target_price.toLocaleString()}
              </Text>
              <TouchableOpacity onPress={() => removeAlert(alert.id)}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.alertInputRow}>
          <TextInput
            style={styles.alertInput}
            value={newAlert}
            onChangeText={setNewAlert}
            placeholder="Target price..."
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            onSubmitEditing={addAlert}
          />
          <TouchableOpacity style={styles.alertAddBtn} onPress={addAlert}>
            <Text style={styles.alertAddText}>+ ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  center:        { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  assetLabel:    { ...fonts.label, color: colors.accent },
  tickerLabel:   { ...fonts.label, color: colors.textMuted },
  price:         { ...fonts.price, marginBottom: 4 },
  change:        { fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  readTheLine:   { ...fonts.label, color: colors.accent, marginBottom: spacing.sm },
  rangeRow:      { marginBottom: spacing.md },
  rangeButtons:  { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  rangeBtn:      { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  rangeBtnActive:{ backgroundColor: colors.accent, borderColor: colors.accent },
  rangeBtnText:  { ...fonts.label, color: colors.textSecondary },
  chartWrapper:  { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.lg, overflow: 'hidden' },
  pointerLabel:  { backgroundColor: colors.card, borderRadius: radius.sm, padding: 6, borderWidth: 1, borderColor: colors.accent },
  pointerText:   { color: colors.accent, fontWeight: '700', fontSize: 12 },
  statsRow:      { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard:      { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  statLabel:     { ...fonts.label, marginBottom: 4 },
  statValue:     { ...fonts.subhead, fontSize: 15 },
  contextCard:   { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.accent, marginBottom: spacing.xl },
  contextLabel:  { ...fonts.label, color: colors.accent, marginBottom: spacing.sm },
  contextText:   { ...fonts.body, marginBottom: 4 },
  alertsCard:    { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xl },
  alertsLabel:   { ...fonts.label, color: colors.accent, marginBottom: 2 },
  alertsSub:     { ...fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  alertRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  alertPrice:    { ...fonts.subhead, fontSize: 15 },
  alertRemove:   { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing.sm },
  alertInputRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  alertInput:    { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm, color: colors.textPrimary, fontSize: 14 },
  alertAddBtn:   { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  alertAddText:  { color: colors.bg, fontWeight: '800', fontSize: 12 },
});
