import React, { useContext, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Login({ navigation }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { globalVariable, setGlobalVariable } = useContext(GlobalContext);


    const login = async (email, password) => {
      if (email === "" || password === "") {
        alert("Не все поля заполнены!");
        return;
      }
    
      try {
        const response = await fetch(`http://192.168.1.75:8080/api/v1/user/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
          method: "GET",
          headers: {
            "Accept": 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:8080',
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
          }
        });
    
        if (response.status === 400) {
          alert("Неверный логин или пароль!");
          return;
        } else if (!response.ok) {
          alert("Произошла ошибка, попробуйте снова.");
          return;
        }
    
        if (response.status === 200) {
          const json = await response.json();
          console.log("Response:", response);
          console.log("Data:", json);
    
          setGlobalVariable(json);
          navigation.replace('Main');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в аккаунт</Text>
      <View style={styles.inputContainer}>
        <Icon
          name="envelope"
          size={20}
          color={isEmailFocused ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isEmailFocused && styles.inputFocused]}
          value={email}
          onChangeText={setEmail}
          placeholder="Электронная почта"
          placeholderTextColor={isEmailFocused ? '#007AFF' : '#A5A8B2'}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="lock"
          size={20}
          color={isPasswordFocused ? '#007AFF' : '#A5A8B2'}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, isPasswordFocused && styles.inputFocused]}
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          placeholderTextColor={isPasswordFocused ? '#007AFF' : '#A5A8B2'}
          secureTextEntry
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
      </View>
      <TouchableOpacity onPress={() => login(email, password)} style={styles.button}>
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>
      <Text style={styles.bottomTitle}>
        Не имеете аккаунт?
        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.bottomTitleLink}> Зарегистрироваться</Text>
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
    marginBottom: 145,
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
