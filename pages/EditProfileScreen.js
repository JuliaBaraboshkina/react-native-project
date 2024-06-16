import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { GlobalContext } from '../GlobalContext';

export default function EditProfileScreen({ navigation }) {
  const { globalVariable } = useContext(GlobalContext); // Assuming you have a global context for user ID
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://192.168.1.75:8080/api/v1/user/getUser?userId=${globalVariable}`);
        const userData = await response.json();
        
        setFirstName(userData.firstName || '');
        setLastName(userData.secondName || '');
        setEmail(userData.email || '');
        console.log(userData);
        if (userData.avatarUrl) {
            const base64Image = userData.avatarUrl.replace('data:image/jpeg;base64,', '');
            setImage(base64Image);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [globalVariable]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize the image to a width of 800 pixels
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true } // Compress to 70% quality and convert to base64
      );
      setImage(manipResult.base64);
    }
  };

  const handleSave = async () => {
    const avatarUrl = image ? `data:image/jpeg;base64,${image}` : '../assets/avatar.jpg';

    const userData = {
      id: globalVariable,
      firstName: firstName,
      secondName: lastName,
      email: email,
      password: password,  // Add the password to the user data
      avatarUrl: avatarUrl,
    };

    try {
      const response = await fetch('http://192.168.1.75:8080/api/v1/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        Alert.alert('Успех', 'Профиль успешно обновлен', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить профиль');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при обновлении профиля');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon name="arrow-left" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать профиль</Text>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={styles.profileImage} />
          ) : (
            <Image source={require('../assets/avatar.jpg')} style={styles.profileImage} />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Имя"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Фамилия"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Сохранить</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginLeft: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
