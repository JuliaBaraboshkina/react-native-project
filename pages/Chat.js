import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Chat({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    // Add user's message to the chat
    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
    };
    setMessages([...messages, userMessage]);
    setCurrentMessage('');

    setIsLoading(true);

    // Simulate a server request
    try {
      const response = await fetch(`http://192.168.1.75:8080/api/v1/ai/request?prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If JSON parsing fails, assume the response is plain text
        data = { reply: responseText };
      }

      const serverMessage = {
        id: Date.now().toString(),
        text: data.reply,
        sender: 'server',
      };

      setMessages((prevMessages) => [...prevMessages, serverMessage]);
    } catch (error) {
      console.error('Error fetching server response:', error);
      setMessages((prevMessages) => [...prevMessages, {
        id: Date.now().toString(),
        text: 'Error: ' + error.message,
        sender: 'server',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.serverMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Чат с умным помощником</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напишите сообщение"
            value={currentMessage}
            onChangeText={setCurrentMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={isLoading}>
            <IoniconsIcon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}  onPress={() => navigation.replace('Main')}>
            <FontAwesomeIcon name="home" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Folders')}>
            <MaterialIcons name="folder" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusButtonWrapper} onPress={toggleModal}>
            <View style={styles.plusButton}>
              <FontAwesomeIcon name="plus" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('StatisticsScreen')}>
            <FontAwesomeIcon name="pie-chart" size={24} color="#A5A8B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <MaterialCommunityIcons name="chat" size={24} color="#6C63FF" />
          </TouchableOpacity>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  serverMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    marginBottom: "20%",
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
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
