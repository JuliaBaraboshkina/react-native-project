import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { GlobalContext } from '../GlobalContext';
import { ProgressCircle } from 'react-native-svg-charts';
import 'moment/locale/ru';
import moment from 'moment';

export default function ProjectDetails({ route, navigation }) {
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const { globalVariable } = useContext(GlobalContext);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/task/get?taskId=${route.params.taskId}`, {
        method: "GET",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();

      const sortedSubtasks = json.subtasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setSubtasks(sortedSubtasks);

      const commentsWithUserDetails = json.comments.map(comment => {
        const user = json.assignee.find(user => user.id === comment.userId);
        return {
          ...comment,
          user
        };
      });

      setComments(commentsWithUserDetails);
      setAssignees(json.assignee);
      setFiles([
        { id: 1, name: 'test-pdf', description: 'Описание', type: 'PDF' },
        { id: 2, name: 'test-zip', description: 'Описание', type: 'ZIP' },
        { id: 3, name: 'test-doc', description: 'Описание', type: 'DOC' },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [route.params.taskId, selectedTab]);

  const toggleSubtaskModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleEmailModal = () => {
    setShowEmailModal(!showEmailModal);
  };

  const addSubtask = async () => {
    if (newSubtaskTitle.trim() === '') return;

    try {
      await fetch(`http://192.168.1.75:8080/api/v1/task/add-subtask?taskId=${route.params.taskId}`, {
        method: "PUT",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": newSubtaskTitle,
          "status": false
        })
      });
      fetchData();
      setNewSubtaskTitle("");
    } catch (error) {
      console.error('Error:', error);
    }

    toggleSubtaskModal();
  };

  const addComment = async () => {
    if (newComment.trim() === '') return;

    try {
      await fetch(`http://192.168.1.75:8080/api/v1/task/add-comment?taskId=${route.params.taskId}`, {
        method: "POST",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "userId": globalVariable,
          "comment": newComment
        })
      });
      setNewComment('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSubtask = async (id) => {
    try {
      await fetch(`http://192.168.1.75:8080/api/v1/task/toggle-subtask?userId=${globalVariable}&subtaskId=${id}`, {
        method: "PUT",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json'
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/user/exists?email=${email}`);
      const userId = await response.text();

      if (userId) {
        setEmail('');
        setShowEmailModal(false);

        const addMemberResponse = await fetch(`http://192.168.1.75:8080/api/v1/task/add-member?taskId=${route.params.taskId}&userId=${userId}`, {
          method: 'PUT'
        });

        if (!addMemberResponse.ok) {
          Alert.alert('Ошибка', 'Произошла ошибка при добавлении участника в задачу.');
          return;
        }

        setAssignees([...assignees, { id: userId, email, avatarUrl: '../assets/favicon.png' }]);

      } else {
        Alert.alert('Ошибка', 'Пользователь не найден.');
        setShowEmailModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при добавлении участника.');
      setShowEmailModal(false);
    }
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {item.user && (
          <>
            {item.user.avatarUrl ? (
              <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
            ) : (
              <Image source={require('../assets/favicon.png')} style={styles.avatar} />
            )}
            <View style={styles.commentAuthorContainer}>
              <Text style={styles.commentAuthor}>{item.user.firstName} {item.user.secondName}</Text>
              <Text style={styles.commentEmail}>{item.user.email}</Text>
            </View>
            <Text style={styles.commentDate}>{moment(item.commentDate).format('HH:mm')}</Text>
          </>
        )}
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  const renderFileItem = ({ item }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileIconContainer}>
        <Text style={styles.fileIconText}>{item.type}</Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity style={styles.fileOptions}>
        <IoniconsIcon name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const progress = subtasks.length > 0 ? subtasks.filter(t => t.status).length / subtasks.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IoniconsIcon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.params.taskName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
          <FontAwesomeIcon name="calendar" size={24} marginLeft="10%" color="#333" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.content}>
            <View style={styles.progressContainer}>
              <ProgressCircle
                style={styles.progressCircle}
                progress={progress}
                progressColor={'#FF6C63'}
                backgroundColor={'#F2F3F5'}
              />
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressLabel}>Выполнено</Text>
            </View>
            <View style={styles.teamContainer}>
              <Text style={styles.teamTitle}>Команда</Text>
              <View style={styles.teamIcons}>
                {assignees.map(user => (
                  <Image
                    key={user.id}
                    source={user.avatarUrl ? { uri: user.avatarUrl } : require('../assets/favicon.png')}
                    style={styles.avatarIcon}
                  />
                ))}
                <TouchableOpacity style={styles.addTeamMember} onPress={toggleEmailModal}>
                  <IoniconsIcon name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'tasks' && styles.selectedTabButton]}
              onPress={() => setSelectedTab('tasks')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'tasks' && styles.selectedTabButtonText]}>Подзадачи</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'files' && styles.selectedTabButton]}
              onPress={() => setSelectedTab('files')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'files' && styles.selectedTabButtonText]}>Файлы</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'comments' && styles.selectedTabButton]}
              onPress={() => setSelectedTab('comments')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'comments' && styles.selectedTabButtonText]}>Комментарии</Text>
            </TouchableOpacity>
          </View>
          {selectedTab === 'tasks' && (
            <View style={styles.tasksContainer}>
              <TouchableOpacity style={styles.addTaskButton} onPress={toggleSubtaskModal}>
                <IoniconsIcon name="add" size={24} color="#fff" />
                <Text style={styles.addTaskButtonText}>Добавить подзадачу</Text>
              </TouchableOpacity>
              <FlatList
                data={subtasks}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.subtaskContainer}>
                    <TouchableOpacity onPress={() => toggleSubtask(item.id)} style={styles.subtaskCheck}>
                      <IoniconsIcon name={item.status ? "checkmark-circle" : "ellipse-outline"} size={24} color={item.status ? "#28A745" : "#6C63FF"} />
                    </TouchableOpacity>
                    <Text style={[styles.subtaskText, item.status && styles.subtaskCompleted]}>{item.name}</Text>
                    <TouchableOpacity style={styles.subtaskLink}>
                      <IoniconsIcon name="link" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
          {selectedTab === 'files' && (
            <View style={styles.filesContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={() => {/* handle file upload */}}>
                <IoniconsIcon name="cloud-upload" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Загрузить файл</Text>
              </TouchableOpacity>
              <FlatList
                data={files}
                keyExtractor={item => item.id.toString()}
                renderItem={renderFileItem}
              />
            </View>
          )}
          {selectedTab === 'comments' && (
            <View style={styles.commentsContainer}>
              <FlatList
                data={comments}
                keyExtractor={item => item.id.toString()}
                renderItem={renderCommentItem}
              />
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Напишите свой комментарий"
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.sendButton} onPress={addComment}>
                  <IoniconsIcon name="send" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
      <Modal isVisible={isModalVisible} onBackdropPress={toggleSubtaskModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Новая подзадача</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Название задачи"
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
          />
          <TouchableOpacity style={styles.createTaskButton} onPress={addSubtask}>
            <Text style={styles.createTaskButtonText}>Создать подзадачу</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={showEmailModal} onBackdropPress={toggleEmailModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Добавить участника</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Введите email участника"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.createTaskButton} onPress={handleAddMember}>
            <Text style={styles.createTaskButtonText}>Добавить участника</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginLeft: "10%"
  },
  progressCircle: {
    height: 100,
    width: 100,
  },
  progressText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 50,
    marginLeft: 10,
    color: '#333',
  },
  progressLabel: {
    position: "absolute",
    marginTop: 30,
    fontSize: 14,
    color: '#888',
  },
  teamContainer: {
    alignItems: 'center',
    marginRight: "10%"
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  teamIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addTeamMember: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  avatarIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#888',
  },
  selectedTabButtonText: {
    color: '#6C63FF',
  },
  tasksContainer: {
    flex: 1,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: "2%"
  },
  addTaskButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: "2%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subtaskCheck: {
    marginRight: 10,
  },
  subtaskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  subtaskCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  subtaskLink: {
    marginLeft: 10,
  },
  filesContainer: {
    flex: 1,
    paddingTop: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: "2%"
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: "2%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fileDescription: {
    fontSize: 12,
    color: '#888',
  },
  fileOptions: {
    marginLeft: 10,
  },
  commentsContainer: {
    flex: 1,
  },
  commentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: "2%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentAuthorContainer: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentEmail: {
    fontSize: 12,
    color: '#888',
  },
  commentDate: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: "3%",
    marginLeft: "2%",
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  commentInput: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancel: {
    alignSelf: 'flex-start',
    color: '#6C63FF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
  },
  createTaskButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  createTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  addAssigneeButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
