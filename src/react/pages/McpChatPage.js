import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { api } from '@controleonline/ui-common/src/api';

/**
 * Chat MCP — conversations are Task type=ia; messages are TaskInteration.
 * Route path: mcp
 */
export default function McpChatPage() {
  const peopleStore = useStore('people');
  const { currentCompany } = peopleStore.getters;
  const companyId = currentCompany?.id;

  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const styles = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: '#0f1419', flexDirection: Platform.OS === 'web' ? 'row' : 'column' },
      sidebar: {
        width: Platform.OS === 'web' ? 280 : '100%',
        maxHeight: Platform.OS === 'web' ? undefined : 180,
        borderRightWidth: Platform.OS === 'web' ? 1 : 0,
        borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
        borderColor: '#2a3548',
        padding: 12,
      },
      main: { flex: 1, padding: 12 },
      title: { color: '#e7ecf3', fontWeight: '700', fontSize: 16, marginBottom: 8 },
      muted: { color: '#9aa4b2', fontSize: 12 },
      chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2a3548',
        marginRight: 6,
        marginBottom: 6,
      },
      chipOn: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6' },
      chipText: { color: '#c8d0dc', fontSize: 12 },
      chipTextOn: { color: '#fff', fontWeight: '600' },
      taskItem: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
      },
      taskItemOn: { backgroundColor: '#1a2332' },
      taskName: { color: '#e7ecf3', fontSize: 13 },
      msgUser: {
        alignSelf: 'flex-end',
        backgroundColor: '#1d4ed8',
        borderRadius: 12,
        padding: 10,
        marginVertical: 4,
        maxWidth: '85%',
      },
      msgAi: {
        alignSelf: 'flex-start',
        backgroundColor: '#1a2332',
        borderRadius: 12,
        padding: 10,
        marginVertical: 4,
        maxWidth: '85%',
        borderWidth: 1,
        borderColor: '#2a3548',
      },
      msgText: { color: '#e7ecf3', fontSize: 14 },
      inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
      input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        backgroundColor: '#1a2332',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a3548',
        color: '#e7ecf3',
        paddingHorizontal: 12,
        paddingVertical: 10,
      },
      sendBtn: {
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
      },
      error: { color: '#f87171', marginBottom: 8 },
      empty: { color: '#6b7785', textAlign: 'center', marginTop: 24 },
      newBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        marginBottom: 8,
      },
      newBtnText: { color: '#60a5fa', fontWeight: '600' },
    }),
    [],
  );

  const loadProviders = useCallback(async () => {
    if (!companyId) return;
    try {
      const data = await api.get(`mcp/chat/providers?company_id=${companyId}`);
      const list = data?.providers || [];
      setProviders(list);
      if (list.length && !provider) {
        setProvider(list[0].provider);
      }
    } catch (e) {
      setError(e?.message || 'Falha ao carregar providers');
    }
  }, [companyId, provider]);

  const loadTasks = useCallback(async () => {
    if (!companyId) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const data = await api.get('tasks', {
        params: {
          type: 'ia',
          provider: `/people/${companyId}`,
          itemsPerPage: 50,
          order: { alterDate: 'desc' },
        },
      });
      const members = data?.member || data?.['hydra:member'] || [];
      setTasks(members);
    } catch (e) {
      setError(e?.message || 'Falha ao listar conversas');
    } finally {
      setLoadingList(false);
    }
  }, [companyId]);

  const loadMessages = useCallback(async tid => {
    if (!tid) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    try {
      const data = await api.get('task_interations', {
        params: {
          'task.id': tid,
          itemsPerPage: 100,
          order: { id: 'asc' },
        },
      });
      const members = data?.member || data?.['hydra:member'] || [];
      setMessages(members);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: false }), 50);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar mensagens');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
    loadTasks();
  }, [loadProviders, loadTasks]);

  useEffect(() => {
    if (taskId) loadMessages(taskId);
  }, [taskId, loadMessages]);

  const startNew = () => {
    setTaskId(null);
    setMessages([]);
    setInput('');
    setError('');
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!provider) {
      setError('Configure e habilite um provider de IA em Configurador → Providers de IA.');
      return;
    }
    setSending(true);
    setError('');
    setInput('');
    // optimistic user bubble
    setMessages(prev => [
      ...prev,
      { id: `tmp-${Date.now()}`, type: 'comment', body: text, _local: 'user' },
    ]);
    try {
      const body = {
        message: text,
        provider,
        company_id: companyId,
      };
      if (taskId) body.task_id = taskId;
      const data = await api.post('mcp/chat', body);
      if (data?.task_id && data.task_id !== taskId) {
        setTaskId(data.task_id);
        await loadTasks();
      }
      if (data?.message) {
        setMessages(prev => [
          ...prev.filter(m => !String(m.id).startsWith('tmp-')),
          { id: `tmp-u-${Date.now()}`, type: 'comment', body: text, _local: 'user' },
          { id: `tmp-a-${Date.now()}`, type: 'comment', body: data.message, _local: 'assistant' },
        ]);
      } else if (data?.task_id) {
        await loadMessages(data.task_id);
      }
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (e) {
      setError(e?.message || 'Falha ao enviar');
    } finally {
      setSending(false);
    }
  };

  const isUserMsg = m => {
    if (m._local === 'user') return true;
    if (m._local === 'assistant') return false;
    // Heuristic: messages registered by current company people id vs user — body order
    return false;
  };

  // Better: alternate by comparing registeredBy to current user — we don't have people id on store easily
  // Use announce on task + interation order: even indices after reload from API: registeredBy.people
  const renderMsg = ({ item, index }) => {
    let userSide = item._local === 'user';
    if (!item._local) {
      // Prefer registeredBy match with non-company: if registeredBy id === company, treat as assistant
      const rid = item.registeredBy?.id || (typeof item.registeredBy === 'string'
        ? Number(String(item.registeredBy).split('/').pop())
        : null);
      userSide = rid && companyId && rid !== companyId;
      // If same as company was used for AI responses in backend
      if (rid === companyId) userSide = false;
    }
    return (
      <View style={userSide ? styles.msgUser : styles.msgAi}>
        <Text style={styles.msgText}>{item.body || ''}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.sidebar}>
        <Text style={styles.title}>Conversas IA</Text>
        <TouchableOpacity style={styles.newBtn} onPress={startNew}>
          <Icon name="plus" size={16} color="#60a5fa" />
          <Text style={styles.newBtnText}>Nova conversa</Text>
        </TouchableOpacity>
        {loadingList ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <ScrollView>
            {tasks.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.taskItem, taskId === t.id && styles.taskItemOn]}
                onPress={() => setTaskId(t.id)}>
                <Text style={styles.taskName} numberOfLines={2}>
                  {t.name || `#${t.id}`}
                </Text>
                <Text style={styles.muted}>#{t.id}</Text>
              </TouchableOpacity>
            ))}
            {!tasks.length ? <Text style={styles.muted}>Nenhuma conversa ainda.</Text> : null}
          </ScrollView>
        )}
      </View>

      <View style={styles.main}>
        <Text style={styles.title}>Chat MCP</Text>
        <Text style={styles.muted} numberOfLines={2}>
          Tasks type=ia · providers da empresa · dados via MCP
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
          {providers.map(p => (
            <TouchableOpacity
              key={p.provider}
              style={[styles.chip, provider === p.provider && styles.chipOn]}
              onPress={() => setProvider(p.provider)}>
              <Text style={[styles.chipText, provider === p.provider && styles.chipTextOn]}>
                {p.label || p.provider}
              </Text>
            </TouchableOpacity>
          ))}
          {!providers.length ? (
            <Text style={styles.muted}>Nenhum provider habilitado. Configure em Configurador → Providers de IA.</Text>
          ) : null}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {loadingMsgs ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            ref={listRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={(item, i) => String(item.id || i)}
            renderItem={renderMsg}
            ListEmptyComponent={
              <Text style={styles.empty}>Envie uma pergunta para iniciar (Task type=ia).</Text>
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte sobre faturamento, empresas..."
            placeholderTextColor="#6b7785"
            multiline
            onSubmitEditing={onSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Icon name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
