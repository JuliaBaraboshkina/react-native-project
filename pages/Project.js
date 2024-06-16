import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalContext } from '../GlobalContext';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import moment from 'moment';
import 'moment/locale/ru';

export default function Project({ route, navigation }) {
  const today = moment().locale('ru').format('D, MMMM, yyyy');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const { globalVariable, setGlobalVariable } = useContext(GlobalContext);

  const calculateProgress = (subtasks, totalSubtasks) => {
    if (subtasks === 0 || totalSubtasks === 0) return 0;
    return (subtasks / totalSubtasks) * 100;
  };

  const statusMap = () => {
    switch (selectedStatus) {
      case 'Не начато':
        return '1';
      case 'В процессе':
        return '2';
      case 'Завершено':
        return '3';
      default:
        return '0';
    }
  };

  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchTasks = () => {
    fetch(`http://192.168.1.75:8080/api/v1/task/get-all-tasks-project-id?projectId=${route.params.id}&status=${statusMap()}`, {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(response => response.json())
      .then(json => {
        setTasks(json);
        console.log(tasks);
      })
      .catch(error => console.error('Error:', error));
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [selectedStatus])
  );

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerDate} onPress={() => navigation.replace("Calendar")}>
          <FontAwesomeIcon name="calendar" size={24} color="#6C63FF" />
          <Text style={styles.date}>{today}</Text>
        </TouchableOpacity>
        <FontAwesomeIcon name="user-circle" size={30} color="#6C63FF" style={styles.userIcon} />
      </View>

      <Text style={styles.sectionTitle}>{route.params.name}</Text>

      <View style={styles.statusFilter}>
        {['Все', 'Не начато', 'В процессе', 'Завершено'].map((status, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.statusButton,
              selectedStatus === status ? styles[`selectedButton${index + 1}`] : styles[`defaultButton${index + 1}`]
            ]}
            onPress={() => {
              setSelectedStatus(status);
            }}
          >
            <Text style={[
              styles.statusText,
              selectedStatus === status ? styles.selectedStatusText : styles.defaultStatusText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const progress = calculateProgress(item.subtasks, item.totalSubtasks);
          return (
            <TouchableOpacity onPress={() => navigation.navigate('ProjectDetails', { taskId: item.id, taskName: item.title })}>
              <View style={styles.taskContainer}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color || '#000' }]} />
                <View style={styles.task}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <View style={styles.taskDetails}>
                    <View style={styles.taskDetailItem}>
                      <FontAwesomeIcon name="calendar" size={14} />
                      <Text style={styles.taskDetailText}>Дедлайн: {item.deadline}</Text>
                    </View>
                    <View style={styles.taskDetailItem}>
                      <FontAwesomeIcon name="check-square" size={14} />
                      <Text style={styles.taskDetailText}>Подзадачи: {item.subtasks}/{item.totalSubtasks}</Text>
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
          <FontAwesomeIcon name="user" size={24} color="#A5A8B2" />
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
  headerDate: {
    flexDirection: "row",
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
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  statusButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderWidth: 1,
  },
  defaultButton1: {
    backgroundColor: '#fff',
    borderColor: '#6C63FF',
  },
  selectedButton1: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  defaultButton2: {
    backgroundColor: '#fff',
    borderColor: '#CCCCCC',
  },
  selectedButton2: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  defaultButton3: {
    backgroundColor: '#fff',
    borderColor: '#FEC107',
  },
  selectedButton3: {
    backgroundColor: '#FEC107',
    borderColor: '#FEC107',
  },
  defaultButton4: {
    backgroundColor: '#fff',
    borderColor: '#28A745',
  },
  selectedButton4: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  statusText: {
    fontSize: 14,
  },
  defaultStatusText: {
    color: '#333',
  },
  selectedStatusText: {
    color: '#fff',
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
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  plusButtonWrapper: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 12,
  },
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
});
