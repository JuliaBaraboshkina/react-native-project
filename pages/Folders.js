import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { GlobalContext } from '../GlobalContext';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import moment from 'moment';
import 'moment/locale/ru';
import { useFocusEffect } from '@react-navigation/native';

export default function Folders({ navigation }) {
  const today = moment().locale('ru').format('D, MMMM, yyyy');
  const { globalVariable } = useContext(GlobalContext);

  const [folders, setFolders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const fetchFolders = useCallback(() => {
    fetch(`http://192.168.1.75:8080/api/v1/project/get-user-projects?ownerId=${globalVariable}`, {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(json => {
      console.log('Fetched folders:', json);
      setFolders(json);
    })
    .catch(error => console.error('Error:', error));
  }, [globalVariable]);

  useFocusEffect(
    useCallback(() => {
      fetchFolders();
    }, [fetchFolders])
  );

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleMenu = (folder) => {
    setSelectedFolder(folder);
    setIsMenuVisible(!isMenuVisible);
  };

  const handleEdit = () => {
    toggleMenu(null);
    navigation.navigate('EditProject', { id: selectedFolder.id });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/project/delete?projectId=${selectedFolder.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFolders(folders.filter(folder => folder.id !== selectedFolder.id));
        Alert.alert('Проект удален');
      } else {
        Alert.alert('Ошибка при удалении проекта');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      toggleMenu(null);
    }
  };

  const confirmDeleteProject = () => {
    Alert.alert(
      'Удалить проект',
      'Вы уверены, что хотите удалить этот проект?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', onPress: handleDelete },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerDate} onPress={() => navigation.replace("Calendar")}>
            <FontAwesomeIcon name="calendar" size={24} color="#6C63FF" />
            <Text style={styles.date}>{today}</Text>
          </TouchableOpacity>
          <FontAwesomeIcon name="user-circle" size={30} color="#6C63FF" style={styles.userIcon} />
        </View>
        <Text style={styles.sectionTitle}>Мои папки</Text>
        <ScrollView contentContainerStyle={styles.folderContainer}>
          {folders.length === 0 ? (
            <View style={styles.emptyMessageContainer}>
              <Text style={styles.emptyMessage}>Здесь пока пусто, создайте свой первый проект</Text>
              <Text style={styles.emoji}>😎</Text>
            </View>
          ) : (
            folders.map(folder => (
              <View key={folder.id} style={styles.folder}>
                <TouchableOpacity style={styles.folderContent} onPress={() => navigation.navigate('Project', { id: folder.id, name: folder.name })}>
                  <View style={[styles.folderHeader, { backgroundColor: folder.tagColor }]}>
                    <Text style={styles.folderName}>{folder.name}</Text>
                    <TouchableOpacity onPress={() => toggleMenu(folder)}>
                      <FontAwesomeIcon name="ellipsis-h" size={20} color="#A5A8B2" style={styles.folderMenuIcon} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.folderDetails}>
                    <FontAwesomeIcon name="check-square" size={16} color="#A5A8B2" />
                    <Text style={styles.folderTasks}>Задачи: {folder.tasks.length}</Text>
                    {folder.members.length > 1 ? (
                      <FontAwesomeIcon name="users" size={16} color="#A5A8B2" style={styles.folderUserIcon} />
                    ) : (
                      <FontAwesomeIcon name="user" size={16} color="#A5A8B2" style={styles.folderUserIcon} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Main')}>
            <FontAwesomeIcon name="home" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <MaterialIcons name="folder" size={24} color="#6C63FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusButtonWrapper} onPress={toggleModal}>
            <View style={styles.plusButton}>
              <FontAwesomeIcon name="plus" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('StatisticsScreen')}>
            <FontAwesomeIcon name="pie-chart" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Chat')}>
            <MaterialCommunityIcons name="chat" size={24} color="#A5A8B2" />
          </TouchableOpacity>
        </View>

        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => { toggleModal(); navigation.navigate('AddTask'); }}>
              <Text style={styles.modalOption}>Новая задача</Text>
            </TouchableOpacity>
            <View style={styles.modalSeparator} />
            <TouchableOpacity onPress={() => { toggleModal(); navigation.navigate('AddProject'); }}>
              <Text style={styles.modalOption}>Новый проект</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal isVisible={isMenuVisible} onBackdropPress={() => toggleMenu(null)}>
          <View style={styles.menuContent}>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.menuOption}>Редактировать</Text>
            </TouchableOpacity>
            <View style={styles.menuSeparator} />
            <TouchableOpacity onPress={confirmDeleteProject}>
              <Text style={styles.menuOption}>Удалить</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#6C63FF',
    marginLeft: 10,
    marginTop: 2,
  },
  userIcon: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 20,
  },
  folderContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 24,
    marginTop: 10,
  },
  folder: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  folderContent: {
    flex: 1,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  folderMenuIcon: {
    color: '#fff',
  },
  folderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  folderTasks: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  folderUserIcon: {
    marginLeft: 'auto',
  },
  headerDate: {
    flexDirection: "row",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerButton: {
    padding: 10,
  },
  plusButtonWrapper: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 12,
  },
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalOption: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginVertical: 10,
  },
  modalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#6C63FF',
    marginVertical: 10,
  },
  menuContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  menuOption: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginVertical: 10,
  },
  menuSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#6C63FF',
    marginVertical: 10,
  },
});
