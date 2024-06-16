import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalContext } from '../GlobalContext';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Modal from 'react-native-modal';
import moment from 'moment';
import 'moment/locale/ru';

export default function Main({ navigation }) {
  const today = moment().locale('ru').format('D, MMMM, yyyy');
  const { globalVariable } = useContext(GlobalContext);

  const calculateProgress = (subtasks, totalSubtasks) => {
    if (subtasks == 0 || totalSubtasks == 0) return 0;
    return (subtasks / totalSubtasks) * 100;
  };

  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/project/get-user-projects?ownerId=${globalVariable}`, {
        method: "GET",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:8080',
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        }
      });
      const json = await response.json();
      setFolders(json);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/task/get-all-tasks?userId=${globalVariable}`, {
        method: "GET",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:8080',
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        }
      });
      const json = await response.json();
      if (Array.isArray(json)) {
        setTasks(json.sort((a, b) => {
          if (a.priority === b.priority) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.priority - a.priority;
        }));
      }
      console.log(tasks);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/user/getUser?userId=${globalVariable}`);
      const userData = await response.json();
      if (userData.avatarUrl) {
        setAvatarUrl(userData.avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchTasks();
    fetchUserData();
  }, [globalVariable]);

  useFocusEffect(
    useCallback(() => {
      fetchFolders();
      fetchTasks();
      fetchUserData();
    }, [])
  );

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const renderTaskAssignees = (assignees) => {
    return (
      <View style={styles.assigneesContainer}>
        {assignees.map((assignee, index) => (
          <Image key={index} source={{ uri: assignee.avatarUrl }} style={styles.assigneeAvatar} />
        ))}
      </View>
    );
  };

  const renderPriorityIcon = (priority, tagColor) => {
    console.log(priority);
    if (priority === 1) return null;
    const iconName = priority === 2 ? 'star-o' : 'star';
    const iconColor = tagColor;
    return <FontAwesomeIcon name={iconName} size={20} color={iconColor} style={styles.priorityIcon} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerDate} onPress={() => navigation.replace("Calendar")}>
            <FontAwesomeIcon name="calendar" size={24} color="#6C63FF" />
            <Text style={styles.date}>{today}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <FontAwesomeIcon name="user-circle" size={30} color="#6C63FF" style={styles.userIcon} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Мои папки</Text>
        <View style={styles.folderContainer}>
          {folders.length === 0 ? (
            <View style={styles.emptyMessageContainer}>
              <Text style={styles.emptyMessage}>Здесь пока пусто, создайте свой первый проект</Text>
              <Text style={styles.emoji}>😎</Text>
            </View>
          ) : (
            folders.map(folder => (
              <TouchableOpacity key={folder.id} style={styles.folder} onPress={() => navigation.replace('Project', { id: folder.id, name: folder.name })}>
                <View style={[styles.folderHeader, { backgroundColor: folder.tagColor }]}>
                  <Text style={styles.folderName}>{folder.name}</Text>
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
            ))
          )}
        </View>
        <Text style={styles.sectionTitle}>Текущие задачи</Text>
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const progress = calculateProgress(item.subtasks, item.totalSubtasks);
            return (
              <TouchableOpacity onPress={() => navigation.navigate('ProjectDetails', { taskId: item.id, taskName: item.title })}>
                <View style={styles.taskContainer}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <View style={styles.task}>
                    <View style={styles.taskHeader}>
                      {renderPriorityIcon(item.priority, item.color)}
                      <Text style={styles.taskTitle}>{item.title}</Text>
                      {renderTaskAssignees(item.assignees)}
                    </View>
                    <View style={styles.taskDetails}>
                      <View style={styles.taskDetailItem}>
                        <FontAwesomeIcon name="calendar" size={14} />
                        <Text style={styles.taskDetailText}>Дедлайн:</Text>
                        <Text style={styles.taskDetailValue}>{item.deadline}</Text>
                      </View>
                      <View style={styles.taskDetailItem}>
                        <FontAwesomeIcon name="check-square" size={14} />
                        <Text style={styles.taskDetailText}>Подзадачи:</Text>
                        <Text style={styles.taskDetailValue}>{item.subtasks}/{item.totalSubtasks}</Text>
                      </View>
                    </View>
                    <View style={styles.progressBarWrapper}>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <FontAwesomeIcon name="home" size={24} color="#6C63FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Folders')}>
            <MaterialIcons name="folder" size={24} color="#A5A8B2" />
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
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
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
  taskContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  colorIndicator: {
    width: 5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  task: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 5,
  },
  assigneesContainer: {
    flexDirection: 'row',
  },
  assigneeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 5,
  },
  taskDetails: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  taskDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  taskDetailValue: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginRight: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerButton: {
    padding: 10,
  },
  headerDate: {
    flexDirection: "row",
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
  priorityIcon: {
    marginRight: 5,
    marginTop: 2,
  },
});
