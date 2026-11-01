import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { api } from '@controleonline/ui-common/src/api';

const PROVIDER_ORDER = ['grok', 'openai', 'gemini', 'claude'];

const emptyProviders = () => ({
  grok: { label: 'Grok', enabled: false, model: 'grok-4', base_url: 'https://api.x.ai/v1', api_key: '' },
  openai: { label: 'Codex / OpenAI', enabled: false, model: 'gpt-4o', base_url: 'https://api.openai.com/v1', api_key: '' },
  gemini: { label: 'Gemini', enabled: false, model: 'gemini-2.0-flash', base_url: 'https://generativelanguage.googleapis.com/v1beta', api_key: '' },
  claude: { label: 'Claude', enabled: false, model: 'claude-sonnet-4', base_url: 'https://api.anthropic.com/v1', api_key: '' },
});

export default function AiProvidersConfigPage() {
  const peopleStore = useStore('people');
  const { currentCompany } = peopleStore.getters;
  const companyId = currentCompany?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [providers, setProviders] = useState(emptyProviders());

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`mcp/chat/config?company_id=${companyId}`);
      const incoming = data?.providers || {};
      const next = emptyProviders();
      PROVIDER_ORDER.forEach(key => {
        const row = incoming[key] || {};
        next[key] = {
          ...next[key],
          ...row,
          api_key: '',
          _masked: row.api_key_masked || null,
          _has_key: !!row.has_key,
        };
      });
      setProviders(next);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar providers de IA');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (key, field, value) => {
    setProviders(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setOkMsg('');
  };

  const onSave = async () => {
    if (!companyId) return;
    setSaving(true);
    setError('');
    setOkMsg('');
    try {
      const body = { company_id: companyId, providers: {} };
      PROVIDER_ORDER.forEach(key => {
        const p = providers[key];
        body.providers[key] = {
          label: p.label,
          enabled: !!p.enabled,
          model: p.model || '',
          base_url: p.base_url || '',
          api_key: p.api_key || '',
        };
      });
      await api.put('mcp/chat/config', body);
      setOkMsg('Providers salvos na config da empresa (configKey=ai-providers).');
      await load();
    } catch (e) {
      setError(e?.message || 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const styles = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: '#0f1419' },
      scroll: { padding: 16, paddingBottom: 40 },
      title: { color: '#e7ecf3', fontSize: 20, fontWeight: '700', marginBottom: 4 },
      sub: { color: '#9aa4b2', marginBottom: 16 },
      card: {
        backgroundColor: '#1a2332',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a3548',
      },
      row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
      label: { color: '#e7ecf3', fontSize: 16, fontWeight: '600' },
      fieldLabel: { color: '#9aa4b2', fontSize: 12, marginBottom: 4, marginTop: 8 },
      input: {
        backgroundColor: '#0f1419',
        borderWidth: 1,
        borderColor: '#2a3548',
        borderRadius: 8,
        color: '#e7ecf3',
        paddingHorizontal: 10,
        paddingVertical: 8,
      },
      hint: { color: '#6b7785', fontSize: 11, marginTop: 4 },
      btn: {
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
      },
      btnText: { color: '#fff', fontWeight: '700' },
      error: { color: '#f87171', marginBottom: 8 },
      ok: { color: '#34d399', marginBottom: 8 },
    }),
    [],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Providers de IA</Text>
        <Text style={styles.sub}>
          Chaves por empresa em configs (configKey=ai-providers, visibility=private). Usadas no chat /mcp com tasks type=ia.
        </Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!okMsg && <Text style={styles.ok}>{okMsg}</Text>}

        {PROVIDER_ORDER.map(key => {
          const p = providers[key];
          return (
            <View key={key} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>{p.label || key}</Text>
                <Switch value={!!p.enabled} onValueChange={v => onChange(key, 'enabled', v)} />
              </View>
              <Text style={styles.fieldLabel}>Model</Text>
              <TextInput
                style={styles.input}
                value={p.model || ''}
                onChangeText={t => onChange(key, 'model', t)}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Base URL</Text>
              <TextInput
                style={styles.input}
                value={p.base_url || ''}
                onChangeText={t => onChange(key, 'base_url', t)}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>API Key</Text>
              <TextInput
                style={styles.input}
                value={p.api_key || ''}
                onChangeText={t => onChange(key, 'api_key', t)}
                placeholder={p._has_key ? p._masked || '•••• (já configurada)' : 'Cole a API key'}
                placeholderTextColor="#6b7785"
                autoCapitalize="none"
                secureTextEntry
              />
              {p._has_key ? (
                <Text style={styles.hint}>Deixe em branco para manter a key atual ({p._masked}).</Text>
              ) : null}
            </View>
          );
        })}

        <TouchableOpacity style={styles.btn} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
