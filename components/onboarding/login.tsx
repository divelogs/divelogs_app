import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import {SafeAreaView,Text,TextInput,View,Dimensions, Linking, Alert, Modal, Pressable, NativeModules, StyleSheet, TouchableOpacity } from 'react-native';

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
                return t("couldnotlogin")
        }
    }

    const change = (func:any, text:string) => {
        func(text)
        setErrormessage('')
    } 

    const doLogin = async () => {

        const loginResult = await Api.login(username, password)
        
        if (!loginResult.success){
            setErrormessage(translateResult(loginResult.error))
            return;
        }

        console.log(loginResult.bearerToken)

        Api.setBearerToken(loginResult.bearerToken);
        const db = await getDBConnection();
        const succ = await writeBearerToken(db, loginResult.bearerToken);

        navigation.navigate("Sync")
      }
    



    return (<View style={[divelogsStyle.centeredView, {backgroundColor:'#3fb9f2'}]}>
            <AppHeader style={[style.logo]}/>

            <TextInput placeholder="username" style={style.logininputs} onChangeText={newText => change(setUsername, newText)} autoCapitalize="none"/>
            <TextInput placeholder="password" secureTextEntry={true} style={style.logininputs} onSubmitEditing={() => doLogin()} onChangeText={newText => change(setPassword,newText)}/>
            <Pressable
              style={style.login}
              onPress={() => doLogin()}>
              <Text style={[divelogsStyle.textStyle, {fontSize: 16}]}>Login</Text>
            </Pressable>

            {errorMessage.length == 0 ? null :
                <Text style={style.error}>
                    ⚠ {errorMessage}
                </Text>
            }
            
            <Text style={style.account}>
                No divelogs.de account? 
                <TouchableOpacity style={{marginTop: -3}} onPress={() => Linking.openURL("https://divelogs.de/register.php")}>
                    <Text style={style.getOne}> Get one!</Text>            
                </TouchableOpacity>
            </Text>
    </View>)
}

const style = StyleSheet.create({
    text: {
        color: 'white',
        fontSize: 18,
        marginBottom: 20,
    },
    logo: {
        marginBottom: -15,
        width:260,
        height:94
    },
    logininputs: {
        width:240,
        fontSize:16,
        borderRadius: 5,
        borderWidth:1,
        borderColor: '#0598DF',
        marginBottom:5,
        padding: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    login: {
        borderRadius: 5,
        backgroundColor: 'none',
        padding: 10,
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
        position: 'absolute',
        bottom: 120,
        fontWeight: '600',
        color: '#fff'
    }
})

export default Login