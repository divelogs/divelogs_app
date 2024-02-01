import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { getDiveCount } from '../../services/db-aggregation-service'
import { getDBConnection } from '../../services/db-service'
import divelogsStyle from '../../stylesheets/styles'
import '../../translation'
import { useTranslation } from 'react-i18next';

const SyncFail = ({navigation, route}:any) => {

    const { t } = useTranslation(); 

    const [hasDivesInDatabase, setHasDivesInDatabase] = useState<boolean|null>(null)

    useEffect(() => {
        (async () => {
            const db = await getDBConnection()
            const dc = await getDiveCount(db)
            setHasDivesInDatabase(dc > 0)
        })()
    }, [])


    let text:string = "";
    let step:string = "";
    try {
        step = route.params.step
        if (route.params.err?.message)
            text = route.params.err.message
        else
            text = route.params.err
    }
    catch(e) {
        text = "Error occured"
    }

    const Buttons = () => {
        if (hasDivesInDatabase)
            return <Button onPress={() => {navigation.replace("Home")}}
                            title={t("close")}
                            accessibilityLabel="Return to App"
                            color={'white'}/>
        return <Button onPress={() => {navigation.replace("Login")}}
                        title={t("returnToLogin")}
                        accessibilityLabel="Return to Login"
                        color={'white'}/>
    }

    return (<View style={[divelogsStyle.centeredView, {backgroundColor:'#3fb9f2'}]}>
        <View style={{padding: 20}}>
            <Text style={[style.warn]}>⚠</Text>
            <Text style={[style.text, { fontWeight: "700", marginBottom: 5 }]}>{t("cantLoadDataAtThisTime")}</Text>
            <Text style={[style.text, {marginBottom: 20}]}>{t("step")}: {text}</Text>
            {hasDivesInDatabase == null ? null : <Buttons/> }
        </View>
    </View> 
  );
};

const style = StyleSheet.create({
    warn: {
        color: 'white',
        textAlign: 'center', 
        fontSize: 50,
        marginTop: -20,
        marginBottom: 10,
        fontWeight: '300'
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    button: {
        color: 'white',

    }    
})

export default SyncFail

