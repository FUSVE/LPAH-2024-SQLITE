import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { initDB, insertTask, fetchTasks, deleteTask, updateTask } from './Database';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    initDB();
    loadTasks();
  }, []);

  const loadTasks = () => {
    fetchTasks((success, data) => {
      if (success) setTasks(data);
    });
  };

  const handleDelete = (id) => {
    deleteTask(id, (success, data) => {
      if (success) loadTasks();
    });
  };

  const handleEdit = (id, title) => {
    setTask(title);
    setEditId(id);
  };

  const handleUpdate = () => {
    if (editId !== null) {
      updateTask(editId, task, false, (success, data) => {
        if (success) {
          setTask('');
          setEditId(null);
          loadTasks();
        }
      });
    }
  };

  const handleSubmit = () => {
    if (editId !== null) {
      handleUpdate();
    } else {
      if (task !== '') {
        insertTask(task, false, (success, data) => {
          if (success) {
            setTask('');
            loadTasks();
          }
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa"
          value={task}
          onChangeText={setTask}
        />
        <Button title={editId ? "Atualizar tarfea" : "Adicionar tarefa"} onPress={handleSubmit} />
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.title}</Text>
              <View style={styles.buttons}>
                <Button title="Editar" onPress={() => handleEdit(item.id, item.title)} />
                <Button title="Deletar" onPress={() => handleDelete(item.id)} />
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '90%',
  },
  input: {
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    marginTop: 5,
    backgroundColor: 'lightgray',
    width: '90%',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
