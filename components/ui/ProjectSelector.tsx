import { useAuthStore } from '@/stores/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ProjectSelector() {
    const { activeProject, availableProjects, setActiveProject } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);

    if (!activeProject || availableProjects.length <= 1) {
        // Hide selector dropdown (just show text) if user only has 1 project
        return (
            <View style={styles.singleProjectContainer}>
                <Text style={styles.singleProjectText}>{activeProject?.name}</Text>
            </View>
        );
    }

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectorButton}>
                <Text style={styles.selectorText}>{activeProject.name}</Text>
                <FontAwesome name="caret-down" size={16} color="#2563EB" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
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
                                >
                                    <Text style={[
                                        styles.projectItemText,
                                        item.id === activeProject.id && styles.projectItemTextActive,
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {item.id === activeProject.id && (
                                        <FontAwesome name="check" size={16} color="#2563EB" />
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
        paddingHorizontal: 12,
        marginRight: 8,
    },
    singleProjectText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        marginRight: 8,
    },
    selectorText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1E293B',
        textAlign: 'center',
    },
    projectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    projectItemActive: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        borderBottomWidth: 0,
    },
    projectItemText: {
        fontSize: 16,
        color: '#334155',
    },
    projectItemTextActive: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
