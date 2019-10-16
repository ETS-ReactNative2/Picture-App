import React from 'react';
import {
  Container, Content, Text, View,
} from 'native-base';
import {
  Alert, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import _ from 'lodash';
import Button from '../../components/common/buttons/Button';
import FormInput from '../../components/common/form/FormInput';
import Fire, { database } from '../../firebase/config';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  formContainer: {
    paddingRight: 30,
    paddingLeft: 30,
    padding: 15,
    marginTop: 15,

  },
  imageContainer: {
    justifyContent: 'center',
    padding: 10,
  },
});
// eslint-disable-next-line react/prefer-stateless-function

let imagesArray1 = [];
export default class StoryScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
      title: 'Create Story',

    });

    constructor(props) {
      super(props);
      this.mounted = false;
      this.state = {
        title: '',
        description: '',
        images: [],
        uid: '',
        user: {},
        loading: false,
      };
    }

    componentDidMount() {
      this.mounted = true;
      if (this.mounted === true) {
        const user = Fire.auth().currentUser;
        this.setState({
          uid: user.uid,
          user: {
            name: user.displayName,
            photoURL: user.photoURL,
          },
        });
        this.getPermissionAsync();
        this.getCameraPermission();
      }
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    getPermissionAsync = async () => {
      if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    };

    getCameraPermission =async () => {
      if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    };

    pickImage=async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });
      if (!result.cancelled) {
        this.props.navigation.navigate('NewPost', {
          result,
          onGoBack: this.refresh,
        });
      }
    };

    refresh=(data) => {
      imagesArray1 = data;
      this.setState({
        images: imagesArray1,
      });
      // console.log(imagesArray1);
    };

    takePhoto=async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.cancelled) {
        this.props.navigation.navigate('NewPost', { result });
      }
    };

    save=async () => {
      const { uid, user } = this.state;
      const {
        title, description, images,
      } = this.state;
      console.log(user);
      try {
        database.collection('stories').add({
          uid,
          user,
          title,
          description,
          timestamp: Date.now(),
          images,
        });
        Alert.alert('Successful', 'your story has been successfully created');
        this.setState({
          title: '',
          description: '',
          images: [],
          uid: '',
          user: {},
        });
        this.props.navigation.navigate('Account');
      } catch (e) {
        console.log(e);
        Alert.alert('An Error Occurred', e);
      }
    };


    render() {
      const {
        title, description, images,
      } = this.state;
      console.log(images);

      return (
        <Container>
          <Content>
            <View style={styles.formContainer}>
              <FormInput
                floating
                floatingLabel
                label="Title"
                value={title}
                onChangeText={title => this.setState({ title })}
              />
              <Text>
                {' '}
                {' '}
              </Text>
              <FormInput
                floating
                floatingLabel
                label="Story description"
                multiline
                value={description}
                onChangeText={description => this.setState({ description })}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity a onPress={this.pickImage}><Text style={{ fontWeight: '200', fontSize: 15, color: '#008ae6' }}>Select photo</Text></TouchableOpacity>
              <Text>
                {' '}
                {' '}
              </Text>
              <TouchableOpacity onPress={this.takePhoto}><Text style={{ fontWeight: '200', fontSize: 15, color: '#008ae6' }}>Take photo</Text></TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
              { !_.isEmpty(images)

                ? (
                  <FlatList
                    data={images}
                    renderItem={({ item }) => (
                      <View style={{ marginLeft: 10 }}>
                        <Text>{item.caption}</Text>
                        <Image
                          source={{ uri: item.image.image }}
                          style={{
                            alignSelf: 'center', width: width / 2, height: width / 2, borderRadius: 5,
                          }}
                        />
                        <Text style={{ fontWeight: '200' }}>{item.image.caption}</Text>


                      </View>
                    )}
                    keyExtractor={item => item.image.image}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    horizontal={false}
                  />
                )
                : (
                  <View style={{ alignContent: 'center', justifyContent: 'center' }}>

                    <Text note style={{ textAlign: 'center' }}>
                 No image uploaded yet
                    </Text>
                  </View>

                )}
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Button account onPress={this.save}>Save</Button>
            </View>
          </Content>
        </Container>
      );
    }
}
