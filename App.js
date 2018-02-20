import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Button,
  TouchableHighlight,
  AsyncStorage,
} from 'react-native';
import uuidv4 from 'uuid/v4';

class Api {
  constructor() {
    this.baseUri = 'https://vast-hollows-93504.herokuapp.com';
    this.user = undefined;
  }

  async getUser() {
    if (this.user) return this.user;

    const key = "@RateMyPic:User";
    let value = await AsyncStorage.getItem(key);
    if (value === null || value === undefined) {
      value = uuidv4();
    }
    await AsyncStorage.setItem(key, value);
    this.user = value;

    return this.user;
  }

  async getFeed() {
    let response = await fetch(
      this.baseUri + '/feed',
    );
    let responseJson = await response.json();
    return responseJson.posts;
  }

  async getUserFeed() {
    let user = await this.getUser();
  }

  async submitPicture() {
    let user = await this.getUser();
  }
}


type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.items = [
      {key: '1', title: 'Channy', uri: 'https://i.imgur.com/kW235lC.jpg'},
      {key: '2', title: 'Betty', uri: 'https://i.pinimg.com/564x/64/ed/fb/64edfb55564fdba7ef12d7b6343e6b22.jpg'},
      {key: '3', title: 'Elizabeth', uri: 'https://i.pinimg.com/564x/c4/1f/10/c41f10a9e852c1bc8a48f2096ddc3502.jpg'}
    ];
  }

  async testApi() {
    let api = new Api();
    alert(JSON.stringify(await api.getUser()));
  }

  onPressLike() {
    Alert.alert('You think it is a good pic, liked!', '');
    this.testApi();
  }

  onPressDislike() {
    Alert.alert('dislike', '');
  }

  _renderItem({item}) {
    let {width, height} = Dimensions.get('window');

    return (
      <View
        style={{flex: 1, width: width, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: '600', fontFamily: 'Courier New' }}>{item.title}</Text>
        <Image
          style={{width: width - 80, height: 400, marginBottom: 20}}
          source={{uri: item.uri}}
        />
        <View
          style={{
            width: width,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: -50,
            marginBottom: 10}}>
          <TouchableHighlight
            onPress={this.onPressDislike.bind(this)}
            activeOpacity={0.6}
            underlayColor={'transparent'}
            style={{marginLeft: 20}}>
            <Image
              source={require('./img/broken-heart.png')}
              style={{width: 80, height: 80}}
            />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this.onPressLike.bind(this)}
            activeOpacity={0.6}
            underlayColor={'transparent'}
            style={{marginRight: 20}}>
            <Image
              source={require('./img/like.png')}
              style={{width: 100, height: 100}}
            />
          </TouchableHighlight>
        </View>
    </View>);
  }

  render() {
    _keyExtractor = (item, index) => item.key;

    return (
      <View style={styles.container}>
        <Image
          source={require('./img/logo.png')}
          style={{width: 220,height: 90, marginTop:10, marginBottom:10}}
           />
        <FlatList
          data={this.state.items}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem.bind(this)}
        />
        <View style={styles.containerRow}>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          style={{marginLeft: 10, marginBottom:20, marginTop:20}}>
          <Image
            source={require('./img/camera.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          style={{marginLeft: 10, marginBottom:20, marginTop:20}}>
          <Image
            source={require('./img/add-outline.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          style={{marginLeft: 10, marginBottom:20, marginTop:20}}>
          <Image
            source={require('./img/user-solid-square.png')}
            style={{width: 36, height: 36}}
          />
        </TouchableHighlight>
        </View>
              </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginTop: 40,
  },
  containerRow: {
    flexDirection: 'row',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
