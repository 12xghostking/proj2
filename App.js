import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TextInput, Button, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function App() {
  const [text, setText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [additionalData, setAdditionalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pokemonData, setPokemonData] = useState([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    fetchPokemonData();
  }, []);

  const fetchPokemonData = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon');
      setPokemonData(response.data.results);
      setNextPage(response.data.next);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
      setLoading(false);
    }
  };

  const loadMorePokemon = async () => {
    try {
      const response = await axios.get(nextPage);
      setPokemonData([...pokemonData, ...response.data.results]);
      setNextPage(response.data.next);
    } catch (error) {
      console.error('Error loading more Pokemon:', error);
    }
  };

  const filterData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${text.toLowerCase()}`);
      setFilteredData([response.data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      alert('No Pokemon found with that name showing all again');
      setLoading(false);
    }
  };

  const removeFilter = () => {
    setFilteredData([]);
    setText('');
  };

  const fetchAdditionalData = async (pokemonName) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      console.log('Additional data:', response.data);
      setAdditionalData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching additional data:', error);
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    await filterData();
    
    
      await fetchAdditionalData(text.toLowerCase());
    
  };

  const handleListItemPress = async (pokemonName) => {
    setText(pokemonName);
    try {
      setLoading(true);
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      setFilteredData([response.data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setLoading(false);
    }
    await fetchAdditionalData(pokemonName.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pokemon Data</Text>
      <View style={styles.inputContainer}>
        <Image
          style={styles.image}
          source={require('./assets/img1.png')} // Replace this with the path to your image
        />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Search Pokemon"
        />
        <Button disabled={text === ''} title="Filter" onPress={handleFilter} />
        <Button disabled={text === ''} title="Remove Filter" onPress={removeFilter} />
      </View>
      <ScrollView style={styles.listContainer} onScroll={(e) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom && nextPage) {
          loadMorePokemon();
        }
      }}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {filteredData.length > 0 ? (
              <>
                <View style={styles.pokemonContainer}>
                  <Text style={styles.pokemonName}>{filteredData[0].name}</Text>
                  <Image style={styles.pokemonImage} source={{ uri: filteredData[0].sprites.other['official-artwork'].front_default }} />
                </View>
                {additionalData && (
                  <View style={styles.additionalDataContainer}>
                    <Text style={styles.additionalDataTitle}>Additional Data:</Text>
                    <Text style={styles.additionalData}>Height: {additionalData.height}</Text>
                    <Text style={styles.additionalData}>Base Experience: {additionalData.base_experience}</Text>
                    {additionalData.abilities.length > 0 && (
                      <Text style={styles.additionalData}>Ability: {additionalData.abilities[0].ability.name}</Text>
                    )}
                    {additionalData.held_items.length > 0 && (
                      <Text style={styles.additionalData}>Held Item: {additionalData.held_items[0].item.name}</Text>
                    )}
                  </View>
                )}
              </>
            ) : (
              <FlatList
                data={pokemonData}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleListItemPress(item.name)}>
                    <Text style={styles.item}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center', // Center horizontally
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40, // Adjust as needed
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  image: {
    width: 20, // Adjust width as needed
    height: 20, // Adjust height as needed
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '50%', // Adjust width as needed
    padding: 10,
  },
  listContainer: {
    flex: 1,
    alignSelf: 'stretch',
    marginLeft: 20, // Adjust as needed
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    alignSelf: 'flex-start', // Align items to the left
  },
  pokemonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pokemonImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  additionalDataContainer: {
    margin:10,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',                  
  },
  additionalDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  additionalData: {
    fontSize: 16,
  },
});
                                        