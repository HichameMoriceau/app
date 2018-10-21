import React, { Component } from 'react';
import { AppRegistry, Image, View, Text, FlatList, TouchableHighlight, StyleSheet } from 'react-native';
import { createStackNavigator, } from 'react-navigation';
import { AsyncStorage } from "react-native"

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  }
});

function extract_tags(meals){
  let tags_dict = {};
  for (var i = 0; i < meals.length; i++) {
    for (var j = 0; j < meals[i].tags.length; j++) {
      tags_dict[meals[i].tags[j]] = 1;
    }
  }

  tags_list = [];
  for (var k in tags_dict) {
    if (tags_dict.hasOwnProperty(k)) {
      let obj = new Object()
      obj.key = k;
      tags_list.push(obj);
    }
  }

  return tags_list;
}

function filter_meals(meals, condition){
  let matches = [];
  for (var i = 0; i < meals.length; i++) {
    if (meals[i]['tags'].includes(condition)) {
      matches.push(meals[i]);
    }
  }

  return matches;
}

function identify_meal(identifier){
  return '@meal_store:'+identifier
}

function persist_meal(identifier, data){
  let full_identifier = identify_meal(identifier);
  console.log("Persisting data for: " + identifier);
  _storeData = async () => {
    try {
      await AsyncStorage.setItem(full_identifier, JSON.stringify(data))
      .then((response) => {
        console.log('Persisting response:');
        console.log(response);
      });
    } catch(error) {
      console.log('Error:');
      console.log(error);
    }
  }
  _storeData();
}

function get_or_create(meals, i){
  _retrieveData = async () => {
    try {
      value = await AsyncStorage.getItem(identify_meal(meals[i].id));

      if (value !== null) {
        console.log('Meal already in local database:');
        console.log(value);
        return meals[i].id;

      } else {
        console.log('Meal not found in db: persisting ' + meals[i].id);
        console.log(meals[i]);
        persist_meal(meals[i].id, meals[i]);
        return null;
      }

     } catch (error) {
       console.log('Error:');
       console.log(error);
     }
  }
}

class Element extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 8, backgroundColor: this.props.item_colour}} >
          <Text style={{fontSize: 30, textAlign: 'center'}} >
            {this.props.text}
          </Text>
        </View>

        <View style={{flex: 0.5, backgroundColor: this.props.bg_colour}} />
      </View>
    );
  }
}


class MealScreen extends Component{
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('title', 'Default title')
    };
  };

  render(){
    const { navigation } = this.props;
    const title = navigation.getParam('title', 'Default title');
    const data = navigation.getParam('data', []);

    return (
      <View>

        <Text>ingredients:</Text>
        <View>
          <FlatList
            data={ data.ingredients }
            renderItem={( {item} ) => (
              <Text>{ item.key }</Text>
            )}
          />
        </View>

        <View>
          <Text>Tags:</Text>
          <Text>{ data.tags }</Text>
        </View>

      </View>
    );
  }
}


class MealsScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('title', 'Default title')
    };
  };

  render(){
    const { navigate } = this.props.navigation;
    const { navigation } = this.props;
    const title = navigation.getParam('title', 'Default title');
    const data = navigation.getParam('data', []);

    let matching_meals = filter_meals(data, title);

    return (
      <View style={{flex: 1}}>

        <FlatList
          data={ matching_meals }
          renderItem={( {item} ) => (
            <TouchableHighlight
              style={ styles.button }
              onPress={() =>
                navigate('Meal', { title: item.key, data: item })
              }>

              <View style={{flex: 0.3 }}>
                <Text>{ item.key }</Text>
              </View>

            </TouchableHighlight>
          )}
        />
      </View>
    );
  }
}

class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Types of meals',
  };

  constructor(props){
    super(props);
    this.meals = [
      {
        id: 'MEALS_DEFAULT_chicken_curry',
        key: 'Chicken curry',
        ingredients: [
          {key: 'chicken'},
          {key: 'curry'}
        ],
        tags: ['Healthy', 'Lazy', 'Tupperware']
      },
      {
        id: 'MEALS_DEFAULT_kale_salad',
        key: 'Kale salad',
        ingredients: [
          {key: 'kale',},
          {key: 'strawberries'}
        ],
        tags: ['Healthy']
      },
      {
        id: 'MEALS_DEFAULT_chicken_and_cheese_sandwich',
        key: 'Chicken & cheese sandwich',
        ingredients: [
          {key: 'Rye bread',},
          {key: 'Chicken'},
          {key: 'Cheddar'},
          {key: 'Mozzarella'},
          {key: 'Cucumber'},
          {key: 'Tomatoes'},
          {key: 'Mayonnaise'}
        ],
        tags: ['Healthy', 'Cheap', 'Tasty']
      }
    ];
  }

  render() {
    const { navigate } = this.props.navigation;

    let title = 'Meal';
    let bg_colour = 'skyblue';
    let title_colour = 'steelblue';
    let item_colour = 'red';

    console.log('Getting all keys:');
    Promise.all(AsyncStorage.getAllKeys().then((keys) => {
      keys.map((k) => {
        AsyncStorage.getItem(k)
      })
    }));

    console.log('Ensuring all default values are stored');
    for (var i = 0; i < this.meals.length; i++) {
      console.log('meal');
      console.log(this.meals[i].id);

      get_or_create(this.meals, i);
      console.log('RETRIEVED:');
      result = _retrieveData();
      console.log(result);

    }

    tags_list = extract_tags(this.meals)

    return (
      <View style={{flex: 1}}>

        <FlatList
          data={ tags_list }
          renderItem={( {item} ) => (

            <TouchableHighlight
              style={ styles.button }
              onPress={() =>
                navigate('Meals', { title: item.key, data: this.meals })
              }>

              <View style={{flex: 0.3 }}>
                <Text>{ item.key }</Text>
              </View>

            </TouchableHighlight>
          )}
        />
      </View>
    );
  }
}

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  Meals: { screen: MealsScreen },
  Meal: { screen: MealScreen },
});

export default App;
