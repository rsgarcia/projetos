import React, { useEffect, useState } from "react";
import { View, Text, StatusBar, TextInput, Button, FlatList } from "react-native";
import { openDatabase } from 'expo-sqlite'

const db = openDatabase({
  name: "rn_sqlite",
});

const App = () => {
  const [despesa, setDespesa] = useState("");
  const [despesas, setDespesas] = useState([]);
  const [valor, setValor] = useState(0);

  const createTables = () => {
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS despesas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome VARCHAR(20), valor REAL)`,
        [],
        (sqlTxn, res) => {
          console.log("tabela criada com sucesso");
        },
        error => {
          console.log("erro ao criar a tabela " + error.message);
        },
      );
    });
  };

  const addDespesa = () => {
    if (!despesa) {
      alert("Entre com a despesa");
      return false;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO despesas (nome, valor) VALUES (?, ?)`,
        [despesa, valor],
        (sqlTxn, res) => {
          console.log(`${despesa} despesa adicionada com sucesso`);
          getDespesas();
          setDespesa("");
          setValor(0);
        },
        error => {
          console.log("despesa: " + despesa + " valor " + valor);
          console.log("erro na inserção de despesa " + error.message);
        },
      );
    });
  };

  const getDespesas = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM despesas ORDER BY id DESC`,
        [],
        (sqlTxn, res) => {
          console.log("despesas carregadas com sucesso");
          let len = res.rows.length;

          if (len > 0) {
            let results = [];
            for (let i = 0; i < len; i++) {
              let item = res.rows.item(i);
              results.push({ id: item.id, nome: item.nome, valor: item.valor });
            }

            setDespesas(results);
          }
        },
        error => {
          console.log("erro ao buscar as despesas " + error.message);
        },
      );
    });
  };

  const renderDespesa = ({ item }) => {
    return (
      <View style={{
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: "#dad",
        backgroundColor: "#e9e9e9"
      }}>
        <Text style={{marginRight: 9 }}>{item.id}</Text>
        <Text>{item.nome} </Text>
        <Text>- Custo R${item.valor}</Text>
      </View>
    );
  };

  useEffect(async () => {
    await createTables();
    await getDespesas();
  }, []);

  return (
    <View style={{backgroundColor: "#e9e9e9"}}>
      <StatusBar backgroundColor="#222" />
      <Text style={{textAlign:"center", fontWeight: "bold", fontFamily: "Cochin"}}>Sistema de Cadastro de Despesas </Text>
      <TextInput
        placeholder="Descreva a despesa"
        value={despesa}
        onChangeText={setDespesa}
        style={{ marginHorizontal: 8 ,  paddingTop: 15, borderStyle: "solid", borderWidth: 1, marginBottom: 5, padding: 5}}
      />

      <TextInput
        placeholder="Qual o valor da despesa?"
        value={valor}
        onChangeText={setValor}
        style={{ marginHorizontal: 8 ,  paddingTop: 15, borderStyle: "solid", borderWidth: 1, marginBottom: 20, padding: 5}}
      />

      <Button title="Cadastrar Despesa" onPress={addDespesa} />

      <FlatList
        data={despesas}
        renderItem={renderDespesa}
        key={desp => desp.id}
      />
    </View>
  );
};

export default App;