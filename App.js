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
  TouchableOpacity,
} from 'react-native';
import uuidv4 from 'uuid/v4';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs';
import CameraRollPicker from 'react-native-camera-roll-picker';

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

    let response = await fetch(
      this.baseUri + '/userFeed?user=' + user,
    );
    let responseJson = await response.json();
    return responseJson.posts;
  }

  async submitPicture(title, image) {
    let user = await this.getUser();
    let response = await fetch(this.baseUri + '/picture', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: user,
        title: title,
        image: image,
      }),
    });
    let responseJson = await response.json();
  }

  async ratePicture(user, title, image, isLike) {
    let response = await fetch(this.baseUri + '/rate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: user,
        title: title,
        image: image,
        isLike: isLike ? "true" : "false",
      }),
    });
    let responseJson = await response.json();
  }
}


type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.items = [];
    this.api = new Api();
    this.loadFeed();
  }

  async loadFeed(opt = {user: false}) {
    let feed = opt.user ? await this.api.getUserFeed() : await this.api.getFeed();
    // alert(JSON.stringify(feed));
    let key = 0;
    feed = feed.map(p => {
      key += 1;
      p.key = key.toString();
      return p;
    });

    this.setState({items: feed});
  }

  async onPressLike(item) {
    // Alert.alert('You think it is a good pic, liked!', '');
    await this.api.ratePicture(item.user, item.title, item.image, true);
    this.loadFeed();
  }

  async onPressDislike(item) {
    // Alert.alert('dislike', '');
    await this.api.ratePicture(item.user, item.title, item.image, false);
    this.loadFeed();
  }

  _renderItem({item}) {
    let {width, height} = Dimensions.get('window');
    return (
      <View
        style={{flex: 1, width: width, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: '600', fontFamily: 'Courier New' }}>{item.title}</Text>
        <Image
          style={{width: width - 80, height: 400, marginBottom: 20}}
          source={{uri: item.image}}
        />
        <Text style={{fontSize: 20, fontWeight: '600', fontFamily: 'Courier New' }}>{item.dislikes || 0} | {item.likes || 0}</Text>
        <View
          style={{
            width: width,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: -50,
            marginBottom: 10}}>
          <TouchableHighlight
            onPress={this.onPressDislike.bind(this, item)}
            activeOpacity={0.6}
            underlayColor={'transparent'}
            style={{marginLeft: 20}}>
            <Image
              source={require('./img/broken-heart.png')}
              style={{width: 80, height: 80}}
            />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this.onPressLike.bind(this, item)}
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

  async uploadtoImgur(base64) {
    let response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Client-ID 1f2a899264e5316'
      },
      body: JSON.stringify({
        image: base64,
      }),
    });
    let responseJson = await response.json();
    return responseJson.data.link;
  }

  async takePicture() {
    this.setState({showCamera: false});
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      const base64image = await RNFS.readFile(data.uri, 'base64');
      let link = await this.uploadtoImgur(base64image);
      await this.api.submitPicture('Chaanny', link);
      this.loadFeed();
    }
  }

  async exitPicture() {
    this.setState({showCamera: false});
  }

  async getSelectedImages(images, current) {
    this.setState({showCameraPicker: false});
    let temp = RNFS.DocumentDirectoryPath + '/rate-my-pic-img';
    await RNFS.writeFile(temp, '');
    await RNFS.copyAssetsFileIOS(current.uri, temp, 0, 0);
    const base64image = await RNFS.readFile(temp, 'base64');
    let link = await this.uploadtoImgur(base64image);
    await this.api.submitPicture('Chaanny', link);
    this.loadFeed();
  }

  renderCameraPicker() {
    let {width, height} = Dimensions.get('window');

    return (
      <View style={{width: width, height: height - 90}}>
        <CameraRollPicker
          maximum={1}
          selectSingleItem={true}
          callback={this.getSelectedImages.bind(this)} />
      </View>
    );
  }

  renderCamera() {
    let {width, height} = Dimensions.get('window');
    return (
      <View style={{width: width, height: height - 90, backgroundColor: 'black'}}>
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
        />
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
          <TouchableOpacity
              onPress={this.takePicture.bind(this)}
              style = {styles.capture}
          >
            <Text style={{fontSize: 14}}> SNAP </Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={this.exitPicture.bind(this)}
              style = {styles.capture}
          >
            <Text style={{fontSize: 14}}> EXIT </Text>
          </TouchableOpacity>
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
        {this.state.showCamera ? this.renderCamera() : undefined}
        {this.state.showCameraPicker ? this.renderCameraPicker() : undefined}
        <FlatList
          data={this.state.items}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem.bind(this)}
        />
        <View style={styles.containerRow}>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          onPress={() => this.setState({showCamera: true})}
          style={{marginLeft: 10, marginBottom:20, marginTop:20}}>

          <Image
            source={require('./img/camera.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          onPress={() => this.setState({showCameraPicker: true})}
          style={{marginLeft: 10, marginBottom:20, marginTop:20}}>
          <Image
            source={require('./img/add-outline.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor={'transparent'}
          onPress={() => this.loadFeed({user: true})}
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
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  }
});
