import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import { GlobalContext } from '../GlobalContext';

const screenWidth = Dimensions.get('window').width;

export default function AddTask({ navigation }) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [priority, setPriority] = useState('Высокий');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { globalVariable } = useContext(GlobalContext);

  const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: i }));

  useEffect(() => {
    fetch(`http://192.168.1.75:8080/api/v1/project/get-user-projects?ownerId=${globalVariable}`, {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:8080',
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      }
    }).then(response => response.json())
      .then(json => {
        setFolders(json);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const onChangeStart = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(false);
    setEndDate(currentDate);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectFolder = (folder) => {
    setSelectedFolder(folder);
    setShowDropdown(false);
  };

  const handleAddMember = async () => {
    try {
      if (!email) {
        Alert.alert('Ошибка', 'Введите email участника.');
        return;
      }
      const response = await fetch(`http://192.168.1.75:8080/api/v1/user/exists?email=${email}`);
      if (response.ok) {
        const userId = await response.text();
        if (userId) {
          setMembers([...members, { id: userId, email, avatar: '../assets/favicon.png' }]);
          setEmail('');
          setShowEmailInput(false);
        } else {
          Alert.alert('Ошибка', 'Пользователь не найден.');
          setShowEmailInput(false);
        }
      } else {
        Alert.alert('Ошибка', 'Произошла ошибка при проверке пользователя.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при добавлении участника.');
    }
  };

  const mapPriorityToNumber = (priority) => {
    switch (priority) {
      case 'Высокий':
        return 3;
      case 'Средний':
        return 2;
      case 'Низкий':
        return 1;
      default:
        return 1;
    }
  };

  const createTask = async () => {
    if (!taskName || !taskDescription || !startDate || !endDate || !selectedFolder || !priority) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля.');
      return;
    }

    const priorityNumber = mapPriorityToNumber(priority);

    try {
      const response = await fetch('http://192.168.1.75:8080/api/v1/task/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: taskName,
          ownerId: globalVariable,
          description: taskDescription,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          priority: priorityNumber,
          projectId: selectedFolder.id,
          assignee: members.map(member => member.id),
        })
      });

      if (response.ok) {
        Alert.alert('Задача создана!', 'Ваша задача успешно создана.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать задачу. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании задачи.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Отмена</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Новая задача</Text>
          
          <Text style={styles.label}>Папка проекта</Text>
          <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
            <Text style={styles.dropdownText}>{selectedFolder ? selectedFolder.name : "Выберите папку"}</Text>
            <IoniconsIcon name="chevron-down" size={24} color="#6C63FF" />
          </TouchableOpacity>
          
          <Modal
            transparent={true}
            visible={showDropdown}
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {folders.map(folder => (
                    <TouchableOpacity key={folder.id} style={styles.dropdownItem} onPress={() => selectFolder(folder)}>
                      <Text>{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          <Text style={styles.label}>Имя задачи</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имя задачи"
            value={taskName}
            onChangeText={setTaskName}
          />
          
          <Text style={styles.label}>Описание задачи</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Введите описание задачи"
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline
          />
          
          <View style={styles.dateContainer}>
            <View style={styles.datePicker}>
              <Text style={styles.label}>Дата начала</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                  <IoniconsIcon name="calendar" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onChangeStart}
                />
              </View>
              <RNPickerSelect
                onValueChange={(value) => setStartDate(new Date(startDate.setHours(value, 0)))}
                items={hours}
                placeholder={{ label: "Выберите час", value: null }}
                value={startDate.getHours()}
                style={pickerSelectStyles}
              />
            </View>
            <View style={styles.datePicker}>
              <Text style={styles.label}>Дедлайн</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                  <IoniconsIcon name="calendar" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onChangeEnd}
                />
              </View>
              <RNPickerSelect
                onValueChange={(value) => setEndDate(new Date(endDate.setHours(value, 0)))}
                items={hours}
                placeholder={{ label: "Выберите час", value: null }}
                value={endDate.getHours()}
                style={pickerSelectStyles}
              />
            </View>
          </View>

          <Text style={styles.label}>Приоритет задачи</Text>
          <View style={styles.priorityContainer}>
            {['Высокий', 'Средний', 'Низкий'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityButton, priority === p && styles.selectedPriorityButton]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityButtonText, priority === p && styles.selectedPriorityButtonText]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Исполнители</Text>
          <View style={styles.assigneeContainer}>
            {members.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <Image source={require('../assets/favicon.png')} style={styles.avatar} />
                <Text>{member.email}</Text>
              </View>
            ))}
          </View>
          {showEmailInput ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Введите email участника"
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.addAssigneeButton} onPress={handleAddMember}>
                  <IoniconsIcon name="checkmark" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addAssigneeButton} onPress={() => setShowEmailInput(true)}>
              <IoniconsIcon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.createTaskButton} onPress={createTask}>
            <Text style={styles.createTaskButtonText}>Создать задачу</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginTop: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginTop: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: screenWidth - 40, // full width adjustment
  },
  cancel: {
    fontSize: 16,
    color: '#6C63FF',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  addButtonContainer: {
    marginLeft: 10,
  },
  textArea: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlignVertical: 'top',
    width: '100%',
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f4f4f4',
  },
  dropdownText: {
    flex: 1,
    color: '#333',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownList: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    maxHeight: 200, // adjust as needed
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  datePicker: {
    width: '48%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#f4f4f4',
    padding: 5,
    borderRadius: 10,
  },
  priorityButton: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedPriorityButton: {
    backgroundColor: '#6C63FF',
    borderWidth: 1,
    borderColor: '#fff',
  },
  priorityButtonText: {
    color: '#333',
  },
  selectedPriorityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  assigneeContainer: {
    marginBottom: 10,
    width: '100%',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  addAssigneeButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTaskButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  createTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
