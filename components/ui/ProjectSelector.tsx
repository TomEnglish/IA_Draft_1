import { useAuthStore } from '@/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, radius, space, fontSize, fontWeight, shadow } from '@/lib/design/tokens';

export function ProjectSelector() {
  const { activeProject, availableProjects, setActiveProject } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  if (!activeProject || availableProjects.length <= 1) {
    return (
      <View style={styles.singleProjectContainer}>
        <Text style={styles.singleProjectText}>{activeProject?.name}</Text>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.selectorButton}
        accessibilityRole="button"
        accessibilityLabel={`Project: ${activeProject.name}. Tap to change.`}
      >
        <Text style={styles.selectorText}>{activeProject.name}</Text>
        <FontAwesome name="caret-down" size={16} color={colors.brandPrimary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          accessibilityLabel="Close project selector"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <FlatList
              data={availableProjects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.projectItem,
                    item.id === activeProject.id && styles.projectItemActive,
                  ]}
                  onPress={() => {
                    setActiveProject(item.id);
                    setModalVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.id === activeProject.id }}
                >
                  <Text
                    style={[
                      styles.projectItemText,
                      item.id === activeProject.id && styles.projectItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === activeProject.id && (
                    <FontAwesome name="check" size={16} color={colors.brandPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  singleProjectContainer: {
    paddingHorizontal: space[3],
    marginRight: space[2],
  },
  singleProjectText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontWeight: fontWeight.medium as TextStyle['fontWeight'],
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1] + 2,
    paddingHorizontal: space[3],
    paddingVertical: space[2] - 2,
    backgroundColor: colors.brandPrimarySoft,
    borderRadius: radius.pill,
    marginRight: space[2],
  },
  selectorText: {
    fontSize: fontSize.body,
    color: colors.brandPrimary,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.md,
  },
  modalTitle: {
    fontSize: fontSize.md + 2,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
    marginBottom: space[4],
    color: colors.textPrimary,
    textAlign: 'center',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.raised,
  },
  projectItemActive: {
    backgroundColor: colors.brandPrimarySoft,
    borderRadius: radius.md,
    borderBottomWidth: 0,
  },
  projectItemText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  projectItemTextActive: {
    color: colors.brandPrimary,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
  },
});
