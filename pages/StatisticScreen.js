import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from 'react-native-vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalContext } from '../GlobalContext';
import Modal from 'react-native-modal';
import { LineChart, PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const { globalVariable } = useContext(GlobalContext);

  const fetchStatistics = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
      const response = await fetch(`http://192.168.1.75:8080/api/v1/statistic/get-statistic?date=${formattedDate}&userId=${globalVariable}`);
      const data = await response.json();
      console.log(data);
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchStatistics(selectedDate);
  }, [selectedDate]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const pieData = statistics ? [
    {
      name: 'Личные',
      population: statistics.soloProjects,
      color: '#6A67FC',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: 'Командные',
      population: statistics.teamProjects,
      color: '#FFC075',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.dateSelector} onPress={() => navigation.replace('Calendar')}>
            <Ionicons name="calendar" size={24} color="#6C63FF" />
            <Text style={styles.dateText}>{new Date().toISOString().split('T')[0]}</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Статистика по проектам</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.userActivityTitle}>Активность пользователя</Text>          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          </View>
          {statistics && (
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{statistics.taskCompleted}</Text>
                  <Text style={styles.statLabel}>Задач выполнено</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{statistics.taskCreated}</Text>
                  <Text style={styles.statLabel}>Задач создано</Text>
                </View>
              </View>
              <Text style={styles.periodLabel}>Создано за весь период:</Text>
              <View style={styles.row}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{statistics.projectCreatedAllTime}</Text>
                  <Text style={styles.statLabel}>Проектов</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{statistics.taskCreatedAllTime}</Text>
                  <Text style={styles.statLabel}>Задач</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Активность по выполнению задач</Text>
          {statistics && (
            <LineChart
              data={{
                labels: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
                datasets: [
                  {
                    data: statistics.taskCompletedByDays || [0, 0, 0, 0, 0, 0, 0]
                  }
                ]
              }}
              width={width - 60} // Adjusted width to fit within the card
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(106, 103, 252, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                marginLeft: -20 // Adjusted margin to align the chart properly within the card
              }}
            />
          )}
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Best</Text>
            <Text style={styles.chartFooterNumber}>{statistics ? Math.max(...statistics.taskCompletedByDays) : 0}</Text>
          </View>
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Today</Text>
            <Text style={styles.chartFooterNumber}>{statistics ? statistics.taskCompletedByDays[new Date().getDay()] : 0}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Соотношение количества проектов</Text>
          <View style={styles.pieChartContainer}>
            {statistics && (
              <PieChart
                data={pieData}
                width={width}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
                hasLegend={false}
              />
            )}
          </View>
          <View style={styles.pieChartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6A67FC' }]} />
              <Text style={styles.legendText}>{statistics ? `${statistics.soloProjects} Личные` : '0 Личные'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFC075' }]} />
              <Text style={styles.legendText}>{statistics ? `${statistics.teamProjects} Командные` : '0 Командные'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.tasksActivityTitle}>Количество задач по статусам</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Активные</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Завершённые</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Командные</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Командные</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <FontAwesome name="home" size={24} color="#A5A8B2" onPress={() => navigation.replace('Main')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Folders')}>
          <MaterialIcons name="folder" size={24} color="#A5A8B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButtonWrapper} onPress={toggleModal}>
          <View style={styles.plusButton}>
            <FontAwesome name="plus" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <FontAwesome name="pie-chart" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.replace('Chat')}>
          <MaterialCommunityIcons name="chat" size={24} color="#A5A8B2" />
        </TouchableOpacity>

        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => { toggleModal(); navigation.replace('AddTask'); }}>
              <Text style={styles.modalOption}>Новая задача</Text>
            </TouchableOpacity>
            <View style={styles.modalSeparator} />
            <TouchableOpacity onPress={() => { toggleModal(); navigation.replace('AddProject'); }}>
              <Text style={styles.modalOption}>Новый проект</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    alignItems: 'left',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#6C63FF',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userActivityTitle: {
    width: 120,
    fontSize: 16,
    fontWeight: "bold"
  },
  tasksActivityTitle: {
    width: 200,
    fontSize: 16,
    fontWeight: "bold"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#6C63FF',
  },
  cardContent: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  periodLabel: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginTop: 10,
  },
  chartFooterText: {
    fontSize: 14,
    color: '#555',
  },
  chartFooterNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieChartContainer: {
    marginLeft: width / 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  pieChartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#000',
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
