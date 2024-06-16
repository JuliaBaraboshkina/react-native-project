import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Image, Modal, Button, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { GlobalContext } from '../GlobalContext';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';

export default function AddProject({ navigation }) {
  const [folderName, setFolderName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isTeamProject, setIsTeamProject] = useState(false);
  const [color, setColor] = useState('#6C63FF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [priority, setPriority] = useState(1);
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { globalVariable, setGlobalVariable } = useContext(GlobalContext);

  const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: i }));

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

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setShowColorPicker(false);
  };

  const handleCreateProject = async () => {
    const formattedStartDate = moment(startDate).format('DD.MM.YYYY HH');
    const formattedEndDate = moment(endDate).format('DD.MM.YYYY HH');

    const projectData = {
      ownerId: globalVariable,
      name: projectName,
      tag: folderName,
      tagColor: color,
      description: projectDescription,
      priority: priority,
      deadline: formattedEndDate,
      status: '1',
      createdAt: moment(),
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      members: members
    };

    try {
      const response = await fetch('http://192.168.1.75:8080/api/v1/project/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        Alert.alert('Проект создан!', 'Ваш проект успешно создан.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать проект. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании проекта.');
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/user/exists?email=${email}`);
      const userId = await response.json();

      if (userId) {
        setMembers([...members, { id: userId, email, avatar: '../assets/favicon.png' }]);
        setEmail('');
        setShowEmailInput(false);
      } else {
        Alert.alert('Ошибка', 'Пользователь не найден.');
        setShowEmailInput(false);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при добавлении участника.');
      setShowEmailInput(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Отмена</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Новый проект</Text>

          <Text style={styles.label}>Название папки</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите название папки"
            value={folderName}
            onChangeText={setFolderName}
          />

          <Text style={styles.label}>Имя проекта</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имя проекта"
            value={projectName}
            onChangeText={setProjectName}
          />

          <Text style={styles.label}>Описание проекта</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Введите описание проекта"
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
          />

          <View style={styles.dateContainer}>
            <View style={styles.datePicker}>
              <Text style={styles.label}>Дата начала</Text>
              <View style={{flexDirection: 'row'}}>
                <IoniconsIcon name="calendar" size={24} color="#6C63FF" />
                <DateTimePicker
                  value={startDate}
                  style={{width: 100}}
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
              <View style={{flexDirection: 'row'}}>
                <IoniconsIcon name="calendar" size={24} color="#6C63FF" />
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

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Командный проект</Text>
            <Switch
              value={isTeamProject}
              onValueChange={setIsTeamProject}
              trackColor={{ false: "#767577", true: "#6C63FF" }}
              thumbColor={isTeamProject ? "#fff" : "#f4f3f4"}
            />
          </View>

          {isTeamProject && (
            <>
              <Text style={styles.label}>Участники</Text>
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
                    style={styles.input}
                    placeholder="Введите email участника"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TouchableOpacity style={styles.addAssigneeButton} onPress={handleAddMember}>
                    <IoniconsIcon name="checkmark" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addAssigneeButton} onPress={() => setShowEmailInput(true)}>
                  <IoniconsIcon name="add" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.label}>Цвет</Text>
          <TouchableOpacity style={[styles.colorPicker, { backgroundColor: color }]} onPress={() => setShowColorPicker(true)}>
            <IoniconsIcon name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>

          <Modal visible={showColorPicker} transparent={true} animationType="slide">
            <View style={styles.colorPickerModal}>
              <Slider
                style={styles.colorSlider}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#6C63FF"
                maximumTrackTintColor="#000000"
                onValueChange={(value) => {
                  const newColor = `hsl(${value * 360}, 100%, 50%)`;
                  setColor(newColor);
                }}
              />
              <Button title="Выбрать" onPress={() => setShowColorPicker(false)} />
            </View>
          </Modal>

          <TouchableOpacity style={styles.createProjectButton} onPress={handleCreateProject}>
            <Text style={styles.createProjectButtonText}>Создать проект</Text>
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
    paddingRight: 30, // to ensure the text is never behind the icon
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
    paddingRight: 30, // to ensure the text is never behind the icon
    marginTop: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  cancel: {
    fontSize: 16,
    color: '#6C63FF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    flexDirection: 'row',
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
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  datePicker: {
    width: '48%',
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assigneeContainer: {
    marginBottom: 10,
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
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPicker: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorPickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  colorSlider: {
    width: 300,
    height: 40,
  },
  createProjectButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  createProjectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
