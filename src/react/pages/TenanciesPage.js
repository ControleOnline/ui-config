import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { app_type_base } from '@appType';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { userHasRole } from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import styles from './TenanciesPage.styles';
import { TENANCIES_I18N, tTenancy } from '../utils/tenanciesI18n';

const EMPTY_FORM = {
  id: '',
  appHost: '',
  dbHost: '',
  dbName: '',
  dbPort: '3306',
  dbUser: '',
  dbPassword: '',
  dbDriver: 'pdo_mysql',
  dbInstance: '',
  installationStatus: 'pending',
};

const normalizeFormFromItem = item => ({
  id: String(item?.id || ''),
  appHost: String(item?.appHost || ''),
  dbHost: String(item?.dbHost || ''),
  dbName: String(item?.dbName || ''),
  dbPort: String(item?.dbPort || '3306'),
  dbUser: String(item?.dbUser || ''),
  dbPassword: '',
  dbDriver: String(item?.dbDriver || 'pdo_mysql'),
  dbInstance: String(item?.dbInstance || ''),
  installationStatus: String(item?.installationStatus || 'pending'),
});

export default function TenanciesPage({ navigation }) {
  const tenanciesStore = useStore('tenancies');
  const authStore = useStore('auth');
  const { showError, showSuccess } = useMessage();
  const [form, setForm] = useState(EMPTY_FORM);

  const actions = tenanciesStore.actions;
  const getters = tenanciesStore.getters || {};
  const authGetters = authStore.getters || {};
  const isSaving = getters.isSaving === true;
  const canManage = app_type_base === 'ADMIN' && userHasRole(authGetters.user, 'ROLE_SUPER');

  useEffect(() => {
    navigation?.setOptions?.({ title: tTenancy(TENANCIES_I18N.pageTitle) });
  }, [navigation]);

  const openNew = useCallback(() => {
    setForm(EMPTY_FORM);
  }, []);

  const openEdit = useCallback(item => {
    setForm(normalizeFormFromItem(item));
  }, []);

  const updateField = useCallback((field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  }, []);

  const save = useCallback(async () => {
    try {
      const saved = await actions.save(form);
      setForm(normalizeFormFromItem(saved));
      showSuccess(tTenancy(TENANCIES_I18N.saveSuccess));
    } catch (saveError) {
      showError(saveError?.message || tTenancy(TENANCIES_I18N.saveError));
    }
  }, [actions, form, showError, showSuccess]);

  const enqueueInstall = useCallback(async item => {
    try {
      await actions.enqueueInstall(item);
      showSuccess(tTenancy(TENANCIES_I18N.installSuccess));
    } catch (installError) {
      showError(tTenancy(TENANCIES_I18N.installError));
    }
  }, [actions, showError, showSuccess]);

  if (!canManage) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.panel}>
          <Text style={styles.title}>{tTenancy(TENANCIES_I18N.restrictedTitle)}</Text>
          <Text style={styles.meta}>{tTenancy(TENANCIES_I18N.restrictedMeta)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{tTenancy(TENANCIES_I18N.pageTitle)}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={openNew}>
            <Icon name="plus" size={18} color="#0284C7" />
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.domain)}</Text>
              <TextInput style={styles.input} value={form.appHost} onChangeText={value => updateField('appHost', value)} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.dbHost)}</Text>
              <TextInput style={styles.input} value={form.dbHost} onChangeText={value => updateField('dbHost', value)} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.dbName)}</Text>
              <TextInput style={styles.input} value={form.dbName} onChangeText={value => updateField('dbName', value)} autoCapitalize="none" />
            </View>
            <View style={[styles.field, styles.fieldSmall]}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.port)}</Text>
              <TextInput style={styles.input} value={form.dbPort} onChangeText={value => updateField('dbPort', value)} keyboardType="number-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.dbUser)}</Text>
              <TextInput style={styles.input} value={form.dbUser} onChangeText={value => updateField('dbUser', value)} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.password)}</Text>
              <TextInput style={styles.input} value={form.dbPassword} onChangeText={value => updateField('dbPassword', value)} secureTextEntry />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.driver)}</Text>
              <TextInput style={styles.input} value={form.dbDriver} onChangeText={value => updateField('dbDriver', value)} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.instance)}</Text>
              <TextInput style={styles.input} value={form.dbInstance} onChangeText={value => updateField('dbInstance', value)} autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{tTenancy(TENANCIES_I18N.status)}</Text>
              <TextInput style={styles.input} value={form.installationStatus} onChangeText={value => updateField('installationStatus', value)} autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={openNew}>
              <Icon name="plus" size={14} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>{tTenancy(TENANCIES_I18N.new)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={save} disabled={isSaving}>
              <Icon name="save" size={14} color="#FFFFFF" />
              <Text style={styles.buttonText}>{isSaving ? tTenancy(TENANCIES_I18N.saving) : tTenancy(TENANCIES_I18N.save)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.table}>
          <DefaultTable
            add
            accentColor="#0284C7"
            initialViewMode="table"
            onAdd={openNew}
            onEditRow={openEdit}
            onRowPress={openEdit}
            requestParams={{}}
            rowActionsComponent={({ row }) => (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => enqueueInstall(row)}>
                <Icon name="play" size={14} color="#0F172A" />
                <Text style={styles.secondaryButtonText}>{tTenancy(TENANCIES_I18N.install)}</Text>
              </TouchableOpacity>
            )}
            searchProps={{
              compact: true,
              placeholder: tTenancy(TENANCIES_I18N.searchPlaceholder),
              searchKey: 'search',
              storeName: 'tenancies',
            }}
            showRowActions
            storeName="tenancies"
            totalItemsLabel={tTenancy(TENANCIES_I18N.totalItems)}
            visibleColumnsPreferenceKey="tenancies"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
