import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal, Button } from 'react-native';
import { GlobalContext } from '../GlobalContext';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import 'moment/locale/ru';

const statusMapping = {
  1: 'Не начато',
  2: 'В процессе',
  3: 'Завершено'
};

const reverseStatusMapping = {
  'Не начато': 1,
  'В процессе': 2,
  'Завершено': 3
};

export default function EditProject({ navigation, route }) {
  const { id } = route.params;
  const { globalVariable } = useContext(GlobalContext);

  const [project, setProject] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [dateField, setDateField] = useState('');
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isStatusPickerVisible, setIsStatusPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff'); // Default color

  useEffect(() => {
    fetch(`http://192.168.1.75:8080/api/v1/project/get-project?projectId=${id}`, {
      method: "GET",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(json => {
        console.log('Fetched project:', json.body);
        setProject(json.body);
        setSelectedColor(json.body.tagColor || '#ffffff'); // Initialize selectedColor with project tagColor
      })
      .catch(error => console.error('Error fetching project:', error));
  }, [id]);

  const handleInputChange = (field, value) => {
    setProject(prevProject => ({ ...prevProject, [field]: value }));
  };

  const handleSave = () => {
    if (project) {
      fetch(`http://192.168.1.75:8080/api/v1/project/update-project`, {
        method: "PUT",
        headers: {
          "Accept": 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(json => {
          console.log('Project saved:', json);
          navigation.navigate('Folders');
        })
        .catch(error => console.error('Error saving project:', error));
    }
  };

  const showDatePicker = (field) => {
    setDateField(field);
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setIsDatePickerVisible(false);
    if (selectedDate) {
      handleInputChange(dateField, moment(selectedDate).format('DD.MM.YYYY HH'));
    }
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleColorChange = (color) => {
    handleInputChange('tagColor', color);
    setSelectedColor(color);
    setIsColorPickerVisible(false);
  };

  const toggleStatusPicker = () => {
    setIsStatusPickerVisible(!isStatusPickerVisible);
  };

  const handleStatusChange = (status) => {
    handleInputChange('status', status);
    setIsStatusPickerVisible(false);
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ marginHorizontal: 20 }}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Название проекта</Text>
            <TextInput
              style={styles.input}
              value={project.name || ''}
              onChangeText={text => handleInputChange('name', text)}
              placeholder='Введите название проекта'
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Тег</Text>
            <TextInput
              style={styles.input}
              value={project.tag || ''}
              onChangeText={text => handleInputChange('tag', text)}
              placeholder='Введите тег'
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Цвет тега</Text>
            <TouchableOpacity onPress={toggleColorPicker}>
              <View style={[styles.colorDisplay, { backgroundColor: selectedColor }]} />
            </TouchableOpacity>
            <Modal visible={isColorPickerVisible} transparent={true} animationType="slide">
              <View style={styles.colorPickerModal}>
                <Slider
                  style={styles.colorSlider}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#6C63FF"
                  maximumTrackTintColor="#000000"
                  onValueChange={(value) => {
                    const newColor = `hsl(${value * 360}, 100%, 50%)`;
                    setSelectedColor(newColor);
                  }}
                />
                <Button title="Выбрать" onPress={() => handleColorChange(selectedColor)} />
              </View>
            </Modal>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={styles.input}
              value={project.description || ''}
              onChangeText={text => handleInputChange('description', text)}
              placeholder='Введите описание'
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Статус</Text>
            <TouchableOpacity onPress={toggleStatusPicker}>
              <View style={styles.input}>
                <Text>{statusMapping[project.status] || 'Выберите статус'}</Text>
              </View>
            </TouchableOpacity>
            <Modal visible={isStatusPickerVisible} transparent={true} animationType="slide">
              <View style={styles.statusPickerModal}>
                <Picker
                  selectedValue={project.status}
                  onValueChange={(itemValue) => handleStatusChange(itemValue)}
                >
                  {Object.entries(statusMapping).map(([value, label]) => (
                    <Picker.Item key={value} label={label} value={Number(value)} />
                  ))}
                </Picker>
                <Button title="Закрыть" onPress={toggleStatusPicker} />
              </View>
            </Modal>
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </ScrollView>
      {isDatePickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorDisplay: {
    width: 50,
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorPickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  statusPickerModal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorSlider: {
    width: 300,
    height: 40,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
