import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import DefaultFeatherIconPicker, {
  normalizeFeatherIconName,
} from '@controleonline/ui-default/src/react/components/inputs/DefaultFeatherIconPicker';
import {app_type_base} from '@appType';
import {userHasRole} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import useToastMessage from '@controleonline/ui-crm/src/react/hooks/useToastMessage';
import styles from './MenuAccessConfigPage.styles';

const APP_TYPES = ['ADMIN', 'MANAGER', 'CRM', 'POS', 'DELIVERY', 'PPC', 'SHOP', 'SERVICE'];
const LINK_TYPES = ['owner', 'director', 'manager', 'employee', 'salesman', 'after-sales'];

const formatApiError = error => {
  if (typeof error === 'string') return error;
  if (Array.isArray(error?.message)) return error.message.map(item => item?.message || item).join('\n');
  return error?.message || error?.description || 'Nao foi possivel salvar a configuracao do menu.';
};

const linkTypeLabel = linkType =>
  global.t?.t('people', 'label', linkType) || linkType;

const getId = value => {
  if (value == null) return '';
  if (typeof value === 'object') return String(value.id || value['@id'] || '').replace(/\D/g, '');
  return String(value).replace(/\D/g, '');
};

const indexById = items =>
  Object.fromEntries((Array.isArray(items) ? items : []).map(item => [String(item.id), item]));

const normalizeFeatherIcon = normalizeFeatherIconName;

const toDraft = item => ({
  menu: item?.menu || item?.label || '',
  routeId: getId(item?.route),
  categoryId: getId(item?.category),
  icon: normalizeFeatherIcon(item?.icon || item?.route?.icon || ''),
  color: item?.color || item?.route?.color || '',
  sortOrder: String(item?.sortOrder ?? 0),
  enabled: item?.enabled !== false,
  linkTypes: Array.isArray(item?.linkTypes) ? item.linkTypes : [],
});

function SelectionModal({picker, onClose}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery('');
  }, [picker]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const options = Array.isArray(picker?.options) ? picker.options : [];
    if (!normalizedQuery) return options;

    return options.filter(option =>
      `${option.label || ''} ${option.caption || ''}`.toLowerCase().includes(normalizedQuery),
    );
  }, [picker, query]);

  if (!picker) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{picker.title}</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Icon name="x" size={18} color="#334155" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrar"
            placeholderTextColor="#94A3B8"
          />
          <ScrollView contentContainerStyle={styles.modalOptions}>
            {filteredOptions.map(option => {
              const selected = String(option.id) === String(picker.selectedId);

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.optionRow, selected && styles.optionRowActive]}
                  onPress={() => {
                    picker.onSelect(option);
                    onClose();
                  }}
                >
                  <View style={styles.optionTextGroup}>
                    <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                      {option.label}
                    </Text>
                    {!!option.caption && (
                      <Text style={styles.optionCaption}>{option.caption}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function MenuAccessConfigPage() {
  const isAdminApp = app_type_base === 'ADMIN';
  const authStore = useStore('auth');
  const themeStore = useStore('theme');
  const {user} = authStore.getters;
  const {colors: themeColors = {}} = themeStore.getters || {};
  const {showError, showSuccess} = useToastMessage();

  const [activeAppType, setActiveAppType] = useState(isAdminApp ? 'ADMIN' : 'MANAGER');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [availableAppTypes, setAvailableAppTypes] = useState(APP_TYPES);
  const [availableLinkTypes, setAvailableLinkTypes] = useState(LINK_TYPES);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [appTypeSelectorOpen, setAppTypeSelectorOpen] = useState(false);
  const [menuDrafts, setMenuDrafts] = useState({});
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const [picker, setPicker] = useState(null);
  const [addDraft, setAddDraft] = useState(null);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const canManageMenus = isAdminApp && userHasRole(user, 'ROLE_SUPER');
  const categoryById = useMemo(() => indexById(availableCategories), [availableCategories]);
  const routeById = useMemo(() => indexById(availableRoutes), [availableRoutes]);
  const palette = useMemo(() => ({
    buttonBackground: themeColors.buttonBackground,
    buttonBackgroundSecondary: themeColors.buttonBackgroundSecondary,
    buttonBorder: themeColors.buttonBorder,
    buttonBorderSecondary: themeColors.buttonBorderSecondary,
    buttonIcon: themeColors.buttonIcon,
    buttonIconSecondary: themeColors.buttonIconSecondary,
    buttonText: themeColors.buttonText,
    buttonTextSecondary: themeColors.buttonTextSecondary,
  }), [themeColors]);

  const handleScroll = useCallback(event => {
    scrollOffsetRef.current = Number(event?.nativeEvent?.contentOffset?.y || 0);
  }, []);

  const restoreScrollPosition = useCallback(offset => {
    const y = Math.max(0, Number(offset || 0));
    if (!y) return;

    const scrollToPreviousOffset = () => {
      scrollViewRef.current?.scrollTo?.({y, animated: false});
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(scrollToPreviousOffset));
      return;
    }

    setTimeout(scrollToPreviousOffset, 0);
  }, []);

  const categoryOptions = useMemo(() => availableCategories.map(category => ({
    id: String(category.id),
    label: category.name || `Categoria ${category.id}`,
    caption: category.icon || '',
  })), [availableCategories]);

  const routeOptions = useMemo(() => availableRoutes.map(route => ({
    id: String(route.id),
    label: route.route || `Rota ${route.id}`,
    caption: route.module || '',
  })), [availableRoutes]);

  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach(item => {
      const categoryId = getId(item.category) || 'none';
      if (!groups[categoryId]) {
        groups[categoryId] = {
          category: item.category || categoryById[categoryId] || {id: categoryId, name: 'Sem categoria'},
          menus: [],
        };
      }
      groups[categoryId].menus.push(item);
    });

    return Object.values(groups).sort((a, b) =>
      String(a.category?.name || '').localeCompare(String(b.category?.name || '')),
    );
  }, [categoryById, items]);

  const loadMenus = useCallback(async ({preserveScroll = false} = {}) => {
    if (!canManageMenus) return;

    const scrollOffsetToRestore = preserveScroll ? scrollOffsetRef.current : null;
    if (!preserveScroll) {
      setIsLoading(true);
    }

    try {
      const response = await api.fetch('menu-config', {
        params: {
          appType: activeAppType,
          page: 1,
        },
      });

      const nextItems = Array.isArray(response?.member) ? response.member : [];
      const nextCategories = Array.isArray(response?.summary?.categories)
        ? response.summary.categories
        : [];
      const nextRoutes = Array.isArray(response?.summary?.routes)
        ? response.summary.routes
        : [];

      setItems(nextItems);
      setAvailableCategories(nextCategories);
      setAvailableRoutes(nextRoutes);
      setMenuDrafts(Object.fromEntries(nextItems.map(item => [String(item.id), toDraft(item)])));
      setCategoryDrafts(Object.fromEntries(nextCategories.map(category => [
        String(category.id),
        {
          name: category.name || '',
          icon: normalizeFeatherIcon(category.icon),
          color: category.color || '',
        },
      ])));

      if (Array.isArray(response?.summary?.appTypes)) {
        setAvailableAppTypes(response.summary.appTypes);
      }
      if (Array.isArray(response?.summary?.linkTypes)) {
        setAvailableLinkTypes(response.summary.linkTypes);
      }

      if (scrollOffsetToRestore !== null) {
        restoreScrollPosition(scrollOffsetToRestore);
      }
    } catch (error) {
      showError(formatApiError(error));
    } finally {
      if (!preserveScroll) {
        setIsLoading(false);
      }
    }
  }, [activeAppType, canManageMenus, restoreScrollPosition, showError]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const setMenuDraft = (itemId, patch) => {
    setMenuDrafts(current => ({
      ...current,
      [String(itemId)]: {
        ...(current[String(itemId)] || {}),
        ...patch,
      },
    }));
  };

  const setCategoryDraft = (categoryId, patch) => {
    setCategoryDrafts(current => ({
      ...current,
      [String(categoryId)]: {
        ...(current[String(categoryId)] || {}),
        ...patch,
      },
    }));
  };

  const toggleDraftLinkType = (itemId, linkType) => {
    const draft = menuDrafts[String(itemId)] || {};
    const selected = Array.isArray(draft.linkTypes) ? draft.linkTypes : [];
    const next = selected.includes(linkType)
      ? selected.filter(value => value !== linkType)
      : [...selected, linkType];

    setMenuDraft(itemId, {linkTypes: next});
  };

  const saveMenu = async item => {
    const draft = menuDrafts[String(item.id)] || toDraft(item);
    setSavingKey(`menu-${item.id}`);
    try {
      await api.fetch(`menu-config/${item.id}`, {
        method: 'PATCH',
        body: {
          menu: draft.menu,
          route: draft.routeId,
          category: draft.categoryId,
          icon: normalizeFeatherIcon(draft.icon),
          color: draft.color,
          sortOrder: Number(draft.sortOrder || 0),
          enabled: Boolean(draft.enabled),
          linkTypes: draft.linkTypes,
        },
      });
      showSuccess('Menu atualizado.');
      await loadMenus({preserveScroll: true});
    } catch (error) {
      showError(formatApiError(error));
    } finally {
      setSavingKey(null);
    }
  };

  const saveCategory = async category => {
    const categoryId = getId(category);
    const draft = categoryDrafts[String(categoryId)] || {};
    setSavingKey(`category-${categoryId}`);
    try {
      await api.fetch(`menu-config/categories/${categoryId}`, {
        method: 'PATCH',
        body: {
          ...draft,
          icon: normalizeFeatherIcon(draft.icon),
        },
      });
      showSuccess('Categoria atualizada.');
      await loadMenus({preserveScroll: true});
    } catch (error) {
      showError(formatApiError(error));
    } finally {
      setSavingKey(null);
    }
  };

  const openAddMenu = categoryId => {
    setAddDraft({
      categoryId: categoryId ? String(categoryId) : '',
      routeId: '',
      menu: '',
      icon: '',
      color: '',
      sortOrder: '',
      linkTypes: [],
    });
  };

  const updateAddRoute = option => {
    const route = routeById[String(option.id)] || option;
    setAddDraft(current => ({
      ...(current || {}),
      routeId: String(option.id),
      menu: current?.menu || route.route || option.label || '',
      icon: normalizeFeatherIcon(route.icon || current?.icon || ''),
      color: route.color || current?.color || '',
    }));
  };

  const createMenu = async () => {
    if (!addDraft?.routeId || !addDraft?.categoryId) {
      showError('Informe a rota e a categoria.');
      return;
    }

    setSavingKey('new-menu');
    try {
      await api.fetch('menu-config', {
        method: 'POST',
        body: {
          appType: activeAppType,
          route: addDraft.routeId,
          category: addDraft.categoryId,
          menu: addDraft.menu,
          icon: normalizeFeatherIcon(addDraft.icon),
          color: addDraft.color,
          linkTypes: addDraft.linkTypes,
          enabled: true,
          ...(String(addDraft.sortOrder || '').trim() !== ''
            ? {sortOrder: Number(addDraft.sortOrder)}
            : {}),
        },
      });
      setAddDraft(null);
      showSuccess('Menu criado.');
      await loadMenus({preserveScroll: true});
    } catch (error) {
      showError(formatApiError(error));
    } finally {
      setSavingKey(null);
    }
  };

  if (!isAdminApp) {
    return (
      <View style={styles.centerState}>
        <Icon name="shield" size={28} color="#64748B" />
        <Text style={styles.centerTitle}>Abra no app admin</Text>
        <Text style={styles.centerText}>A configuracao de menus foi movida para a nova visao ADMIN.</Text>
      </View>
    );
  }

  if (!canManageMenus) {
    return (
      <View style={styles.centerState}>
        <Icon name="lock" size={28} color="#64748B" />
        <Text style={styles.centerTitle}>Acesso restrito</Text>
        <Text style={styles.centerText}>Esta configuracao e exclusiva do super admin.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Menus por perfil</Text>
          <Text style={styles.subtitle}>Categorias com seus menus, rotas e vinculos.</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[
            styles.primaryButton,
            {
              backgroundColor: palette.buttonBackground,
              borderColor: palette.buttonBorder,
            },
          ]}
          onPress={() => openAddMenu('')}
        >
          <Icon name="plus" size={15} color={palette.buttonIcon} />
          <Text style={[styles.primaryButtonText, {color: palette.buttonText}]}>Adicionar rota</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appTypeSelector}>
        <Text style={styles.selectorLabel}>APP_TYPE</Text>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.appTypeSelectButton}
          onPress={() => setAppTypeSelectorOpen(open => !open)}
        >
          <Text style={styles.appTypeSelectText}>{activeAppType}</Text>
          <Icon
            name={appTypeSelectorOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#334155"
          />
        </TouchableOpacity>

        {appTypeSelectorOpen && (
          <View style={styles.appTypeOptions}>
            {availableAppTypes.map(appType => (
              <TouchableOpacity
                key={appType}
                activeOpacity={0.82}
                style={[
                  styles.appTypeOption,
                  activeAppType === appType && styles.appTypeOptionActive,
                ]}
                onPress={() => {
                  setActiveAppType(appType);
                  setAppTypeSelectorOpen(false);
                  setAddDraft(null);
                }}
              >
                <Text
                  style={[
                    styles.appTypeOptionText,
                    activeAppType === appType && styles.appTypeOptionTextActive,
                  ]}
                >
                  {appType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {addDraft && (
        <View style={styles.addPanel}>
          <View style={styles.addPanelHeader}>
            <Text style={styles.sectionTitle}>Nova rota no menu</Text>
            <TouchableOpacity style={styles.iconButton} onPress={() => setAddDraft(null)}>
              <Icon name="x" size={18} color="#334155" />
            </TouchableOpacity>
          </View>
          <View style={styles.formGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Categoria</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setPicker({
                  title: 'Selecionar categoria',
                  options: categoryOptions,
                  selectedId: addDraft.categoryId,
                  onSelect: option => setAddDraft(current => ({...(current || {}), categoryId: String(option.id)})),
                })}
              >
                <Text style={styles.selectText}>
                  {categoryById[addDraft.categoryId]?.name || 'Selecionar'}
                </Text>
                <Icon name="chevron-down" size={15} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Rota</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setPicker({
                  title: 'Selecionar rota',
                  options: routeOptions,
                  selectedId: addDraft.routeId,
                  onSelect: updateAddRoute,
                })}
              >
                <Text style={styles.selectText}>
                  {routeById[addDraft.routeId]?.route || 'Selecionar'}
                </Text>
                <Icon name="chevron-down" size={15} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Texto</Text>
              <TextInput
                style={styles.input}
                value={addDraft.menu}
                onChangeText={menu => setAddDraft(current => ({...(current || {}), menu}))}
                placeholder="Nome no menu"
              />
            </View>
            <View style={styles.fieldSmall}>
              <Text style={styles.fieldLabel}>Icone</Text>
              <DefaultFeatherIconPicker
                value={addDraft.icon}
                onChange={icon => setAddDraft(current => ({...(current || {}), icon}))}
                placeholder="Buscar icone"
              />
            </View>
            <View style={styles.fieldSmall}>
              <Text style={styles.fieldLabel}>Cor</Text>
              <TextInput
                style={styles.input}
                value={addDraft.color}
                onChangeText={color => setAddDraft(current => ({...(current || {}), color}))}
                placeholder="#2563EB"
              />
            </View>
            <View style={styles.fieldTiny}>
              <Text style={styles.fieldLabel}>Ordem</Text>
              <TextInput
                style={styles.input}
                value={addDraft.sortOrder}
                keyboardType="numeric"
                onChangeText={sortOrder => setAddDraft(current => ({...(current || {}), sortOrder}))}
              />
            </View>
          </View>
          <View style={styles.linkGrid}>
            {availableLinkTypes.map(linkType => {
              const active = addDraft.linkTypes.includes(linkType);

              return (
                <TouchableOpacity
                  key={`new-${linkType}`}
                  activeOpacity={0.82}
                  style={[styles.linkButton, active && styles.linkButtonActive]}
                  onPress={() => setAddDraft(current => {
                    const selected = current?.linkTypes || [];
                    return {
                      ...(current || {}),
                      linkTypes: selected.includes(linkType)
                        ? selected.filter(value => value !== linkType)
                        : [...selected, linkType],
                    };
                  })}
                >
                  <Icon name={active ? 'check-square' : 'square'} size={14} color={active ? '#2563EB' : '#94A3B8'} />
                  <Text style={[styles.linkText, active && styles.linkTextActive]}>
                    {linkTypeLabel(linkType)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={savingKey === 'new-menu'}
            style={[
              styles.saveButton,
              {
                backgroundColor: palette.buttonBackground,
                borderColor: palette.buttonBorder,
              },
            ]}
            onPress={createMenu}
          >
            <Icon name="save" size={15} color={palette.buttonIcon} />
            <Text style={[styles.saveButtonText, {color: palette.buttonText}]}>Salvar novo menu</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.centerText}>Carregando menus...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.list}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {groupedItems.map(group => {
            const categoryId = getId(group.category);
            const categoryDraft = categoryDrafts[String(categoryId)] || {};
            const categoryIcon = normalizeFeatherIcon(categoryDraft.icon) || 'folder';

            return (
              <View key={categoryId || group.category?.name} style={styles.categoryBlock}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryPreview}>
                    <Icon name={categoryIcon} size={18} color={categoryDraft.color} />
                    <Text style={styles.categoryTitle}>{categoryDraft.name || group.category?.name}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: palette.buttonBackground,
                          borderColor: palette.buttonBorder,
                        },
                      ]}
                      onPress={() => openAddMenu(categoryId)}
                    >
                      <Icon name="plus" size={14} color={palette.buttonIcon} />
                      <Text style={[styles.categoryButtonText, {color: palette.buttonText}]}>Adicionar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      disabled={savingKey === `category-${categoryId}`}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: palette.buttonBackground,
                          borderColor: palette.buttonBorder,
                        },
                      ]}
                      onPress={() => saveCategory(group.category)}
                    >
                      <Icon name="save" size={14} color={palette.buttonIcon} />
                      <Text style={[styles.categoryButtonText, {color: palette.buttonText}]}>Salvar categoria</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.categoryFields}>
                  <TextInput
                    style={styles.input}
                    value={categoryDraft.name}
                    onChangeText={name => setCategoryDraft(categoryId, {name})}
                    placeholder="Nome da categoria"
                  />
                  <DefaultFeatherIconPicker
                    style={styles.categoryIconField}
                    value={categoryDraft.icon}
                    onChange={icon => setCategoryDraft(categoryId, {icon})}
                    placeholder="Buscar icone"
                  />
                  <TextInput
                    style={styles.compactInput}
                    value={categoryDraft.color}
                    onChangeText={color => setCategoryDraft(categoryId, {color})}
                    placeholder="Cor"
                  />
                </View>

                <View style={styles.menuList}>
                  {group.menus.map(item => {
                    const draft = menuDrafts[String(item.id)] || toDraft(item);
                    const route = routeById[draft.routeId] || item.route || {};
                    const category = categoryById[draft.categoryId] || item.category || {};
                    const disabled = savingKey === `menu-${item.id}`;

                    return (
                      <View key={item.id} style={styles.menuRow}>
                        <View style={styles.menuHeader}>
                          <View style={styles.menuPreview}>
                            <Icon name={draft.icon || 'circle'} size={17} color={draft.color} />
                            <View style={styles.rowTitleGroup}>
                              <Text style={styles.menuTitle}>{draft.menu || item.label}</Text>
                              <Text style={styles.menuMeta}>{route.route || '-'} em {category.name || '-'}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            activeOpacity={0.82}
                            style={[
                              styles.enabledButton,
                              {
                                backgroundColor: draft.enabled
                                  ? palette.buttonBackground
                                  : palette.buttonBackgroundSecondary,
                                borderColor: draft.enabled
                                  ? palette.buttonBorder
                                  : palette.buttonBorderSecondary,
                              },
                            ]}
                            onPress={() => setMenuDraft(item.id, {enabled: !draft.enabled})}
                          >
                            <Icon
                              name={draft.enabled ? 'eye' : 'eye-off'}
                              size={14}
                              color={draft.enabled ? palette.buttonIcon : palette.buttonIconSecondary}
                            />
                            <Text
                              style={[
                                styles.enabledText,
                                {
                                  color: draft.enabled
                                    ? palette.buttonText
                                    : palette.buttonTextSecondary,
                                },
                              ]}
                            >
                              {draft.enabled ? 'Ativo' : 'Inativo'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.formGrid}>
                          <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Texto</Text>
                            <TextInput
                              style={styles.input}
                              value={draft.menu}
                              onChangeText={menu => setMenuDraft(item.id, {menu})}
                            />
                          </View>
                          <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Rota</Text>
                            <TouchableOpacity
                              style={styles.selectField}
                              onPress={() => setPicker({
                                title: 'Selecionar rota',
                                options: routeOptions,
                                selectedId: draft.routeId,
                                onSelect: option => {
                                  const selectedRoute = routeById[String(option.id)] || option;
                                  setMenuDraft(item.id, {
                                    routeId: String(option.id),
                                    icon: normalizeFeatherIcon(selectedRoute.icon),
                                    color: selectedRoute.color || '',
                                  });
                                },
                              })}
                            >
                              <Text style={styles.selectText}>{route.route || 'Selecionar'}</Text>
                              <Icon name="chevron-down" size={15} color="#64748B" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Categoria</Text>
                            <TouchableOpacity
                              style={styles.selectField}
                              onPress={() => setPicker({
                                title: 'Selecionar categoria',
                                options: categoryOptions,
                                selectedId: draft.categoryId,
                                onSelect: option => setMenuDraft(item.id, {categoryId: String(option.id)}),
                              })}
                            >
                              <Text style={styles.selectText}>{category.name || 'Selecionar'}</Text>
                              <Icon name="chevron-down" size={15} color="#64748B" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.fieldSmall}>
                            <Text style={styles.fieldLabel}>Icone da rota</Text>
                            <DefaultFeatherIconPicker
                              value={draft.icon}
                              onChange={icon => setMenuDraft(item.id, {icon})}
                            />
                          </View>
                          <View style={styles.fieldSmall}>
                            <Text style={styles.fieldLabel}>Cor da rota</Text>
                            <TextInput
                              style={styles.input}
                              value={draft.color}
                              onChangeText={color => setMenuDraft(item.id, {color})}
                            />
                          </View>
                          <View style={styles.fieldTiny}>
                            <Text style={styles.fieldLabel}>Ordem</Text>
                            <TextInput
                              style={styles.input}
                              value={draft.sortOrder}
                              keyboardType="numeric"
                              onChangeText={sortOrder => setMenuDraft(item.id, {sortOrder})}
                            />
                          </View>
                        </View>

                        <View style={styles.linkGrid}>
                          {availableLinkTypes.map(linkType => {
                            const selected = draft.linkTypes.includes(linkType);

                            return (
                              <TouchableOpacity
                                key={`${item.id}-${linkType}`}
                                activeOpacity={0.82}
                                disabled={disabled}
                                style={[styles.linkButton, selected && styles.linkButtonActive]}
                                onPress={() => toggleDraftLinkType(item.id, linkType)}
                              >
                                <Icon name={selected ? 'check-square' : 'square'} size={14} color={selected ? '#2563EB' : '#94A3B8'} />
                                <Text style={[styles.linkText, selected && styles.linkTextActive]}>
                                  {linkTypeLabel(linkType)}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.82}
                          disabled={disabled}
                          style={[
                            styles.saveButton,
                            {
                              backgroundColor: palette.buttonBackground,
                              borderColor: palette.buttonBorder,
                            },
                          ]}
                          onPress={() => saveMenu(item)}
                        >
                          <Icon name="save" size={15} color={palette.buttonIcon} />
                          <Text style={[styles.saveButtonText, {color: palette.buttonText}]}>Salvar menu</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {groupedItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.centerText}>Nenhum menu cadastrado para este APP_TYPE.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <SelectionModal picker={picker} onClose={() => setPicker(null)} />
    </View>
  );
}
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
