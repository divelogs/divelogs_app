import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../../assets/svgs.js'
import styles from '../../stylesheets/styles'

const AppHeader = ({style}:any) => <SvgXml style={style ?? styles.tinyLogo} xml={divelogs_logo} />

export default AppHeader