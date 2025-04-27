import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function App() {
  const [db, setDb] = useState(null);
  const [tarefa, setTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    (async () => {
      const database = await SQLite.openDatabaseAsync('tarefasAsync.db');
      setDb(database);

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL);
      `);

      await carregarTarefas(database);
    })();
  }, []);

  const carregarTarefas = async (database) => {
    try {
      const allRows = await database.getAllAsync('SELECT * FROM tarefas');
      setTarefas(allRows);
    } catch (error) {
      console.log('Erro ao carregar tarefas:', error);
    }
  };

  const adicionarTarefa = async () => {
    if (!tarefa.trim()) return;

    try {
      await db.runAsync('INSERT INTO tarefas (titulo) VALUES (?)', tarefa);
      setTarefa('');
      await carregarTarefas(db);
    } catch (error) {
      console.log('Erro ao adicionar tarefa:', error);
    }
  };

  const editarTarefa = (item) => {
    Alert.prompt(
      'Editar Tarefa',
      'Altere o texto da tarefa:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: async (novoTexto) => {
            if (novoTexto && novoTexto.trim()) {
              await db.runAsync('UPDATE tarefas SET titulo = ? WHERE id = ?', novoTexto, item.id);
              await carregarTarefas(db);
            }
          },
        },
      ],
      'plain-text',
      item.titulo
    );
  };

  const deletarTarefa = async (id) => {
    try {
      await db.runAsync('DELETE FROM tarefas WHERE id = ?', id);
      await carregarTarefas(db);
    } catch (error) {
      console.log('Erro ao deletar tarefa:', error);
    }
  };

  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deletarTarefa(item.id)}>
          <Text style={styles.deleteText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity style={styles.item} onPress={() => editarTarefa(item)}>
          <Text>{item.titulo}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (!db) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text>Carregando banco de dados...</Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.titulo}>App SQLite</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite uma tarefa"
        value={tarefa}
        onChangeText={setTarefa}
      />
      <Button title="Adicionar" onPress={adicionarTarefa} />
      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.lista}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  lista: {
    marginTop: 20,
  },
  item: {
    backgroundColor: '#eee',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
