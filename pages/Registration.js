import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Registration({ navigation }) {
  const [login, setLogin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState({
    login: false,
    firstName: false,
    lastName: false,
    email: false,
    password: false
  });

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const register = (login, password, firstName, email) => {

    if(login == "" || password == "" || firstName == "" || email == ""){
      alert("Не все поля заполнены!");
      return;
    }

    fetch("http://192.168.1.75:8080/api/v1/user/create", {
      method: "POST",
      headers: {
        "Accept": 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://192.168.1.75:8080',
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
      },
      body: JSON.stringify({
        "login": login,
        "password": password,
        "firstName": firstName,
        "email": email,
        "secondName": "prompt",
      })
    }).then(response => {
      if(response.status == 400){
        alert("Такой email уже зарегестрирован!");
        return;
      } else if(response.status == 204){
        alert("Неверный формат email!");
        return;
      } else if (response.status == 200){
        alert("Вы успешно зарегестрировались!");
        navigation.replace('Login');
      }
      response.json()
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <View style={styles.inputContainer}>
        <Icon
          name="user"
          size={20}
          color={isFocused.login ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isFocused.login && styles.inputFocused]}
          value={login}
          onChangeText={setLogin}
          placeholder="Логин"
          placeholderTextColor={isFocused.login ? '#007AFF' : '#A5A8B2'}
          onFocus={() => handleFocus('login')}
          onBlur={() => handleBlur('login')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="user"
          size={20}
          color={isFocused.firstName ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isFocused.firstName && styles.inputFocused]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Имя"
          placeholderTextColor={isFocused.firstName ? '#007AFF' : '#A5A8B2'}
          onFocus={() => handleFocus('firstName')}
          onBlur={() => handleBlur('firstName')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="user"
          size={20}
          color={isFocused.lastName ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isFocused.lastName && styles.inputFocused]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Фамилия"
          placeholderTextColor={isFocused.lastName ? '#007AFF' : '#A5A8B2'}
          onFocus={() => handleFocus('lastName')}
          onBlur={() => handleBlur('lastName')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="envelope"
          size={20}
          color={isFocused.email ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isFocused.email && styles.inputFocused]}
          value={email}
          onChangeText={setEmail}
          placeholder="Электронная почта"
          placeholderTextColor={isFocused.email ? '#007AFF' : '#A5A8B2'}
          onFocus={() => handleFocus('email')}
          onBlur={() => handleBlur('email')}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="lock"
          size={20}
          color={isFocused.password ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isFocused.password && styles.inputFocused]}
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          placeholderTextColor={isFocused.password ? '#007AFF' : '#A5A8B2'}
          secureTextEntry
          onFocus={() => handleFocus('password')}
          onBlur={() => handleBlur('password')}
        />
      </View>
      <TouchableOpacity onPress={() => register(firstName, password, lastName, email)} style={styles.button}>
        <Text style={styles.buttonText}>Создать аккаунт</Text>
      </TouchableOpacity>
      <Text style={styles.bottomTitle}>
        Уже имеете аккаунт?
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.bottomTitleLink}> Войти</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#06112D",
    marginBottom: 45
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    margin: 12,
    borderWidth: 1,
    borderColor: "#F5F6FB",
    backgroundColor: "#F5F6FB",
    borderRadius: 10,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    height: 40,
    flex: 1,
    padding: 10,
    color: "#A5A8B2",
  },
  inputFocused: {
    color: '#007AFF',
  },
  button: {
    height: 51,
    borderRadius: 20,
    width: "80%",
    backgroundColor: "#6146C6",
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 50
  },
  buttonText: {
    fontSize: 18,
    alignSelf: "center",
    color: "#FFFFFF",
    textTransform: "uppercase"
  },
  bottomTitle: {
    color: "#000000",
    fontSize: 14
  },
  bottomTitleLink: {
    color: "#6146C6",
    fontSize: 14
  }
});
