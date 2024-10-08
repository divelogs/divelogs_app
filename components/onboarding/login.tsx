import React, { useState } from 'react';
import {Platform, Text,TextInput, Linking, Pressable,StyleSheet, TouchableOpacity, KeyboardAvoidingView, useColorScheme } from 'react-native';
import { getDBConnection, writeBearerToken } from '../../services/db-service';
import { Api } from '../../services/api-service'
import AppHeader from '../generic/divelogsheader'
import '../../translation'
import { useTranslation } from 'react-i18next';
import divelogsStyle from '../../stylesheets/styles'

const Login = ({navigation}:any) => {

    const { t } = useTranslation(); 

    const [errorMessage, setErrormessage] = useState('')
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAttempt, setPasswordAttempt] = useState(0)

    const translateResult = (input:string) : string => {
        switch (input) {
            case "user not found":
            case "wrong password":
                return t("userpassnotfound")
            default:
                return input
        }
    }

    const change = (func:any, text:string) => {
        setErrormessage('')
        func(text)
    } 

    const doLogin = async () => {

        if (username.length == 0 || password.length == 0)
            return;

        const loginResult = await Api.login(username, password)
        
        if (!loginResult.success){
            setErrormessage(translateResult(loginResult.error))
            return;
        }

        Api.setBearerToken(loginResult.bearerToken);
        const db = await getDBConnection();
        const succ = await writeBearerToken(db, loginResult.bearerToken);

        navigation.navigate("Sync")
      }
    
    const theme = useColorScheme();

    const style = StyleSheet.create({
        text: {
            color: 'white',
            fontSize: 18,
            marginBottom: 20,
        },
        logo: {
            marginBottom: -5,
            width:260,
            height:94
        },
        logininputs: {
            width:240,
            fontSize:16,
            borderRadius: 5,
            borderWidth:1,
            color: '#a0a0a0',
            borderColor: '#0598DF',
            marginBottom:5,
            height: 48,
            padding: 10,
            paddingVertical: 8,
            backgroundColor: (theme == "light" ? '#FFFFFF' : '#121212'),
        },
        login: {
            borderRadius: 5,
            backgroundColor: 'none',
            padding: 20,
            paddingVertical: 14,
            height: 48,
            elevation: 2,
        },
        account: {
            fontSize: 14,
            position: 'absolute',
            bottom: 40, 
            color: '#C8ECFD'
        },
        getOne:{
            color: '#fff', 
            fontWeight: '600'
        },
        error:{
            fontWeight: '600',
            color: '#fff',
            height: 20,
        }
    })


    return (<KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[divelogsStyle.centeredView, {backgroundColor:'#3fb9f2'}]}>
            <AppHeader style={[style.logo]}/>
            <TextInput placeholder="username" style={style.logininputs} onChangeText={newText => change(setUsername, newText)} autoCapitalize="none"/>
            <TextInput placeholder="password" secureTextEntry={true} style={style.logininputs} onSubmitEditing={() => doLogin()} onChangeText={newText => change(setPassword,newText)}/>
            <Pressable
              accessibilityLabel='login'
              style={style.login}
              onPress={() => doLogin()}>
              <Text style={[divelogsStyle.textStyle, {fontSize: 16}]}>Login</Text>
            </Pressable>
                <Text style={style.error}>
                    {errorMessage.length == 0 ? null : `⚠ ${errorMessage}`}
                </Text>
            <Text style={style.account}>
                {t('noaccount')}
                <TouchableOpacity style={{marginTop: -3}} onPress={() => Linking.openURL("https://divelogs.de/register.php")}>
                    <Text style={style.getOne}> {t('getone')}</Text>            
                </TouchableOpacity>
            </Text>
    </KeyboardAvoidingView>)
}

export default Login