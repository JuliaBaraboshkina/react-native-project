import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/ru';
import Modal from 'react-native-modal';
import { GlobalContext } from '../GlobalContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 5;

const Calendar = ({ navigation }) => {
  const today = moment().locale('ru').format('D, MMMM, yyyy');
  const currentTime = moment().format('HH:mm');
  const { globalVariable } = useContext(GlobalContext);

  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);

  const statusMap = () => {
    if (selectedStatus == "Все") return "0";
    if (selectedStatus == "Не начато") return "1";
    if (selectedStatus == "В процессе") return "2";
    if (selectedStatus == "Завершено") return "3";
  }

  const generateDays = (numDays = 31) => {
    const days = [];
    for (let i = -15; i <= numDays - 16; i++) {
      const date = moment().add(i, 'days');
      days.push({
        day: date.format('dd').toUpperCase(),
        date: date.date(),
        fullDate: date.startOf('day'),
        selected: date.isSame(selectedDate, 'day'),
      });
    }
    return days;
  };

  const [days, setDays] = useState(generateDays());
  const selectedIndex = days.findIndex(day => day.selected);

  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && selectedIndex !== -1) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ animated: true, index: selectedIndex });
      }, 100); // delay to ensure the list has been rendered
    }
  }, [selectedIndex]);

  const fetchChanges = () => {
    fetch(`http://192.168.1.75:8080/api/v1/task/get-all-tasks-calendar?userId=${globalVariable}&status=${statusMap()}`, {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(response => response.json())
    .then(json => {
      console.log('Fetched tasks:', json); // Debug: Check fetched tasks
      setTasks(json);
    })
    .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChanges();
    }, [])
  );

  const handleDatePress = (date) => {
    setSelectedDate(date);
    const updatedDays = days.map(day => ({
      ...day,
      selected: day.fullDate.isSame(date, 'day'),
    }));
    setDays(updatedDays);
  };

  const renderTask = task => {
    const deadline = moment(`${task.date} ${task.time}`, 'DD.MM.YYYY HH:mm');
    const topOffset = deadline.hours() * 60 + deadline.minutes(); // Calculate the offset in minutes from the top

    return (
      <View style={[styles.taskWrapper, { top: topOffset }]} key={task.id}>
        <View style={styles.taskContainer}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDeadline}>Дедлайн</Text>
          </View>
          <View style={styles.taskDetails}>
            <Text style={[styles.taskCategory, { backgroundColor: task.color }]}>{task.category}</Text>
          </View>
        </View>
      </View>
    );
  };

  const filteredTasks = tasks.filter(task => moment(task.date, 'DD.MM.YYYY').isSame(selectedDate, 'day'));

  console.log('Filtered tasks:', filteredTasks); // Debug: Check filtered tasks

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.header}>
            <FontAwesomeIcon name="calendar" size={24} color="#6C63FF" />
            <Text style={styles.date}>{today}</Text>
            <FontAwesomeIcon name="user-circle" size={30} color="#6C63FF" style={styles.userIcon} />
          </View>
          <Text style={styles.calendarTitle}>Календарь</Text>
          <View style={styles.calendarHeader}>
            <FlatList
              ref={flatListRef}
              data={days}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              getItemLayout={(data, index) => (
                { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
              )}
              initialScrollIndex={selectedIndex}
              contentContainerStyle={styles.daysList}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleDatePress(item.fullDate)}>
                  <View style={styles.dayWrapper}>
                    <View style={[styles.dayContainer, item.selected ? styles.selectedDayContainer : styles.defaultDayContainer]}>
                      <View style={[styles.dayTop, item.selected ? styles.selectedDayTop : styles.defaultDayTop]}>
                        <Text style={[styles.dayText, item.selected && styles.selectedDayText]}>{item.day}</Text>
                        <Text style={[styles.dayNumber, item.selected && styles.selectedDayText]}>{item.date}</Text>
                      </View>
                      <View style={[styles.dayBottom, item.selected ? styles.selectedDayBottom : styles.defaultDayBottom]} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.statusFilter}>
            {['Все', 'Не начато', 'В процессе', 'Завершено'].map((status, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.statusButton,
                  selectedStatus === status ? styles[`selectedButton${index+1}`] : styles[`defaultButton${index+1}`]
                ]}
                onPress={() => {
                  setSelectedStatus(status)
                  fetchChanges()
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
          <Text style={styles.sectionTitle}>Сегодня</Text>
          <View style={styles.timeContainer}>
            {[...Array(24).keys()].map(hour => (
              <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeText}>{`${hour.toString().padStart(2, '0')}:00`}</Text>
              </View>
            ))}
            {filteredTasks.map(task => renderTask(task))}
            <View style={[styles.currentTimeIndicator, { top: moment().hours() * 60 + moment().minutes() }]}>
              <View style={styles.currentTimeLine} />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Main')}>
            <FontAwesomeIcon name="home" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Folders')}>
            <MaterialIcons name="folder" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusButtonWrapper} onPress={toggleModal}>
            <View style={styles.plusButton}>
              <FontAwesomeIcon name="plus" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('StatisticScreen')}>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Add padding to avoid overlapping with the footer
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
  },
  userIcon: {
    marginLeft: 'auto',
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  calendarHeader: {
    alignItems: 'center',
  },
  daysList: {
    justifyContent: 'center',
    paddingHorizontal: (width - ITEM_WIDTH * 5) / 2, // to center the selected day
  },
  dayWrapper: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  dayContainer: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  dayTop: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBottom: {
    width: '100%',
    height: '10%',
  },
  selectedDayTop: {
    backgroundColor: '#6C63FF',
  },
  selectedDayBottom: {
    backgroundColor: '#fff',
  },
  defaultDayTop: {
    backgroundColor: '#fff',
  },
  defaultDayBottom: {
    backgroundColor: '#6C63FF',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  statusButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginVertical: 20,
  },
  timeContainer: {
    height: 24 * 60, // 24 hours * 60 minutes
    position: 'relative',
    paddingHorizontal: 20,
  },
  timeSlot: {
    height: 60,
    justifyContent: 'center',
  },
  timeText: {
    color: '#888',
  },
  taskWrapper: {
    position: 'absolute',
    marginLeft: 50,
    left: 20,
    right: 20,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskCategory: {
    fontSize: 14,
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#6C63FF',
  },
  taskDeadline: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#FF6C63',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginLeft: 40,
    height: 40,
    alignItems: 'center',
  },
  currentTimeLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#6C63FF',
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
});

export default Calendar;
