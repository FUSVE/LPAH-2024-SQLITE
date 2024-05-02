import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("ghjkl.db");

const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, complete BOOLEAN NOT NULL);",
      [],
      () => console.log("Tabela criada com sucesso"),
      error => console.log("Erro: " + error.message)
    );
  });
};

const insertTask = (title, complete, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO tasks (title, complete) VALUES (?, ?);",
      [title, complete],
      (_, result) => callback(true, result),
      (_, error) => callback(false, error)
    );
  });
};

const fetchTasks = callback => {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM tasks;",
      [],
      (_, { rows }) => callback(true, rows._array),
      (_, error) => callback(false, error)
    );
  });
};

const deleteTask = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "DELETE FROM tasks WHERE id = ?;",
      [id],
      (_, result) => callback(true, result),
      (_, error) => callback(false, error)
    );
  });
};

const updateTask = (id, title, complete, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      "UPDATE tasks SET title = ?, complete = ? WHERE id = ?;",
      [title, complete, id],
      (_, result) => callback(true, result),
      (_, error) => callback(false, error)
    );
  });
};

export { initDB, insertTask, fetchTasks, deleteTask, updateTask };

