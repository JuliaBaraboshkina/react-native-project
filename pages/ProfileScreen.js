import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/ru';
import { GlobalContext } from '../GlobalContext';

export default function ProfileScreen({ navigation }) {
  const today = moment().locale('ru').format('D, MMMM, YYYY');
  const { globalVariable } = useContext(GlobalContext); // Assuming you have a global context for user ID
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://192.168.1.75:8080/api/v1/user/getUser?userId=${globalVariable}`);
        const userData = await response.json();
        
        setFirstName(userData.firstName || '');
        setLastName(userData.secondName || '');
        setEmail(userData.email || '');
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

  const handleLogout = () => {
    Alert.alert('Подтверждение', 'Вы действительно хотите выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerDate} onPress={() => navigation.replace("Calendar")}>
          <FontAwesomeIcon name="calendar" size={24} color="#6C63FF" />
          <Text style={styles.date}>{today}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace("EditProfileScreen")}>
          <FontAwesomeIcon name="pencil" size={24} color="#6C63FF" style={styles.editIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={image ? { uri: `data:image/jpeg;base64,${image}` } : require('../assets/avatar.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Main')}>
          <FontAwesomeIcon name="home" size={24} color="#A5A8B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Folders')}>
          <FontAwesomeIcon name="folder" size={24} color="#A5A8B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButtonWrapper} onPress={() => navigation.replace('AddTask')}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  headerDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#6C63FF',
    marginLeft: 10,
    marginTop: 2,
  },
  editIcon: {
    marginLeft: 'auto',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: '100%',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
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
});
