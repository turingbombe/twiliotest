import React from 'react';
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import TwilioVoice from 'react-native-twilio-programmable-voice';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';


export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props);

    this.state = {
      isConnected: false,
      isSpeakerPhone: false,
    }
  }


  getAccessTokenFromServer = async () => {
    let bodyData = { identity: "charlie" };
    let options = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(bodyData)
    }
    let response = await fetch('https://warm-woodland-89589.herokuapp.com/accessToken', options)
    let text = await response.text();
    console.log('the token', text);
    return text
  }

  // initialize the Programmable Voice SDK passing an access token obtained from the server.
  initTelephony = async () => {
      try {
          const accessToken = await this.getAccessTokenFromServer()
          const success = await TwilioVoice.initWithToken(accessToken)
          console.log('this is success ', success)
      } catch (err) {
          console.err(err)
      }
  }
  initWithUrl = async (url) => {
    try {
      const init = await TwilioVoice.initWithTokenUrl(url)
      console.log('did we do it?')
    } catch (err) {
      console.err(err)
    }

  }
   // iOS Only
  initTelephonyWithUrl(url) {
    try {
      this.initWithUrl(url).then( () => {
          console.log('the next thing')
          TwilioVoice.configureCallKit({
            appName:       'twilio'                  // Required param
          })
      })
    } catch (err) {
          console.err(err)
      }
  }

  deviceReadyHandler = () => console.log("device ready");

  connectionDidConnectHandler = (data) => {
    console.log("did connect", data.call_state);
    this.setState({ isConnected: true });
  }
  connectionDidDisconnectHandler = () => this.setState({ isConnected: false });
  callrejected = () => console.log("call rejected");



  componentDidMount() {
    // add listeners
    TwilioVoice.addEventListener('deviceReady', this.deviceReadyHandler)
    // TwilioVoice.addEventListener('deviceNotReady', deviceNotReadyHandler)  // Android Only
    // TwilioVoice.addEventListener('deviceDidReceiveIncoming', deviceDidReceiveIncomingHandler)  // Android Only
    TwilioVoice.addEventListener('connectionDidConnect', this.connectionDidConnectHandler)
    TwilioVoice.addEventListener('connectionDidDisconnect', this.connectionDidDisconnectHandler)
    TwilioVoice.addEventListener('callRejected',this.callRejected)  // iOS Only
    const url = 'https://warm-woodland-89589.herokuapp.com/accessToken?identity=charlie'
    this.initTelephony();
    this.initTelephonyWithUrl(url);

  }

  render() {

    // TwilioVoice.getActiveCall()
    // .then(incomingCall => {
        // if (incomingCall){
            // _deviceDidReceiveIncoming(incomingCall)
        // }
    // })

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/robot-dev.png')
                  : require('../assets/images/robot-prod.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}

            <Text style={styles.getStartedText}>Get started by opening</Text>

            <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
              <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Change this text and your app will automatically reload.
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._handleHelpPress} style={styles.dialButton}>
              <Text style={styles.buttonText}>Call Me</Text>
            </TouchableOpacity>
          </View>
          {this.callButtons()}
        </ScrollView>


        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
          </View>
        </View>
      </View>
    );
  }

  callButtons() {
    const speaker = !this.state.isSpeakerPhone;
    if(this.state.isConnected == true) {
      return (
        <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this.hangUp} style={styles.hangUpButton}>
              <Text style={styles.buttonText}>HANG UP!</Text>
            </TouchableOpacity>
              <TouchableOpacity onPress={() => this.toggleSpeakerPhone(speaker)} style={styles.hangUpButton}>
              <Text style={styles.buttonText}>Speaker Phone</Text>
            </TouchableOpacity>
        </View>
      )
    }

  }

  hangUp() {
    TwilioVoice.disconnect()
  }

  toggleSpeakerPhone(speaker){
    TwilioVoice.setSpeakerPhone(speaker);
    this.setState({isSpeakerPhone: speaker});
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    TwilioVoice.connect({To: 'frank'})
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  dialButton: {
   borderWidth:1,
   borderColor:'green',
   alignItems:'center',
   justifyContent:'center',
   width:100,
   height:100,
   backgroundColor:'green',
   borderRadius:100,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  hangUpButton: {
   borderWidth:1,
   borderColor:'red',
   alignItems:'center',
   justifyContent:'center',
   width:100,
   height:100,
   backgroundColor:'red',
   borderRadius:100,
  },
});
