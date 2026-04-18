import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Modal, Pressable} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

export default function App() {
  const [db, setDb] = useState(null);
  const [tarefa, setTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [novoTexto, setNovoTexto] = useState('');

  useEffect(() => {
    const iniciarBanco = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('tarefasAsync.db');
        setDb(database);

        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL
          );
        `);

        await carregarTarefas(database);
      } catch (error) {
        console.log('Erro ao iniciar banco:', error);
      }
    };

    iniciarBanco();
  }, []);

  const carregarTarefas = async (databaseParam) => {
    try {
      const database = databaseParam || db;
      if (!database) return;

      const allRows = await database.getAllAsync(
        'SELECT * FROM tarefas ORDER BY id DESC'
      );
      setTarefas(allRows);
    } catch (error) {
      console.log('Erro ao carregar tarefas:', error);
    }
  };

  const adicionarTarefa = async () => {
    if (!tarefa.trim() || !db) return;

    try {
      await db.runAsync(
        'INSERT INTO tarefas (titulo) VALUES (?)',
        [tarefa.trim()]
      );
      setTarefa('');
      await carregarTarefas();
    } catch (error) {
      console.log('Erro ao adicionar tarefa:', error);
    }
  };

  const abrirEdicao = (item) => {
    setTarefaEditando(item);
    setNovoTexto(item.titulo);
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (!novoTexto.trim() || !tarefaEditando || !db) return;

    try {
      await db.runAsync(
        'UPDATE tarefas SET titulo = ? WHERE id = ?',
        [novoTexto.trim(), tarefaEditando.id]
      );

      setModalVisible(false);
      setNovoTexto('');
      setTarefaEditando(null);

      await carregarTarefas();
    } catch (error) {
      console.log('Erro ao editar tarefa:', error);
    }
  };

  const cancelarEdicao = () => {
    setModalVisible(false);
    setNovoTexto('');
    setTarefaEditando(null);
  };

  const deletarTarefa = async (id) => {
    if (!db) return;

    try {
      await db.runAsync('DELETE FROM tarefas WHERE id = ?', [id]);
      await carregarTarefas();
    } catch (error) {
      console.log('Erro ao deletar tarefa:', error);
    }
  };

  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <View style={styles.actionsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => deletarTarefa(item.id)}
        >
          <Text style={styles.deleteText}>Apagar</Text>
        </Pressable>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Pressable
          style={({ pressed }) => [
            styles.item,
            pressed && styles.itemPressed,
          ]}
          onPress={() => abrirEdicao(item)}
        >
          <Text style={styles.itemText}>{item.titulo}</Text>
        </Pressable>
      </Swipeable>
    );
  };

  if (!db) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.centered}>
          <Text>Carregando banco de dados...</Text>
        </View>
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
        onSubmitEditing={adicionarTarefa}
        returnKeyType="done"
      />

      <Button title="Adicionar" onPress={adicionarTarefa} />

      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.lista}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma tarefa cadastrada.</Text>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelarEdicao}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar tarefa</Text>

              <TextInput
                style={styles.input}
                value={novoTexto}
                onChangeText={setNovoTexto}
                placeholder="Novo texto da tarefa"
                autoFocus
              />

              <View style={styles.modalButtons}>
                <View style={styles.modalButton}>
                  <Button title="Cancelar" onPress={cancelarEdicao} />
                </View>
                <View style={styles.modalButton}>
                  <Button title="Salvar" onPress={salvarEdicao} />
                </View>
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  lista: {
    marginTop: 20,
  },
  item: {
    backgroundColor: '#eee',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemText: {
    fontSize: 16,
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 54,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});