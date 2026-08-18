import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { app_type_base } from '@appType';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { resolveThemePalette } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import { userHasRole } from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import styles from './CronJobsPage.styles';

/**
 * ADMIN cron jobs list. Must tolerate collection 404/empty without white-screen
 * or infinite re-render (React #185). Single-item GET is never used for the
 * list surface — only collection getItems via DefaultTable pagination.
 */
export default function CronJobsPage() {
  const navigation = useNavigation();
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const authStore = useStore('auth');
  const cronJobsStore = useStore('cron_jobs');

  const { currentCompany, defaultCompany } = peopleStore.getters || {};
  const { user } = authStore.getters || {};
  const { colors: themeColors } = themeStore.getters || {};
  const storeError = cronJobsStore?.getters?.error || '';
  const isLoadingList =
    Boolean(cronJobsStore?.getters?.isLoading) ||
    Boolean(cronJobsStore?.getters?.isLoadingList);

  const isAdminApp = app_type_base === 'ADMIN';
  const canManageCronJobs = isAdminApp && userHasRole(user, 'ROLE_SUPER');
  const mainCompany = defaultCompany || currentCompany || null;

  const palette = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(mainCompany?.theme?.colors || {}) },
        colors,
      ),
    [mainCompany?.id, mainCompany?.theme?.colors, themeColors],
  );

  // Collection-only params; never seed an item id that would trigger GET /cron_jobs/{id}.
  const requestParams = useMemo(() => ({}), []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Jobs agendados',
      headerRight: () => (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ajuda sobre jobs agendados"
          activeOpacity={0.82}
          onPress={() =>
            Alert.alert(
              'Jobs agendados',
              'A lista vem do banco central e o orquestrador grava ultima execucao e status no master.',
            )
          }
          style={styles.headerHelpButton}
        >
          <Text style={styles.headerHelpText}>?</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Clear sticky single-item state so list mode never inherits a prior get(id).
  useEffect(() => {
    if (!cronJobsStore?.getters) {
      return;
    }
    if (cronJobsStore.getters.item && Object.keys(cronJobsStore.getters.item).length) {
      if (typeof cronJobsStore.actions?.setItem === 'function') {
        cronJobsStore.actions.setItem({});
      } else {
        cronJobsStore.getters.item = {};
      }
    }
  }, [cronJobsStore]);

  const retryLoad = useCallback(() => {
    if (typeof cronJobsStore?.actions?.setError === 'function') {
      cronJobsStore.actions.setError(null);
    } else if (cronJobsStore?.getters) {
      cronJobsStore.getters.error = '';
    }
    if (typeof cronJobsStore?.actions?.getItems === 'function') {
      cronJobsStore.actions.getItems({});
    }
  }, [cronJobsStore]);

  const openCronLogs = useCallback(
    row => {
      if (!row?.id) {
        return;
      }

      navigation.navigate('EntityLogPage', {
        id: row.id,
        store: 'cron_jobs',
        entityClass: 'ControleOnline\\Entity\\CronJob',
        entityLabel: row?.title || `Cron #${row.id}`,
      });
    },
    [navigation],
  );

  const CronJobRowActions = useCallback(
    ({ row }) => (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Abrir logs de ${row?.title || `cron ${row?.id || ''}`}`.trim()}
        activeOpacity={0.82}
        onPress={() => openCronLogs(row)}
        style={styles.rowActionButton}
      >
        <Icon name="file-text" size={14} color={palette.primary} />
      </TouchableOpacity>
    ),
    [openCronLogs, palette.primary],
  );

  if (!canManageCronJobs) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.deniedCard}>
          <Text style={styles.deniedTitle}>Acesso restrito</Text>
          <Text style={styles.deniedText}>
            Esta tela de cron jobs fica disponível apenas no app `ADMIN` para `ROLE_SUPER`.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasBlockingError = Boolean(storeError) && !isLoadingList;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['bottom']}>
      <View style={styles.content}>
        {hasBlockingError ? (
          <View style={styles.deniedCard} accessibilityRole="alert">
            <Text style={styles.deniedTitle}>Não foi possível carregar os jobs</Text>
            <Text style={styles.deniedText}>
              {String(storeError).includes('404') || String(storeError).toLowerCase().includes('not found')
                ? 'O recurso de cron jobs não respondeu (404). Verifique se a API expõe GET /cron_jobs para este ambiente.'
                : String(storeError)}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar jobs novamente"
              activeOpacity={0.82}
              onPress={retryLoad}
              style={{
                marginTop: 12,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Icon name="refresh-cw" size={14} color={palette.primary} />
              <Text style={{ color: palette.primary, marginLeft: 6, fontWeight: '700' }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.tableCard}>
          <DefaultTable
            accentColor={palette.primary}
            requestParams={requestParams}
            storeName="cron_jobs"
            rowActionsComponent={CronJobRowActions}
            visibleColumnsPreferenceKey="cron_jobs"
            showTotalItemsInCompactToolbar
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
