import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert,
  Animated, Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';
import { getBTCPrice } from '../api/crypto';

const CHECK_INTERVAL = 60000; // check every 60 seconds

export default function PriceAlerts() {
  const [alerts, setAlerts]       = useState([]);
  const [triggered, setTriggered] = useState([]);
  const [currentPrice, setPrice]  = useState(null);
  const [newPrice, setNewPrice]   = useState('');
  const [direction, setDirection] = useState('above'); // 'above' | 'below'
  const [banner, setBanner]       = useState(null);
  const bannerAnim                = useRef(new Animated.Value(-100)).current;
  const intervalRef               = useRef(null);

  // Load current price + start polling
  useEffect(() => {
    checkPrice();
    intervalRef.current = setInterval(checkPrice, CHECK_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [alerts]);

  const checkPrice = async () => {
    try {
      const data = await getBTCPrice();
      setPrice(data.price);
      checkAlerts(data.price);
    } catch (e) {
      console.error('Price check error:', e);
    }
  };

  const checkAlerts = (price) => {
    alerts.forEach(alert => {
      if (alert.triggered) return;
      const hit = alert.direction === 'above'
        ? price >= alert.targetPrice
        : price <= alert.targetPrice;

      if (hit) {
        triggerAlert(alert, price);
        setAlerts(prev => prev.map(a =>
          a.id === alert.id ? { ...a, triggered: true } : a
        ));
      }
    });
  };

  const triggerAlert = (alert, price) => {
    Vibration.vibrate([0, 200, 100, 200]);

    const msg = alert.direction === 'above'
      ? `BTC hit $${price.toLocaleString()} — above your $${alert.targetPrice.toLocaleString()} target`
      : `BTC dropped to $${price.toLocaleString()} — below your $${alert.targetPrice.toLocaleString()} level`;

    setBanner(msg);
    Animated.sequence([
      Animated.timing(bannerAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.delay(4000),
      Animated.timing(bannerAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
    ]).start(() => setBanner(null));

    setTriggered(prev => [...prev, { ...alert, hitPrice: price, hitAt: new Date() }]);
  };

  const addAlert = () => {
    const price = parseFloat(newPrice.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid price', 'Enter a valid BTC price level.');
      return;
    }
    const newAlert = {
      id:          Date.now().toString(),
      targetPrice: price,
      direction,
      triggered:   false,
      createdAt:   new Date(),
    };
    setAlerts(prev => [...prev, newAlert]);
    setNewPrice('');
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const hitAlerts    = triggered;

  return (
    <View style={styles.container}>

      {/* Alert banner */}
      {banner && (
        <Animated.View style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]}>
          <Ionicons name="notifications" size={16} color={colors.bg} style={{ marginRight: 6 }} />
          <Text style={styles.bannerText}>{banner}</Text>
        </Animated.View>
      )}

      {/* Current price */}
      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>BTC NOW</Text>
        <Text style={styles.priceValue}>
          {currentPrice ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Loading...'}
        </Text>
        <Text style={styles.priceNote}>Checking every 60s while app is open</Text>
      </View>

      {/* Add alert */}
      <View style={styles.addCard}>
        <Text style={styles.sectionLabel}>SET BAIL POINT / TARGET</Text>

        {/* Direction toggle */}
        <View style={styles.dirRow}>
          <TouchableOpacity
            style={[styles.dirBtn, direction === 'above' && styles.dirBtnActive]}
            onPress={() => setDirection('above')}
          >
            <Text style={[styles.dirText, direction === 'above' && { color: colors.bg }]}>▲ ABOVE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dirBtn, direction === 'below' && styles.dirBtnActiveRed]}
            onPress={() => setDirection('below')}
          >
            <Text style={[styles.dirText, direction === 'below' && { color: colors.bg }]}>▼ BELOW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.input}
            value={newPrice}
            onChangeText={setNewPrice}
            placeholder="Enter BTC price..."
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={addAlert}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addAlert}>
            <Text style={styles.addBtnText}>SET</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WATCHING</Text>
          {activeAlerts.map(alert => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={[styles.alertDot, { backgroundColor: alert.direction === 'above' ? colors.green : colors.red }]} />
              <Text style={styles.alertDir}>{alert.direction === 'above' ? '▲' : '▼'}</Text>
              <Text style={styles.alertPrice}>${alert.targetPrice.toLocaleString()}</Text>
              <Text style={styles.alertLabel}>
                {alert.direction === 'above' ? 'Alert if BTC goes above' : 'Alert if BTC drops below'} this level
              </Text>
              <TouchableOpacity onPress={() => removeAlert(alert.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Triggered alerts */}
      {hitAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRIGGERED</Text>
          {hitAlerts.map(alert => (
            <View key={alert.id + '_hit'} style={[styles.alertRow, styles.alertRowHit]}>
              <Ionicons
                name={alert.direction === 'above' ? 'trending-up' : 'trending-down'}
                size={16}
                color={alert.direction === 'above' ? colors.green : colors.red}
              />
              <Text style={styles.alertPrice}>${alert.targetPrice.toLocaleString()}</Text>
              <Text style={styles.alertHitPrice}>hit @ ${alert.hitPrice?.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      {activeAlerts.length === 0 && hitAlerts.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={48} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
          <Text style={styles.emptyText}>No alerts set yet.{'\n'}Set a target or bail point above.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  banner:          { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: colors.accent, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  bannerText:      { color: colors.bg, fontWeight: '800', fontSize: 14, flex: 1 },
  priceCard:       { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.accent },
  priceLabel:      { ...fonts.label, color: colors.accent, marginBottom: 4 },
  priceValue:      { ...fonts.price, fontSize: 30 },
  priceNote:       { ...fonts.body, fontSize: 12, marginTop: 4 },
  addCard:         { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  sectionLabel:    { ...fonts.label, color: colors.accent, marginBottom: spacing.sm },
  dirRow:          { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  dirBtn:          { flex: 1, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  dirBtnActive:    { backgroundColor: colors.green, borderColor: colors.green },
  dirBtnActiveRed: { backgroundColor: colors.red, borderColor: colors.red },
  dirText:         { ...fonts.label, color: colors.textSecondary },
  inputRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dollarSign:      { ...fonts.subhead, color: colors.textMuted, fontSize: 20 },
  input:           { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: colors.border },
  addBtn:          { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  addBtnText:      { color: colors.bg, fontWeight: '900', fontSize: 13 },
  section:         { marginBottom: spacing.md },
  alertRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  alertRowHit:     { opacity: 0.6 },
  alertDot:        { width: 8, height: 8, borderRadius: 4 },
  alertDir:        { fontSize: 16 },
  alertPrice:      { ...fonts.subhead, fontSize: 16, flex: 1 },
  alertLabel:      { ...fonts.body, fontSize: 12, flex: 2 },
  alertHitPrice:   { ...fonts.body, fontSize: 12, color: colors.textMuted },
  removeBtn:       { padding: spacing.xs },
  empty:           { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  emptyText:       { ...fonts.body, textAlign: 'center', lineHeight: 24, color: colors.textMuted },
});
