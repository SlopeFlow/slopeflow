import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Linking, Image
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { getSignalFeed, timeAgo } from '../api/news';

const TAGS = ['ALL', '₿ BTC', 'MACRO', 'INST', 'REG', 'STOCKS'];
const TAG_MAP = {
  'ALL':    'ALL',
  '₿ BTC':  '₿ BTC',
  'MACRO':  '📊 MACRO',
  'INST':   '🏦 INST',
  'REG':    '⚖️ REG',
  'STOCKS': '📈 STOCKS',
};

export default function SignalFeed() {
  const [articles, setArticles]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [activeTag, setActiveTag] = useState('ALL');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getSignalFeed();
      setArticles(data);
      setFiltered(data);
    } catch (e) {
      console.error('Signal feed error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filterByTag = (tag) => {
    setActiveTag(tag);
    if (tag === 'ALL') {
      setFiltered(articles);
    } else {
      const apiTag = TAG_MAP[tag];
      setFiltered(articles.filter(a => a.tag === apiTag));
    }
  };

  const openArticle = (url) => {
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openArticle(item.url)} activeOpacity={0.75}>
      <View style={styles.cardTop}>
        {/* Tag + source + time */}
        <View style={styles.metaRow}>
          <View style={[styles.tagBadge, { backgroundColor: item.color + '22', borderColor: item.color }]}>
            <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
          </View>
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.time}>{timeAgo(item.publishedAt)}</Text>
        </View>

        {/* Thumbnail */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
        ) : null}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={3}>{item.title}</Text>

      {/* Description */}
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      ) : null}

      {/* Signal score indicator */}
      <View style={styles.scoreRow}>
        <View style={styles.signalDots}>
          {[1,2,3,4,5].map(i => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i <= Math.min(item.score, 5) ? colors.accent : colors.border }]}
            />
          ))}
        </View>
        <Text style={styles.signalLabel}>SIGNAL</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>Scanning for signal...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>SIGNAL FEED</Text>
        <Text style={styles.headerSub}>{filtered.length} stories · noise filtered</Text>
      </View>

      {/* Tag filter row */}
      <FlatList
        data={TAGS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={t => t}
        style={styles.tagRow}
        renderItem={({ item: tag }) => (
          <TouchableOpacity
            style={[styles.tagBtn, activeTag === tag && styles.tagBtnActive]}
            onPress={() => filterByTag(tag)}
          >
            <Text style={[styles.tagBtnText, activeTag === tag && { color: colors.bg }]}>{tag}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Articles */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString() ?? item.title}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No signal in this category yet.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  center:       { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingText:  { ...fonts.body, marginTop: spacing.md, color: colors.accent },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingBottom: spacing.sm },
  headerLabel:  { ...fonts.label, color: colors.accent },
  headerSub:    { ...fonts.label, color: colors.textMuted },
  tagRow:       { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexGrow: 0 },
  tagBtn:       { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, backgroundColor: colors.card },
  tagBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tagBtnText:   { ...fonts.label, color: colors.textSecondary, fontSize: 11 },
  card:         { backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: radius.md, padding: spacing.md },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  metaRow:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  tagBadge:     { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:      { fontSize: 10, fontWeight: '700' },
  source:       { ...fonts.label, fontSize: 10, color: colors.textMuted },
  time:         { ...fonts.label, fontSize: 10, color: colors.textMuted },
  thumb:        { width: 64, height: 64, borderRadius: radius.sm, marginLeft: spacing.sm },
  title:        { ...fonts.subhead, fontSize: 15, lineHeight: 22, marginBottom: spacing.xs },
  description:  { ...fonts.body, fontSize: 13, lineHeight: 19, marginBottom: spacing.sm },
  scoreRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  signalDots:   { flexDirection: 'row', gap: 3 },
  dot:          { width: 6, height: 6, borderRadius: 3 },
  signalLabel:  { ...fonts.label, fontSize: 9, color: colors.textMuted },
  sep:          { height: spacing.sm },
  empty:        { padding: spacing.xl, alignItems: 'center' },
  emptyText:    { ...fonts.body, color: colors.textMuted },
});
